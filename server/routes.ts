import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { 
  insertJobSchema,
  insertApplicationSchema
} from "@shared/schema";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication and session handling
  setupAuth(app);

  // Jobs routes
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getAllJobs();
      return res.status(200).json(jobs);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const { employerId } = req.query;
      
      if (!employerId || typeof employerId !== 'string') {
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
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Applications routes
  app.get("/api/applications/worker/:workerId", async (req, res) => {
    try {
      const { workerId } = req.params;
      
      if (!workerId) {
        return res.status(400).json({ message: "Worker ID is required" });
      }
      
      const applications = await storage.getApplicationsByWorkerId(parseInt(workerId));
      return res.status(200).json(applications);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/applications/employer/:employerId", async (req, res) => {
    try {
      const { employerId } = req.params;
      
      if (!employerId) {
        return res.status(400).json({ message: "Employer ID is required" });
      }
      
      const applications = await storage.getApplicationsByEmployerId(parseInt(employerId));
      return res.status(200).json(applications);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/applications", async (req, res) => {
    try {
      const { workerId } = req.query;
      
      if (!workerId || typeof workerId !== 'string') {
        return res.status(400).json({ message: "Worker ID is required" });
      }
      
      const validatedData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication({
        ...validatedData,
        workerId: parseInt(workerId),
      });
      
      // Get job details for notification
      const job = await storage.getJob(validatedData.jobId);
      if (job) {
        // Create notification for the employer
        await storage.createNotification({
          userId: job.employerId,
          message: `New application received for job: ${job.title}`,
          type: "job_application",
          isRead: false,
          relatedId: application.id
        });
        
        // Also create notification for the worker
        await storage.createNotification({
          userId: parseInt(workerId),
          message: `You have applied for the job: ${job.title}`,
          type: "application_submitted",
          isRead: false,
          relatedId: application.id
        });
      }
      
      return res.status(201).json(application);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Application status update
  app.patch("/api/applications/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ message: "Application ID is required" });
      }
      
      const appId = parseInt(id);
      const { status, employerNotes, requestedDocuments } = req.body;
      
      // Update application
      const updatedApplication = await storage.updateApplication(appId, {
        status,
        employerNotes,
        requestedDocuments
      });
      
      if (!updatedApplication) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Send notification to worker about status change
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
            relatedId: appId
          });
        }
      }
      
      return res.status(200).json(updatedApplication);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Submit additional application details (for worker to respond to employer's request)
  app.patch("/api/applications/:id/details", async (req, res) => {
    try {
      const { id } = req.params;
      const { workerId } = req.query;
      
      if (!id) {
        return res.status(400).json({ message: "Application ID is required" });
      }
      
      if (!workerId || typeof workerId !== 'string') {
        return res.status(400).json({ message: "Worker ID is required" });
      }
      
      const appId = parseInt(id);
      const { resume, coverLetter } = req.body;
      
      // Get application to verify worker is the owner
      const application = await storage.getApplication(appId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      if (application.workerId !== parseInt(workerId)) {
        return res.status(403).json({ message: "Not authorized to update this application" });
      }
      
      // Update application
      const updatedApplication = await storage.updateApplication(appId, {
        resume,
        coverLetter
      });
      
      // Notify employer about updated application
      const job = await storage.getJob(application.jobId);
      
      if (job) {
        await storage.createNotification({
          userId: job.employerId,
          message: `A worker has updated their application for "${job.title}" with additional details`,
          type: "application_details_update",
          isRead: false,
          relatedId: appId
        });
      }
      
      return res.status(200).json(updatedApplication);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Notifications routes
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const notifications = await storage.getNotificationsByUserId(parseInt(userId));
      return res.status(200).json(notifications);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/notifications/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ message: "Notification ID is required" });
      }
      
      await storage.markNotificationAsRead(parseInt(id));
      return res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
