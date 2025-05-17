import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Application = {
  id: number;
  status: string;
  employerNotes: string | null;
  job: {
    title: string;
    location: string;
    salary: string;
    description: string;
  };
};

export default function MyApplications() {
  const { user } = useAuth();

  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications/worker", user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/applications/worker/${user?.id}`);
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    },
    enabled: !!user?.id,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">My Applications</h1>

          {isLoading ? (
            <p>Loading applications...</p>
          ) : !applications?.length ? (
            <p>You have not applied to any jobs yet.</p>
          ) : (
            applications.map((app) => (
              <Card key={app.id} className="mb-4">
                <CardHeader>
                  <CardTitle>{app.job.title}</CardTitle>
                  <CardDescription>
                    {app.job.location} • {app.job.salary}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Badge variant="outline" className="capitalize">
                    {app.status}
                  </Badge>

                  {app.status === "accepted" && app.employerNotes && (
                    <div className="bg-green-50 text-green-800 p-3 rounded-md border border-green-200">
                      <strong>Interview Info:</strong>
                      <p>{app.employerNotes}</p>
                    </div>
                  )}

                  {app.status === "rejected" && (
                    <p className="text-red-600">
                      Your application was not selected.
                    </p>
                  )}

                  {app.status === "pending" && (
                    <p className="text-gray-600">Waiting for employer review.</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
