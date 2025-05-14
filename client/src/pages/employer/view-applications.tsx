import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Check, X, File, User, Clock, FileText, ThumbsUp, ThumbsDown, CircleEllipsis } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

export default function ViewApplications() {
  const { user } = useAuth();
  const { translate } = useLanguage();
  const { toast } = useToast();
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [employerNotes, setEmployerNotes] = useState("");
  const [requestedDocuments, setRequestedDocuments] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusUpdateType, setStatusUpdateType] = useState<"accept" | "reject" | "request">("accept");
  
  const { data: applications, isLoading, error } = useQuery<Application[]>({
    queryKey: ["/api/applications/employer", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not found");
      const res = await fetch(`/api/applications/employer/${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    },
    enabled: !!user?.id,
  });
  
  const updateApplicationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: { status?: string; employerNotes?: string; requestedDocuments?: string } }) => {
      const res = await apiRequest("PATCH", `/api/applications/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications/employer", user?.id] });
      toast({
        title: translate("Application Updated"),
        description: translate("The application has been updated successfully."),
      });
      setDialogOpen(false);
      resetFormState();
    },
    onError: (error) => {
      toast({
        title: translate("Failed to update application"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const resetFormState = () => {
    setEmployerNotes("");
    setRequestedDocuments("");
    setStatusUpdateType("accept");
    setSelectedApplication(null);
  };
  
  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setEmployerNotes(application.employerNotes || "");
    setRequestedDocuments(application.requestedDocuments || "");
  };
  
  const handleStatusUpdate = (application: Application, type: "accept" | "reject" | "request") => {
    setSelectedApplication(application);
    setStatusUpdateType(type);
    setDialogOpen(true);
  };
  
  const submitStatusUpdate = () => {
    if (!selectedApplication) return;
    
    const data: {
      status?: string;
      employerNotes?: string;
      requestedDocuments?: string;
    } = {};
    
    if (statusUpdateType === "accept") {
      data.status = "accepted";
      data.employerNotes = employerNotes;
      if (requestedDocuments.trim()) {
        data.requestedDocuments = requestedDocuments;
      }
    } else if (statusUpdateType === "reject") {
      data.status = "rejected";
      data.employerNotes = employerNotes;
    } else if (statusUpdateType === "request") {
      data.employerNotes = employerNotes;
      data.requestedDocuments = requestedDocuments;
    }
    
    updateApplicationMutation.mutate({
      id: selectedApplication.id,
      data
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
  
  const getDialogTitle = () => {
    switch (statusUpdateType) {
      case "accept":
        return translate("Accept Application");
      case "reject":
        return translate("Reject Application");
      case "request":
        return translate("Request Additional Information");
      default:
        return translate("Update Application");
    }
  };
  
  const getDialogDescription = () => {
    if (!selectedApplication) return "";
    
    switch (statusUpdateType) {
      case "accept":
        return translate(`Accepting application for: ${selectedApplication.job.title}`);
      case "reject":
        return translate(`Rejecting application for: ${selectedApplication.job.title}`);
      case "request":
        return translate(`Request additional information for: ${selectedApplication.job.title}`);
      default:
        return "";
    }
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-bold mb-6">{translate("Manage Applications")}</h1>
          
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
                <TabsTrigger value="pending">{translate("Pending Review")}</TabsTrigger>
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
                    onStatusUpdate={handleStatusUpdate}
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
                      onStatusUpdate={handleStatusUpdate}
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
                      onStatusUpdate={handleStatusUpdate}
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
                      onStatusUpdate={handleStatusUpdate}
                    />
                  ))}
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <File className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">{translate("No Applications Yet")}</h3>
                <p className="text-gray-600 text-center max-w-md">
                  {translate("You haven't received any job applications yet. Post a job to start receiving applications.")}
                </p>
                <Button className="mt-6" asChild>
                  <a href="/employer/post-job">{translate("Post New Job")}</a>
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Application Details Dialog */}
          {selectedApplication && (
            <Dialog open={!!selectedApplication && !dialogOpen} onOpenChange={(open) => !open && setSelectedApplication(null)}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>{translate("Application Details")}</DialogTitle>
                  <DialogDescription>
                    {selectedApplication.job.title} - {getStatusBadge(selectedApplication.status)}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  <div className="p-4 bg-gray-50 border rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">{translate("Applicant ID")}: {selectedApplication.workerId}</span>
                      <span className="text-gray-300">|</span>
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">
                        {translate("Applied")}: {format(new Date(selectedApplication.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-2">{translate("Job Details")}:</h4>
                    <p className="text-gray-700 mb-4">{selectedApplication.job.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700">{translate("Location")}:</h5>
                        <p className="text-gray-600">{selectedApplication.job.location}</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-700">{translate("Salary")}:</h5>
                        <p className="text-gray-600">{selectedApplication.job.salary}</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedApplication.resume && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">{translate("Resume")}:</h4>
                      <div className="p-4 bg-gray-50 border rounded-md">
                        <p className="text-gray-700 whitespace-pre-line">{selectedApplication.resume}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedApplication.coverLetter && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">{translate("Cover Letter")}:</h4>
                      <div className="p-4 bg-gray-50 border rounded-md">
                        <p className="text-gray-700 whitespace-pre-line">{selectedApplication.coverLetter}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedApplication.employerNotes && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">{translate("Your Notes")}:</h4>
                      <div className="p-4 bg-gray-50 border rounded-md">
                        <p className="text-gray-700 whitespace-pre-line">{selectedApplication.employerNotes}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedApplication.requestedDocuments && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">{translate("Requested Documents")}:</h4>
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                        <p className="text-amber-700 whitespace-pre-line">{selectedApplication.requestedDocuments}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <div className="w-full flex flex-col sm:flex-row sm:justify-between gap-3">
                    <div className="space-x-2">
                      {selectedApplication.status === "pending" && (
                        <>
                          <Button 
                            onClick={() => {
                              setStatusUpdateType("accept");
                              setDialogOpen(true);
                            }}
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            {translate("Accept")}
                          </Button>
                          <Button 
                            onClick={() => {
                              setStatusUpdateType("reject");
                              setDialogOpen(true);
                            }}
                            variant="destructive"
                            size="sm"
                          >
                            <X className="h-4 w-4 mr-2" />
                            {translate("Reject")}
                          </Button>
                        </>
                      )}
                    </div>
                    <Button 
                      onClick={() => {
                        setStatusUpdateType("request");
                        setDialogOpen(true);
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {translate("Request Documents")}
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          {/* Status Update Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{getDialogTitle()}</DialogTitle>
                <DialogDescription>
                  {getDialogDescription()}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">{translate("Notes for Applicant")}:</h4>
                  <Textarea
                    placeholder={translate("Add any notes or feedback for the applicant")}
                    value={employerNotes}
                    onChange={(e) => setEmployerNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                
                {(statusUpdateType === "accept" || statusUpdateType === "request") && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">{translate("Request Documents")}:</h4>
                    <Textarea
                      placeholder={translate("Specify any documents or additional information needed")}
                      value={requestedDocuments}
                      onChange={(e) => setRequestedDocuments(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  variant="outline"
                >
                  {translate("Cancel")}
                </Button>
                <Button
                  type="button"
                  onClick={submitStatusUpdate}
                  disabled={updateApplicationMutation.isPending}
                >
                  {updateApplicationMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                      {translate("Submitting...")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {statusUpdateType === "accept" ? (
                        <Check className="h-4 w-4" />
                      ) : statusUpdateType === "reject" ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                      {translate("Submit")}
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
  onStatusUpdate: (application: Application, type: "accept" | "reject" | "request") => void;
};

function ApplicationCard({ 
  application, 
  getStatusBadge, 
  onViewDetails,
  onStatusUpdate 
}: ApplicationCardProps) {
  const { translate } = useLanguage();
  
  return (
    <Card>
      <CardHeader className="pb-3 bg-gray-50">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{application.job.title}</CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Applicant #{application.workerId}</span>
              <span className="mx-1">•</span>
              <Clock className="h-4 w-4" />
              <span>{format(new Date(application.createdAt), 'MMM d, yyyy')}</span>
            </CardDescription>
          </div>
          <div>{getStatusBadge(application.status)}</div>
        </div>
      </CardHeader>
      <CardContent className="py-4">
        <div className="space-y-3">
          {(application.resume || application.coverLetter) && (
            <div className="flex flex-wrap gap-3">
              {application.resume && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {translate("Resume Provided")}
                </Badge>
              )}
              {application.coverLetter && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {translate("Cover Letter Provided")}
                </Badge>
              )}
            </div>
          )}
          
          {application.requestedDocuments && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-center gap-2 text-amber-800 mb-1">
                <FileText className="h-4 w-4" />
                <span className="font-medium">{translate("Documents Requested")}:</span>
              </div>
              <p className="text-amber-700 text-sm">{application.requestedDocuments}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 pt-3 flex flex-wrap justify-between gap-2">
        <Button 
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(application)}
        >
          <FileText className="h-4 w-4 mr-2" />
          {translate("View Details")}
        </Button>
        
        <div className="flex flex-wrap gap-2">
          {application.status === "pending" && (
            <>
              <Button
                variant="default"
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onStatusUpdate(application, "accept")}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                {translate("Accept")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onStatusUpdate(application, "reject")}
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                {translate("Reject")}
              </Button>
            </>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onStatusUpdate(application, "request")}
          >
            <CircleEllipsis className="h-4 w-4 mr-2" />
            {translate("Request Info")}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}