import { 
  users, 
  workerProfiles, 
  employerProfiles, 
  jobs, 
  applications, 
  type User, 
  type InsertUser,
  type Job,
  type Application
} from "@shared/schema";

// Storage interface
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
  getAllJobs(): Promise<Job[]>;
  getJobsByEmployerId(employerId: number): Promise<Job[]>;
  
  // Application methods
  createApplication(application: { jobId: number, workerId: number }): Promise<Application>;
  getApplicationsByWorkerId(workerId: number): Promise<(Application & { job: Job })[]>;
  getApplicationsByEmployerId(employerId: number): Promise<(Application & { job: Job })[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private workerProfiles: Map<number, { userId: number, skills: string }>;
  private employerProfiles: Map<number, { 
    userId: number, 
    companyName: string, 
    designation: string, 
    industry: string 
  }>;
  private jobs: Map<number, Job>;
  private applications: Map<number, Application>;
  
  private userId = 1;
  private workerProfileId = 1;
  private employerProfileId = 1;
  private jobId = 1;
  private applicationId = 1;

  constructor() {
    this.users = new Map();
    this.workerProfiles = new Map();
    this.employerProfiles = new Map();
    this.jobs = new Map();
    this.applications = new Map();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...userData, id };
    this.users.set(id, user);
    return user;
  }

  // Worker profile methods
  async createWorkerProfile(profile: { userId: number, skills: string }): Promise<void> {
    const id = this.workerProfileId++;
    this.workerProfiles.set(id, profile);
  }

  async getWorkerProfile(userId: number): Promise<{ userId: number, skills: string } | undefined> {
    return Array.from(this.workerProfiles.values()).find(
      (profile) => profile.userId === userId,
    );
  }

  // Employer profile methods
  async createEmployerProfile(profile: { 
    userId: number, 
    companyName: string, 
    designation: string, 
    industry: string 
  }): Promise<void> {
    const id = this.employerProfileId++;
    this.employerProfiles.set(id, profile);
  }

  async getEmployerProfile(userId: number): Promise<{
    userId: number, 
    companyName: string, 
    designation: string, 
    industry: string
  } | undefined> {
    return Array.from(this.employerProfiles.values()).find(
      (profile) => profile.userId === userId,
    );
  }

  // Job methods
  async createJob(jobData: { 
    employerId: number, 
    title: string, 
    description: string, 
    location: string, 
    salary: string 
  }): Promise<Job> {
    const id = this.jobId++;
    const createdAt = new Date();
    const job: Job = { ...jobData, id, createdAt };
    this.jobs.set(id, job);
    return job;
  }

  async getAllJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values());
  }

  async getJobsByEmployerId(employerId: number): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(
      (job) => job.employerId === employerId,
    );
  }

  // Application methods
  async createApplication(applicationData: { jobId: number, workerId: number }): Promise<Application> {
    const id = this.applicationId++;
    const status = "pending";
    const appliedAt = new Date();
    const application: Application = { ...applicationData, id, status, appliedAt };
    this.applications.set(id, application);
    return application;
  }

  async getApplicationsByWorkerId(workerId: number): Promise<(Application & { job: Job })[]> {
    return Array.from(this.applications.values())
      .filter((application) => application.workerId === workerId)
      .map((application) => {
        const job = this.jobs.get(application.jobId)!;
        return { ...application, job };
      });
  }

  async getApplicationsByEmployerId(employerId: number): Promise<(Application & { job: Job })[]> {
    const employerJobs = await this.getJobsByEmployerId(employerId);
    const jobIds = new Set(employerJobs.map(job => job.id));
    
    return Array.from(this.applications.values())
      .filter((application) => jobIds.has(application.jobId))
      .map((application) => {
        const job = this.jobs.get(application.jobId)!;
        return { ...application, job };
      });
  }
}

export const storage = new MemStorage();
