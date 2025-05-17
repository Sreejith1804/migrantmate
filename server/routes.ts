import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import {
  insertJobSchema,
  insertApplicationSchema,
} from "@shared/schema";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Get all jobs
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getAllJobs();
      return res.status(200).json(jobs);
    } catch (error) {
      console.error("❌ Failed to fetch jobs:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Post a new job
  app.post("/api/jobs", async (req, res) => {
    try {
      const { employerId } = req.query;

      if (!employerId || typeof employerId !== "string") {
        return res.status(400).json({ message: "Employer ID is required" });
      }

      const validatedData = insertJobSchema.parse(req.body);
      const job = await storage.createJob({
        ...validatedData,
        employerId: parseInt(employerId),
      });

      return res.status(201).json(job);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }

      // ✅ This logs the full error
      console.error("❌ Job creation error:", error);

      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get worker's applications
  app.get("/api/applications/worker/:workerId", async (req, res) => {
    try {
      const { workerId } = req.params;
      if (!workerId) {
        return res.status(400).json({ message: "Worker ID is required" });
      }
      const applications = await storage.getApplicationsByWorkerId(
        parseInt(workerId)
      );
      return res.status(200).json(applications);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get employer's applications
  app.get("/api/applications/employer/:employerId", async (req, res) => {
    try {
      const { employerId } = req.params;
      if (!employerId) {
        return res.status(400).json({ message: "Employer ID is required" });
      }
      const applications = await storage.getApplicationsByEmployerId(
        parseInt(employerId)
      );
      return res.status(200).json(applications);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Submit a job application
  app.post("/api/applications", async (req, res) => {
    try {
      const { workerId } = req.query;
      if (!workerId || typeof workerId !== "string") {
        return res.status(400).json({ message: "Worker ID is required" });
      }

      const validatedData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication({
        ...validatedData,
        workerId: parseInt(workerId),
      });

      const job = await storage.getJob(validatedData.jobId);
      if (job) {
        await storage.createNotification({
          userId: job.employerId,
          message: `New application received for job: ${job.title}`,
          type: "job_application",
          isRead: false,
          relatedId: application.id,
        });

        await storage.createNotification({
          userId: parseInt(workerId),
          message: `You have applied for the job: ${job.title}`,
          type: "application_submitted",
          isRead: false,
          relatedId: application.id,
        });
      }

      return res.status(201).json(application);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("❌ Application submission error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update application status
  app.patch("/api/applications/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "Application ID is required" });
      }

      const appId = parseInt(id);
      const { status, employerNotes, requestedDocuments } = req.body;

      const updatedApplication = await storage.updateApplication(appId, {
        status,
        employerNotes,
        requestedDocuments,
      });

      if (!updatedApplication) {
        return res.status(404).json({ message: "Application not found" });
      }

      const job = await storage.getJob(updatedApplication.jobId);
      if (job && status) {
        let notificationMessage = "";

        if (status === "accepted") {
          notificationMessage = `Your application for "${job.title}" has been accepted`;
          if (requestedDocuments) {
            notificationMessage += `. Please provide the following documents: ${requestedDocuments}`;
          }
        } else if (status === "rejected") {
          notificationMessage = `Your application for "${job.title}" has been rejected`;
        } else if (employerNotes) {
          notificationMessage = `The employer has added notes to your application for "${job.title}"`;
        }

        if (notificationMessage) {
          await storage.createNotification({
            userId: updatedApplication.workerId,
            message: notificationMessage,
            type: "application_update",
            isRead: false,
            relatedId: appId,
          });
        }
      }

      return res.status(200).json(updatedApplication);
    } catch (error) {
      console.error("❌ Application status update error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update application details (resume, cover letter)
  app.patch("/api/applications/:id/details", async (req, res) => {
    try {
      const { id } = req.params;
      const { workerId } = req.query;

      if (!id) {
        return res.status(400).json({ message: "Application ID is required" });
      }

      if (!workerId || typeof workerId !== "string") {
        return res.status(400).json({ message: "Worker ID is required" });
      }

      const appId = parseInt(id);
      const { resume, coverLetter } = req.body;

      const application = await storage.getApplication(appId);

      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      if (application.workerId !== parseInt(workerId)) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updatedApplication = await storage.updateApplication(appId, {
        resume,
        coverLetter,
      });

      const job = await storage.getJob(application.jobId);
      if (job) {
        await storage.createNotification({
          userId: job.employerId,
          message: `A worker has updated their application for "${job.title}"`,
          type: "application_details_update",
          isRead: false,
          relatedId: appId,
        });
      }

      return res.status(200).json(updatedApplication);
    } catch (error) {
      console.error("❌ Application details update error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get notifications
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      const notifications = await storage.getNotificationsByUserId(parseInt(userId));
      return res.status(200).json(notifications);
    } catch (error) {
      console.error("❌ Fetch notifications error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mark notification as read
  app.post("/api/notifications/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "Notification ID is required" });
      }
      await storage.markNotificationAsRead(parseInt(id));
      return res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("❌ Mark notification error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
