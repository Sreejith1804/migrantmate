import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType;
  allowedRoles: string[];
};

export function ProtectedRoute({ path, component: Component, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  return (
    <Route path={path}>
      {user && allowedRoles.includes(user.role) ? (
        <Component />
      ) : (
        <Redirect to={user ? "/" : "/auth"} />
      )}
    </Route>
  );
}
