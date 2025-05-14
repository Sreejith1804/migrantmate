import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Building2, Clock, Briefcase, MapPin, CreditCard, FileText, Send } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { format } from "date-fns";

type Application = {
  id: number;
  jobId: number;
  workerId: number;
  status: string;
  resume: string | null;
  coverLetter: string | null;
  employerNotes: string | null;
  requestedDocuments: string | null;
  createdAt: string;
  job: {
    id: number;
    employerId: number;
    title: string;
    description: string;
    location: string;
    salary: string;
    createdAt: string;
  };
};

export default function MyApplications() {
  const { user } = useAuth();
  const { translate } = useLanguage();
  const { toast } = useToast();
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [resume, setResume] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  
  const { data: applications, isLoading, error } = useQuery<Application[]>({
    queryKey: ["/api/applications/worker", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not found");
      const res = await fetch(`/api/applications/worker/${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    },
    enabled: !!user?.id,
  });
  
  const updateApplicationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: { resume: string, coverLetter: string } }) => {
      const res = await apiRequest(
        "PATCH", 
        `/api/applications/${id}/details?workerId=${user?.id}`, 
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications/worker", user?.id] });
      toast({
        title: translate("Application Updated"),
        description: translate("Your application has been updated successfully."),
      });
      setOpenDialog(false);
    },
    onError: (error) => {
      toast({
        title: translate("Failed to update application"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitAdditionalInfo = () => {
    if (!selectedApplication) return;
    
    updateApplicationMutation.mutate({
      id: selectedApplication.id,
      data: {
        resume,
        coverLetter
      }
    });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          {translate("Pending")}
        </Badge>;
      case "accepted":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          {translate("Accepted")}
        </Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          {translate("Rejected")}
        </Badge>;
      default:
        return <Badge variant="outline">{translate(status)}</Badge>;
    }
  };
  
  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setResume(application.resume || "");
    setCoverLetter(application.coverLetter || "");
    setOpenDialog(true);
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-bold mb-6">{translate("My Applications")}</h1>
          
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">{translate("Loading applications...")}</p>
            </div>
          ) : error ? (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <p className="text-red-700">{translate("Failed to load applications. Please try again later.")}</p>
              </CardContent>
            </Card>
          ) : applications && applications.length > 0 ? (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="all">{translate("All Applications")}</TabsTrigger>
                <TabsTrigger value="pending">{translate("Pending")}</TabsTrigger>
                <TabsTrigger value="accepted">{translate("Accepted")}</TabsTrigger>
                <TabsTrigger value="rejected">{translate("Rejected")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                {applications.map((application) => (
                  <ApplicationCard 
                    key={application.id} 
                    application={application} 
                    getStatusBadge={getStatusBadge}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </TabsContent>
              
              <TabsContent value="pending" className="space-y-4">
                {applications
                  .filter(a => a.status === "pending")
                  .map((application) => (
                    <ApplicationCard 
                      key={application.id} 
                      application={application} 
                      getStatusBadge={getStatusBadge}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
              </TabsContent>
              
              <TabsContent value="accepted" className="space-y-4">
                {applications
                  .filter(a => a.status === "accepted")
                  .map((application) => (
                    <ApplicationCard 
                      key={application.id} 
                      application={application} 
                      getStatusBadge={getStatusBadge}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
              </TabsContent>
              
              <TabsContent value="rejected" className="space-y-4">
                {applications
                  .filter(a => a.status === "rejected")
                  .map((application) => (
                    <ApplicationCard 
                      key={application.id} 
                      application={application}
                      getStatusBadge={getStatusBadge}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Briefcase className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">{translate("No Applications Found")}</h3>
                <p className="text-gray-600 text-center max-w-md">
                  {translate("You haven't applied to any jobs yet. Start browsing available opportunities.")}
                </p>
                <Button className="mt-6" asChild>
                  <a href="/worker/search-jobs">{translate("Find Jobs")}</a>
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Additional Information Dialog */}
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{translate("Application Details")}</DialogTitle>
                <DialogDescription>
                  {selectedApplication?.job.title} - {getStatusBadge(selectedApplication?.status || "pending")}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {selectedApplication?.requestedDocuments && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                    <h4 className="font-medium text-amber-800 mb-2">{translate("Documents Requested:")}</h4>
                    <p className="text-sm text-amber-700">{selectedApplication.requestedDocuments}</p>
                  </div>
                )}
                
                {selectedApplication?.employerNotes && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">{translate("Employer Notes:")}</h4>
                    <div className="p-4 bg-gray-50 border rounded-md">
                      <p className="text-gray-700">{selectedApplication.employerNotes}</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">{translate("Your Resume:")}</h4>
                  <Textarea
                    placeholder={translate("Enter your resume or paste a link to your resume")}
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">{translate("Cover Letter:")}</h4>
                  <Textarea
                    placeholder={translate("Write a cover letter explaining why you're a good fit for this position")}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => setOpenDialog(false)}
                  variant="outline"
                >
                  {translate("Cancel")}
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmitAdditionalInfo}
                  disabled={updateApplicationMutation.isPending}
                >
                  {updateApplicationMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                      {translate("Submitting...")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      {translate("Submit Information")}
                    </span>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
}

type ApplicationCardProps = {
  application: Application;
  getStatusBadge: (status: string) => React.ReactNode;
  onViewDetails: (application: Application) => void;
};

function ApplicationCard({ application, getStatusBadge, onViewDetails }: ApplicationCardProps) {
  const { translate } = useLanguage();
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 bg-gray-50">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{application.job.title}</CardTitle>
            <CardDescription className="mt-1 flex items-center">
              <Building2 className="h-4 w-4 mr-1" />
              <span>Employer #{application.job.employerId}</span>
              <span className="mx-2">•</span>
              <Clock className="h-4 w-4 mr-1" />
              <span>Applied {format(new Date(application.createdAt), 'MMM d, yyyy')}</span>
            </CardDescription>
          </div>
          <div>{getStatusBadge(application.status)}</div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-start space-x-8">
            <div className="flex items-start gap-2 min-w-[200px]">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-700 mb-0.5">{translate("Location")}</div>
                <div className="text-sm text-gray-600">{application.job.location}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <CreditCard className="h-4 w-4 text-gray-500 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-700 mb-0.5">{translate("Salary")}</div>
                <div className="text-sm text-gray-600">{application.job.salary}</div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-700">{translate("Job Description")}</div>
            <p className="text-gray-600 text-sm line-clamp-2">{application.job.description}</p>
          </div>
          
          {application.requestedDocuments && (
            <>
              <Separator />
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-700">{translate("Documents Requested")}</div>
                <p className="text-amber-600 text-sm">{application.requestedDocuments}</p>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 pt-3 flex justify-between">
        <span className="text-sm text-gray-500">
          {application.status === "accepted" ? (
            translate("Your application has been accepted!")
          ) : application.status === "rejected" ? (
            translate("Your application was not selected.")
          ) : (
            translate("Your application is being reviewed.")
          )}
        </span>
        <Button 
          size="sm" 
          variant={application.requestedDocuments ? "default" : "outline"}
          onClick={() => onViewDetails(application)}
        >
          <FileText className="h-4 w-4 mr-2" />
          {application.requestedDocuments 
            ? translate("Provide Documents") 
            : translate("View Details")}
        </Button>
      </CardFooter>
    </Card>
  );
}