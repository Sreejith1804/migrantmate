import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import SearchJobs from "@/pages/worker/search-jobs";
import MyApplications from "@/pages/worker/my-applications";
import PostJob from "@/pages/employer/post-job";
import ViewApplications from "@/pages/employer/view-applications";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./contexts/auth-context";
import { LanguageProvider } from "./contexts/language-context";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Worker Routes */}
      <ProtectedRoute path="/worker/search-jobs" component={SearchJobs} allowedRoles={["worker"]} />
      <ProtectedRoute path="/worker/my-applications" component={MyApplications} allowedRoles={["worker"]} />
      
      {/* Employer Routes */}
      <ProtectedRoute path="/employer/post-job" component={PostJob} allowedRoles={["employer"]} />
      <ProtectedRoute path="/employer/view-applications" component={ViewApplications} allowedRoles={["employer"]} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
