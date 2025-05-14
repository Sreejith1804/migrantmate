import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema with role discrimination
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["worker", "employer"] }).notNull().default("worker"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
});

// Worker-specific details
export const workerProfiles = pgTable("worker_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  skills: text("skills").notNull(),
});

// Employer-specific details
export const employerProfiles = pgTable("employer_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  companyName: text("company_name").notNull(),
  designation: text("designation").notNull(),
  industry: text("industry").notNull(),
});

// Job listings
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  employerId: integer("employer_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  salary: text("salary").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Job applications
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  workerId: integer("worker_id").notNull().references(() => users.id),
  status: text("status", { enum: ["pending", "accepted", "rejected"] }).notNull().default("pending"),
  appliedAt: timestamp("applied_at").notNull().defaultNow(),
  resume: text("resume"),
  coverLetter: text("cover_letter"),
  employerNotes: text("employer_notes"),
  requestedDocuments: text("requested_documents"),
});

// Base user schema
export const insertUserSchema = createInsertSchema(users).omit({
  id: true
});

// Worker registration schema
export const workerRegistrationSchema = insertUserSchema.extend({
  skills: z.string().min(1, "Skills are required"),
  role: z.literal("worker"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Employer registration schema
export const employerRegistrationSchema = insertUserSchema.extend({
  companyName: z.string().min(1, "Company name is required"),
  designation: z.string().min(1, "Designation is required"),
  industry: z.string().min(1, "Industry is required"),
  role: z.literal("employer"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Job schema
export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  employerId: true,
  createdAt: true,
});

// Application schema
export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  workerId: true,
  status: true,
  appliedAt: true,
});

// Notifications schema
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  type: text("type").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  relatedId: integer("related_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type WorkerRegistration = z.infer<typeof workerRegistrationSchema>;
export type EmployerRegistration = z.infer<typeof employerRegistrationSchema>;
export type Login = z.infer<typeof loginSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
