import { 
  users, 
  workerProfiles, 
  employerProfiles, 
  jobs, 
  applications, 
  notifications,
  type User, 
  type InsertUser,
  type Job,
  type Application,
  type Notification,
  type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User related methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Worker profile methods
  createWorkerProfile(profile: { userId: number, skills: string }): Promise<void>;
  getWorkerProfile(userId: number): Promise<{ userId: number, skills: string } | undefined>;
  
  // Employer profile methods
  createEmployerProfile(profile: { 
    userId: number, 
    companyName: string, 
    designation: string, 
    industry: string 
  }): Promise<void>;
  getEmployerProfile(userId: number): Promise<{
    userId: number, 
    companyName: string, 
    designation: string, 
    industry: string
  } | undefined>;
  
  // Job methods
  createJob(job: { 
    employerId: number, 
    title: string, 
    description: string, 
    location: string, 
    salary: string 
  }): Promise<Job>;
  getJob(id: number): Promise<Job | undefined>;
  getAllJobs(): Promise<Job[]>;
  getJobsByEmployerId(employerId: number): Promise<Job[]>;
  
  // Application methods
  createApplication(application: { jobId: number, workerId: number }): Promise<Application>;
  getApplicationsByWorkerId(workerId: number): Promise<(Application & { job: Job })[]>;
  getApplicationsByEmployerId(employerId: number): Promise<(Application & { job: Job })[]>;
  
  // Notification methods
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;

  // Session store 
  sessionStore: any; // Fixed type issue with SessionStore
}

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Using any to resolve type issue

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'sessions'
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  // Worker profile methods
  async createWorkerProfile(profile: { userId: number, skills: string }): Promise<void> {
    await db.insert(workerProfiles).values({
      userId: profile.userId,
      skills: profile.skills
    });
  }

  async getWorkerProfile(userId: number): Promise<{ userId: number, skills: string } | undefined> {
    const [profile] = await db.select().from(workerProfiles).where(eq(workerProfiles.userId, userId));
    if (!profile) return undefined;
    return {
      userId: profile.userId,
      skills: profile.skills
    };
  }

  // Employer profile methods
  async createEmployerProfile(profile: { 
    userId: number, 
    companyName: string, 
    designation: string, 
    industry: string 
  }): Promise<void> {
    await db.insert(employerProfiles).values({
      userId: profile.userId,
      companyName: profile.companyName,
      designation: profile.designation,
      industry: profile.industry
    });
  }

  async getEmployerProfile(userId: number): Promise<{
    userId: number, 
    companyName: string, 
    designation: string, 
    industry: string
  } | undefined> {
    const [profile] = await db.select().from(employerProfiles).where(eq(employerProfiles.userId, userId));
    if (!profile) return undefined;
    return {
      userId: profile.userId,
      companyName: profile.companyName,
      designation: profile.designation,
      industry: profile.industry
    };
  }

  // Job methods
  async createJob(jobData: { 
    employerId: number, 
    title: string, 
    description: string, 
    location: string, 
    salary: string 
  }): Promise<Job> {
    const [job] = await db.insert(jobs).values(jobData).returning();
    return job;
  }

  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async getAllJobs(): Promise<Job[]> {
    return await db.select().from(jobs);
  }

  async getJobsByEmployerId(employerId: number): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.employerId, employerId));
  }

  // Application methods
  async createApplication(applicationData: { jobId: number, workerId: number }): Promise<Application> {
    const [application] = await db.insert(applications).values(applicationData).returning();
    return application;
  }

  async getApplicationsByWorkerId(workerId: number): Promise<(Application & { job: Job })[]> {
    // This is a simplified implementation since we can't do proper joins with drizzle
    // in a simple way. In a real app we'd use SQL or a more sophisticated ORM query
    const workerApplications = await db.select().from(applications)
      .where(eq(applications.workerId, workerId));
    
    const result = [];
    for (const app of workerApplications) {
      const job = await this.getJob(app.jobId);
      if (job) {
        result.push({...app, job});
      }
    }
    
    return result;
  }

  async getApplicationsByEmployerId(employerId: number): Promise<(Application & { job: Job })[]> {
    // Get all jobs by this employer
    const employerJobs = await this.getJobsByEmployerId(employerId);
    const jobIds = employerJobs.map(job => job.id);
    
    const result = [];
    for (const jobId of jobIds) {
      const jobApplications = await db.select().from(applications)
        .where(eq(applications.jobId, jobId));
      
      for (const app of jobApplications) {
        const job = employerJobs.find(j => j.id === jobId);
        if (job) {
          result.push({...app, job});
        }
      }
    }
    
    return result;
  }

  // Notification methods
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values({
      ...notificationData,
      isRead: notificationData.isRead ?? false,
      relatedId: notificationData.relatedId ?? null
    }).returning();
    
    return notification;
  }

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId));
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }
}

export const storage = new DatabaseStorage();