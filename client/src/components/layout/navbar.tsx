import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import LanguageToggle from "@/components/language-toggle";
import NotificationBell from "@/components/notifications/notification-bell";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { translate } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                MM
              </div>
              <span className="ml-2 text-xl font-bold text-primary">MigrantMate</span>
            </Link>
            
            {/* Desktop Nav Links */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {/* Public Navigation */}
              {!user && (
                <>
                  <Link 
                    href="/" 
                    className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                      isActive("/") ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } text-sm font-medium`}
                  >
                    {translate("Home")}
                  </Link>
                  <Link 
                    href="/about" 
                    className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                      isActive("/about") ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } text-sm font-medium`}
                  >
                    {translate("About")}
                  </Link>
                  <Link 
                    href="/contact" 
                    className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                      isActive("/contact") ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } text-sm font-medium`}
                  >
                    {translate("Contact")}
                  </Link>
                </>
              )}
              
              {/* Worker Navigation */}
              {user && user.role === "worker" && (
                <>
                  <Link 
                    href="/worker/search-jobs" 
                    className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                      isActive("/worker/search-jobs") ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } text-sm font-medium`}
                  >
                    {translate("Search Jobs")}
                  </Link>
                  <Link 
                    href="/worker/my-applications" 
                    className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                      isActive("/worker/my-applications") ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } text-sm font-medium`}
                  >
                    {translate("My Applications")}
                  </Link>
                </>
              )}
              
              {/* Employer Navigation */}
              {user && user.role === "employer" && (
                <>
                  <Link 
                    href="/employer/post-job" 
                    className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                      isActive("/employer/post-job") ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } text-sm font-medium`}
                  >
                    {translate("Post Job")}
                  </Link>
                  <Link 
                    href="/employer/view-applications" 
                    className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                      isActive("/employer/view-applications") ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } text-sm font-medium`}
                  >
                    {translate("View Applications")}
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <LanguageToggle />
            
            {/* Auth Buttons for not logged in users */}
            {!user && (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="outline" size="sm" className="text-primary border-primary" asChild>
                  <Link href="/auth">{translate("Login")}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth">{translate("Register")}</Link>
                </Button>
              </div>
            )}
            
            {/* Notification Bell for logged in users */}
            {user && (
              <NotificationBell />
            )}
            
            {/* User Dropdown for logged in users */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-0 h-8">
                    <Avatar className="h-8 w-8 text-primary-foreground bg-primary">
                      <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="ml-2 hidden md:inline">{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    {translate("Logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on state */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {/* Public Navigation */}
            {!user && (
              <>
                <Link 
                  href="/" 
                  className={`block pl-3 pr-4 py-2 border-l-4 ${
                    isActive("/") ? "border-primary text-primary bg-primary-light/10" : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                  } text-base font-medium`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {translate("Home")}
                </Link>
                <Link 
                  href="/about" 
                  className={`block pl-3 pr-4 py-2 border-l-4 ${
                    isActive("/about") ? "border-primary text-primary bg-primary-light/10" : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                  } text-base font-medium`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {translate("About")}
                </Link>
                <Link 
                  href="/contact" 
                  className={`block pl-3 pr-4 py-2 border-l-4 ${
                    isActive("/contact") ? "border-primary text-primary bg-primary-light/10" : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                  } text-base font-medium`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {translate("Contact")}
                </Link>
              </>
            )}
            
            {/* Worker Navigation */}
            {user && user.role === "worker" && (
              <>
                <Link 
                  href="/worker/search-jobs" 
                  className={`block pl-3 pr-4 py-2 border-l-4 ${
                    isActive("/worker/search-jobs") ? "border-primary text-primary bg-primary-light/10" : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                  } text-base font-medium`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {translate("Search Jobs")}
                </Link>
                <Link 
                  href="/worker/my-applications" 
                  className={`block pl-3 pr-4 py-2 border-l-4 ${
                    isActive("/worker/my-applications") ? "border-primary text-primary bg-primary-light/10" : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                  } text-base font-medium`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {translate("My Applications")}
                </Link>
              </>
            )}
            
            {/* Employer Navigation */}
            {user && user.role === "employer" && (
              <>
                <Link 
                  href="/employer/post-job" 
                  className={`block pl-3 pr-4 py-2 border-l-4 ${
                    isActive("/employer/post-job") ? "border-primary text-primary bg-primary-light/10" : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                  } text-base font-medium`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {translate("Post Job")}
                </Link>
                <Link 
                  href="/employer/view-applications" 
                  className={`block pl-3 pr-4 py-2 border-l-4 ${
                    isActive("/employer/view-applications") ? "border-primary text-primary bg-primary-light/10" : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                  } text-base font-medium`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {translate("View Applications")}
                </Link>
              </>
            )}
            
            {/* Auth Links for Unauthenticated Users */}
            {!user && (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <Link
                  href="/auth"
                  className="block pl-3 pr-4 py-2 text-base font-medium text-primary hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {translate("Login")}
                </Link>
                <Link
                  href="/auth"
                  className="block pl-3 pr-4 py-2 text-base font-medium text-primary hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {translate("Register")}
                </Link>
              </div>
            )}
            
            {/* User Options for Authenticated Users */}
            {user && (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <Avatar className="h-10 w-10 text-primary-foreground bg-primary">
                      <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user.username}</div>
                    <div className="text-sm font-medium text-gray-500">{user.role}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 w-full text-left"
                  >
                    {translate("Logout")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
