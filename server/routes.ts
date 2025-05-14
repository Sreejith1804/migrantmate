import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { 
  loginSchema, 
  workerRegistrationSchema, 
  employerRegistrationSchema,
  insertJobSchema,
  insertApplicationSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(validatedData.username);
      
      if (!user || user.password !== validatedData.password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Worker registration
  app.post("/api/register/worker", async (req, res) => {
    try {
      const validatedData = workerRegistrationSchema.parse(req.body);
      const { confirmPassword, skills, ...userData } = validatedData;
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      // Create user
      const user = await storage.createUser(userData);
      
      // Create worker profile
      await storage.createWorkerProfile({
        userId: user.id,
        skills,
      });
      
      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Employer registration
  app.post("/api/register/employer", async (req, res) => {
    try {
      const validatedData = employerRegistrationSchema.parse(req.body);
      const { confirmPassword, companyName, designation, industry, ...userData } = validatedData;
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      // Create user
      const user = await storage.createUser(userData);
      
      // Create employer profile
      await storage.createEmployerProfile({
        userId: user.id,
        companyName,
        designation,
        industry,
      });
      
      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

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
