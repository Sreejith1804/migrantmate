import { useQuery } from "@tanstack/react-query";
import type { Job as BaseJob } from "@shared/schema";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, DollarSign, Calendar } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { JobDetailsModal } from "@/components/ui/job-details-modal";

// ✅ Extend the Job type to include the enriched fields returned from backend
type Job = BaseJob & {
  jobType?: string;
  jobSubtype?: string;
  employerName: string;
  companyName: string;
  designation: string;
  industry: string;
};

export default function SearchJobs() {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setModalOpen(true);
  };

  const applyForJob = async (jobId: number) => {
    if (!user) return;

    try {
      await apiRequest("POST", `/api/applications?workerId=${user.id}`, { jobId });
      toast({
        title: "Application Submitted",
        description: "Your job application has been successfully submitted.",
      });
    } catch (error) {
      toast({
        title: "Application Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {translate("Available Jobs")}
          </h1>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !jobs || jobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-lg text-gray-600">
                  No jobs available at the moment. Please check back later.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <Card key={job.id} className="h-full flex flex-col">
                  <CardHeader>
                    <CardTitle>{job.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-2">
                    <p className="text-gray-600 line-clamp-3">
                      {job.description}
                    </p>
                    <div className="text-sm text-gray-500">
                      <p><strong>Company:</strong> {job.companyName}</p>
                      <p><strong>Posted By:</strong> {job.employerName}</p>
                      <p><strong>Designation:</strong> {job.designation}</p>
                      <p><strong>Industry:</strong> {job.industry}</p>
                    </div>
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span>{job.salary}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Posted on {format(job.createdAt, "PP")}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleViewDetails(job)}
                    >
                      View Details
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => applyForJob(job.id)}
                    >
                      {translate("Apply Now")}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <JobDetailsModal
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />

      <Footer />
    </div>
  );
}
