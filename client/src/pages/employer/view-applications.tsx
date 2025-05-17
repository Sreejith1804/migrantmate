import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

// ✅ Type includes job and worker details
type Application = {
  id: number;
  status: string;
  employerNotes: string | null;
  job: {
    title: string;
    location: string;
    salary: string;
  };
  worker: {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    skills: string;
  };
};

export default function ViewApplications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [note, setNote] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications/employer", user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/applications/employer/${user?.id}`);
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    },
    enabled: !!user?.id,
  });

  const updateApp = useMutation({
    mutationFn: async ({
      id,
      status,
      note,
    }: {
      id: number;
      status: "accepted" | "rejected";
      note?: string;
    }) => {
      return apiRequest("PATCH", `/api/applications/${id}`, {
        status,
        employerNotes: note,
      });
    },
    onSuccess: () => {
      toast({ title: "Application updated successfully" });
      setNote("");
      setSelectedId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/applications/employer", user?.id] });
    },
    onError: () => {
      toast({ title: "Failed to update", variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">Received Applications</h1>

          {isLoading ? (
            <p>Loading...</p>
          ) : !applications?.length ? (
            <p>No applications received yet.</p>
          ) : (
            applications.map((app) => (
              <Card key={app.id} className="mb-4">
                <CardHeader>
                  <CardTitle>{app.job.title}</CardTitle>
                  <CardDescription>
                    {app.job.location} • {app.job.salary}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Badge className="capitalize">{app.status}</Badge>

                  {/* ✅ Worker details */}
                  <div className="text-sm text-gray-700 space-y-1 border-t pt-3">
                    <p><strong>Worker ID:</strong> {app.worker?.id ?? "N/A"}</p>
                    <p><strong>Name:</strong> {app.worker?.firstName ?? "N/A"} {app.worker?.lastName ?? ""}</p>
                    <p><strong>Phone:</strong> {app.worker?.phone ?? "N/A"}</p>
                    <p><strong>Email:</strong> {app.worker?.email ?? "N/A"}</p>
                    {app.worker?.skills && (
                      <p><strong>Skills:</strong> {app.worker.skills}</p>
                    )}
                    
                  </div>

                  {/* ✅ Previously sent note */}
                  {app.employerNotes && (
                    <div className="bg-green-50 text-green-800 p-2 border rounded">
                      <strong>Message Sent:</strong>
                      <p>{app.employerNotes}</p>
                    </div>
                  )}

                  {/* ✅ Action buttons */}
                  {app.status === "pending" && selectedId !== app.id && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedId(app.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Accept & Add Message
                      </Button>
                      <Button
                        onClick={() =>
                          updateApp.mutate({ id: app.id, status: "rejected" })
                        }
                        size="sm"
                        variant="destructive"
                      >
                        Reject
                      </Button>
                    </div>
                  )}

                  {/* ✅ Accept with message */}
                  {selectedId === app.id && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Add a message for the worker (e.g., interview time, location)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() =>
                            updateApp.mutate({
                              id: app.id,
                              status: "accepted",
                              note,
                            })
                          }
                          size="sm"
                        >
                          Submit
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedId(null);
                            setNote("");
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
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
