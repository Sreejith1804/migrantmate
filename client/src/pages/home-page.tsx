import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PersonStanding, Search, Handshake } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import AuthPage from "./auth-page";

export default function HomePage() {
  const { translate } = useLanguage();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* User Role Display - Only shown when logged in */}
        {user && (
          <section className="bg-white py-6 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-white border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-primary text-white flex items-center justify-center text-lg font-semibold">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{user.firstName} {user.lastName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-primary/10 text-primary capitalize">
                            {user.role === "worker" ? translate("Worker") : translate("Employer")}
                          </span>
                          <span className="text-gray-500 text-sm">{user.email}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full md:w-auto">
                      {user.role === "worker" ? (
                        <>
                          <Button variant="secondary" className="justify-start" asChild>
                            <Link href="/worker/search-jobs">
                              <Search className="h-4 w-4 mr-2" />
                              {translate("Search Jobs")}
                            </Link>
                          </Button>
                          <Button variant="secondary" className="justify-start" asChild>
                            <Link href="/worker/my-applications">
                              <Handshake className="h-4 w-4 mr-2" />
                              {translate("My Applications")}
                            </Link>
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="secondary" className="justify-start" asChild>
                            <Link href="/employer/post-job">
                              <PersonStanding className="h-4 w-4 mr-2" />
                              {translate("Post Job")}
                            </Link>
                          </Button>
                          <Button variant="secondary" className="justify-start" asChild>
                            <Link href="/employer/view-applications">
                              <Handshake className="h-4 w-4 mr-2" />
                              {translate("View Applications")}
                            </Link>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Hero Section */}
        <section className="hero-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="md:flex md:items-center md:justify-between">
              <div className="md:w-1/2 mb-10 md:mb-0">
                <h1 className="font-bold leading-tight mb-4">
                  {translate("Connecting Migrant Workers with Opportunities")}
                </h1>
                <p className="text-xl md:text-2xl text-white/80 mb-8">
                  {translate("Find jobs, build skills, and secure your future with MigrantMate.")}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    size="lg" 
                    className="bg-white text-primary hover:bg-gray-100"
                    asChild
                  >
                    <Link href={user?.role === "worker" ? "/worker/search-jobs" : "/auth"}>
                      {translate("Find Jobs")}
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="text-white border-white hover:bg-white/10"
                    asChild
                  >
                    <Link href={user?.role === "employer" ? "/employer/post-job" : "/auth"}>
                      {translate("Hire Workers")}
                    </Link>
                  </Button>
                </div>
              </div>
              
              {/* Auth Card on the right side */}
              <div className="md:w-1/2 md:pl-10">
                {!user && <AuthPage minimal />}
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="hidden lg:block absolute right-0 inset-y-0">
            <svg className="h-full text-white/10" viewBox="0 0 100 100" preserveAspectRatio="none" fill="currentColor">
              <polygon points="0,0 100,0 50,100 0,100" />
            </svg>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-bold text-gray-900">
                {translate("How MigrantMate Works")}
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                {translate("Simple steps to connect workers with employers")}
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Feature 1 */}
              <Card className="bg-gray-50">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                    <PersonStanding />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    {translate("Create Account")}
                  </h3>
                  <p className="mt-2 text-base text-gray-600">
                    {translate("Register as a worker looking for jobs or an employer looking to hire.")}
                  </p>
                </CardContent>
              </Card>
              
              {/* Feature 2 */}
              <Card className="bg-gray-50">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                    <Search />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    {translate("Find Opportunities")}
                  </h3>
                  <p className="mt-2 text-base text-gray-600">
                    {translate("Workers search for jobs. Employers post positions and review applications.")}
                  </p>
                </CardContent>
              </Card>
              
              {/* Feature 3 */}
              <Card className="bg-gray-50">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                    <Handshake />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    {translate("Connect & Work")}
                  </h3>
                  <p className="mt-2 text-base text-gray-600">
                    {translate("Get hired, start working and build your career or find the right talent for your business.")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-bold text-gray-900">
                {translate("Success Stories")}
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                {translate("Hear from our community members")}
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Testimonial 1 */}
              <Card className="shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center text-white">
                      <span>RS</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">Rajesh Singh</h4>
                      <p className="text-sm text-gray-600">Construction Worker</p>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    "MigrantMate helped me find consistent work in a new city. The process was simple and I could easily communicate with employers in my native language."
                  </p>
                </CardContent>
              </Card>
              
              {/* Testimonial 2 */}
              <Card className="shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-white">
                      <span>AG</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">Anita Gupta</h4>
                      <p className="text-sm text-gray-600">Textile Worker</p>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    "As a woman migrant worker, I was concerned about finding safe employment. MigrantMate connected me with verified employers and I now have a stable job."
                  </p>
                </CardContent>
              </Card>
              
              {/* Testimonial 3 */}
              <Card className="shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-white">
                      <span>VK</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">Vikram Kumar</h4>
                      <p className="text-sm text-gray-600">Farm Owner</p>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    "As an employer, I've found reliable seasonal workers through MigrantMate. The platform makes it easy to post jobs and review qualified candidates."
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
