import { useState } from "react";
import { Redirect } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import LoginForm from "@/components/auth/login-form";
import WorkerRegistrationForm from "@/components/auth/worker-registration-form";
import EmployerRegistrationForm from "@/components/auth/employer-registration-form";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function AuthPage({ minimal = false }: { minimal?: boolean }) {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const [registrationType, setRegistrationType] = useState<string>("worker");

  // Redirect if user is already logged in
  if (user && !minimal) {
    return <Redirect to="/" />;
  }

  const authContent = (
    <Card className={minimal ? "shadow-xl" : "max-w-md mx-auto my-8"}>
      <CardContent className={minimal ? "p-6" : "p-8"}>
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">{translate("Login")}</TabsTrigger>
            <TabsTrigger value="register">{translate("Register")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          
          <TabsContent value="register">
            <div className="mb-4">
              <ToggleGroup type="single" variant="outline" value={registrationType} onValueChange={(value) => value && setRegistrationType(value)}>
                <ToggleGroupItem value="worker" className="flex-1">
                  {translate("Worker")}
                </ToggleGroupItem>
                <ToggleGroupItem value="employer" className="flex-1">
                  {translate("Employer")}
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            
            {registrationType === "worker" ? (
              <WorkerRegistrationForm />
            ) : (
              <EmployerRegistrationForm />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

  if (minimal) {
    return authContent;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:gap-12">
            {/* Left side: auth forms */}
            <div className="md:w-1/2">
              {authContent}
            </div>
            
            {/* Right side: info/hero */}
            <div className="md:w-1/2 md:pl-10 mt-8 md:mt-0">
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {translate("Connecting Migrant Workers with Opportunities")}
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  MigrantMate helps migrant workers find fair employment opportunities while giving employers access to skilled and reliable workers.
                </p>
                <ul className="text-gray-600 space-y-2 list-disc list-inside text-left">
                  <li>Create a free account in minutes</li>
                  <li>Browse hundreds of verified job listings</li>
                  <li>Connect directly with employers</li>
                  <li>Access resources in multiple languages</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
