import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { workerRegistrationSchema, WorkerRegistration } from "@shared/schema";

export default function WorkerRegistrationForm() {
  const { registerWorker } = useAuth();
  const { translate } = useLanguage();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<WorkerRegistration>({
    resolver: zodResolver(workerRegistrationSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      skills: "",
      role: "worker",
    },
  });

  async function onSubmit(values: WorkerRegistration) {
    try {
      setIsLoading(true);
      await registerWorker(values);
      setLocation("/worker/search-jobs"); // Redirect to search jobs page after successful registration
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{translate("First Name")}</FormLabel>
                <FormControl>
                  <Input placeholder={translate("Enter your first name")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{translate("Last Name")}</FormLabel>
                <FormControl>
                  <Input placeholder={translate("Enter your last name")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder={translate("Choose a username")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{translate("Email")}</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder={translate("Enter your email")} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{translate("Phone Number")}</FormLabel>
              <FormControl>
                <Input placeholder={translate("Enter your phone number")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{translate("Skills")}</FormLabel>
              <FormControl>
                <Input placeholder={translate("e.g., Construction, Farming, etc.")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{translate("Password")}</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder={translate("Create a password")} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{translate("Confirm Password")}</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder={translate("Confirm your password")} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {translate("I agree to the")} <a href="#" className="text-primary hover:text-primary-dark">{translate("Terms and Conditions")}</a>
          </label>
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {translate("Registering...")}
            </>
          ) : (
            translate("Register as Worker")
          )}
        </Button>
      </form>
    </Form>
  );
}
