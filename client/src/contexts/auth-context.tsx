import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { User, Login, WorkerRegistration, EmployerRegistration } from "@shared/schema";
import { apiRequest, getQueryFn, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (data: Login) => Promise<void>;
  registerWorker: (data: WorkerRegistration) => Promise<void>;
  registerEmployer: (data: EmployerRegistration) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from API on initial render
  const { 
    data: userData, 
    isLoading: isLoadingUser 
  } = useQuery<User | null>({
    queryKey: ['/api/user'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });
  
  // Update user state when userData changes
  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
    setIsLoading(false);
  }, [userData]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: Login) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (userData: User) => {
      setUser(userData);
      queryClient.setQueryData(['/api/user'], userData);
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.firstName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Worker registration mutation
  const workerRegistrationMutation = useMutation({
    mutationFn: async (data: WorkerRegistration) => {
      const res = await apiRequest("POST", "/api/register/worker", data);
      return await res.json();
    },
    onSuccess: (userData: User) => {
      setUser(userData);
      queryClient.setQueryData(['/api/user'], userData);
      toast({
        title: "Registration successful",
        description: `Welcome, ${userData.firstName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Employer registration mutation
  const employerRegistrationMutation = useMutation({
    mutationFn: async (data: EmployerRegistration) => {
      const res = await apiRequest("POST", "/api/register/employer", data);
      return await res.json();
    },
    onSuccess: (userData: User) => {
      setUser(userData);
      queryClient.setQueryData(['/api/user'], userData);
      toast({
        title: "Registration successful",
        description: `Welcome, ${userData.firstName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const login = async (credentials: Login) => {
    await loginMutation.mutateAsync(credentials);
  };

  const registerWorker = async (data: WorkerRegistration) => {
    await workerRegistrationMutation.mutateAsync(data);
  };

  const registerEmployer = async (data: EmployerRegistration) => {
    await employerRegistrationMutation.mutateAsync(data);
  };

  const logout = async () => {
    try {
      await apiRequest("POST", "/api/logout");
      setUser(null);
      queryClient.setQueryData(['/api/user'], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        registerWorker,
        registerEmployer,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
