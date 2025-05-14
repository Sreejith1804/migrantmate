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
