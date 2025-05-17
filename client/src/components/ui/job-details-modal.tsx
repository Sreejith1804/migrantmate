import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import type { Job as BaseJob } from "@shared/schema";

// ✅ Extend the base Job type to include enriched fields from getAllJobs()
type Job = BaseJob & {
  jobType?: string;
  jobSubtype?: string;
  employerName?: string;
  companyName?: string;
  designation?: string;
  industry?: string;
};

interface Props {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export function JobDetailsModal({ job, isOpen, onClose }: Props) {
  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{job.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>Type:</strong>{" "}
            {job.jobType ?? "Not specified"} - {job.jobSubtype ?? "Not specified"}
          </p>
          <p>
            <strong>Description:</strong> {job.description}
          </p>
          <p>
            <strong>Location:</strong> {job.location}
          </p>
          <p>
            <strong>Salary:</strong> {job.salary}
          </p>
          <p>
            <strong>Posted By:</strong> {job.employerName ?? "N/A"}
          </p>
          <p>
            <strong>Company:</strong> {job.companyName ?? "N/A"}
          </p>
          <p>
            <strong>Designation:</strong> {job.designation ?? "N/A"}
          </p>
          <p>
            <strong>Industry:</strong> {job.industry ?? "N/A"}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
