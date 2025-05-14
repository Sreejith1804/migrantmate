import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { User, Login, WorkerRegistration, EmployerRegistration } from "@shared/schema";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (data: Login) => Promise<void>;
  registerWorker: (data: WorkerRegistration) => Promise<void>;
  registerEmployer: (data: EmployerRegistration) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    const storedUserRole = localStorage.getItem('userRole');
    const storedUserId = localStorage.getItem('userId');
    const storedUserEmail = localStorage.getItem('userEmail');
    const storedUserFullName = localStorage.getItem('userFullName');
    
    if (storedUserName && storedUserRole && storedUserId) {
      setUser({
        id: parseInt(storedUserId),
        username: storedUserName,
        role: storedUserRole as 'worker' | 'employer',
        firstName: storedUserFullName?.split(' ')[0] || '',
        lastName: storedUserFullName?.split(' ')[1] || '',
        email: storedUserEmail || '',
        phone: '', // We don't need to store phone in localStorage for security reasons
        password: '', // We don't store or use password after authentication
      });
    }
    
    setIsLoading(false);
  }, []);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: Login) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (userData: User) => {
      setUser(userData);
      localStorage.setItem('userName', userData.username);
      localStorage.setItem('userRole', userData.role);
      localStorage.setItem('userId', userData.id.toString());
      localStorage.setItem('userEmail', userData.email);
      localStorage.setItem('userFullName', `${userData.firstName} ${userData.lastName}`);
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
      localStorage.setItem('userName', userData.username);
      localStorage.setItem('userRole', userData.role);
      localStorage.setItem('userId', userData.id.toString());
      localStorage.setItem('userEmail', userData.email);
      localStorage.setItem('userFullName', `${userData.firstName} ${userData.lastName}`);
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
      localStorage.setItem('userName', userData.username);
      localStorage.setItem('userRole', userData.role);
      localStorage.setItem('userId', userData.id.toString());
      localStorage.setItem('userEmail', userData.email);
      localStorage.setItem('userFullName', `${userData.firstName} ${userData.lastName}`);
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userFullName');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
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
