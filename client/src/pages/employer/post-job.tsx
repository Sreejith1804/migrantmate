import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { insertJobSchema, InsertJob } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const formSchema = insertJobSchema.extend({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(2, "Location is required"),
  salary: z.string().min(1, "Salary is required"),
  jobType: z.string().min(1, "Job Type is required"),
  jobSubtype: z.string().min(1, "Job Subtype is required"),
});

export default function PostJob() {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      salary: "",
      jobType: "",
      jobSubtype: "",
    },
  });

  const jobMutation = useMutation({
    mutationFn: async (values: InsertJob) => {
      if (!user) throw new Error("Not authenticated");
      const res = await apiRequest("POST", `/api/jobs?employerId=${user.id}`, values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Job Posted",
        description: "Your job has been successfully posted.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Post Job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    jobMutation.mutate(values);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                {translate("Post a New Job")}
              </CardTitle>
              <CardDescription>
                Fill out the form below to post a new job opening
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{translate("Job Title")}</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Painter" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{translate("Job Description")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the job in detail"
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translate("Location")}</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Chennai" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="salary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translate("Salary")}</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., ₹15,000 - ₹20,000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="jobType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{translate("Job Type")}</FormLabel>
                        <FormControl>
                          <select {...field} className="w-full border px-2 py-2 rounded">
                            <option value="">Select job type</option>
                            <option value="Construction">Construction</option>
                            <option value="Manufacturing">Manufacturing</option>
                            <option value="Textile">Textile</option>
                            <option value="Service">Service</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="jobSubtype"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{translate("Job Subtype")}</FormLabel>
                        <FormControl>
                          <select {...field} className="w-full border px-2 py-2 rounded">
                            <option value="">Select job subtype</option>
                            <option value="Mason">Mason</option>
                            <option value="Carpenter">Carpenter</option>
                            <option value="Painter">Painter</option>
                            <option value="Electrician">Electrician</option>
                            <option value="Plumber">Plumber</option>
                            <option value="General Helper">General Helper</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={jobMutation.isPending}>
                    {jobMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {translate("Posting...")}
                      </>
                    ) : (
                      translate("Post Job")
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
