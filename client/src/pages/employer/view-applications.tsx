import { useQuery } from "@tanstack/react-query";
import { Application, Job } from "@shared/schema";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { format } from "date-fns";

type ApplicationWithJob = Application & { job: Job };

export default function ViewApplications() {
  const { translate } = useLanguage();
  const { user } = useAuth();

  const { data: applications, isLoading } = useQuery<ApplicationWithJob[]>({
    queryKey: ["/api/applications/employer", user?.id],
    enabled: !!user,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">{translate("Pending")}</Badge>;
      case "accepted":
        return <Badge variant="success" className="bg-green-100 text-green-800 border-green-300">{translate("Accepted")}</Badge>;
      case "rejected":
        return <Badge variant="destructive">{translate("Rejected")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {translate("Job Applications")}
          </h1>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !applications || applications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-lg text-gray-600">You haven't received any job applications yet.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{translate("Job Title")}</TableHead>
                      <TableHead>{translate("Applicant")}</TableHead>
                      <TableHead>{translate("Applied On")}</TableHead>
                      <TableHead>{translate("Status")}</TableHead>
                      <TableHead>{translate("Action")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">{application.job.title}</TableCell>
                        <TableCell>Worker #{application.workerId}</TableCell>
                        <TableCell>{format(application.appliedAt, 'PP')}</TableCell>
                        <TableCell>{getStatusBadge(application.status)}</TableCell>
                        <TableCell>
                          {application.status === "pending" && (
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                              >
                                {translate("Accept")}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
                              >
                                {translate("Reject")}
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
