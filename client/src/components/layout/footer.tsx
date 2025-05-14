import { Link } from "wouter";
import { useLanguage } from "@/contexts/language-context";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const { translate } = useLanguage();
  
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-primary font-bold">
                MM
              </div>
              <span className="ml-2 text-xl font-bold">MigrantMate</span>
            </div>
            <p className="mt-2 text-sm text-gray-400">
              {translate("Connecting migrant workers with fair employment opportunities")}
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              {translate("For Workers")}
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/worker/search-jobs" className="text-base text-gray-300 hover:text-white">
                  {translate("Find Jobs")}
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-base text-gray-300 hover:text-white">
                  {translate("Create Profile")}
                </Link>
              </li>
              <li>
                <Link href="/worker/my-applications" className="text-base text-gray-300 hover:text-white">
                  {translate("My Applications")}
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-base text-gray-300 hover:text-white">
                  Worker Resources
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              {translate("For Employers")}
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/employer/post-job" className="text-base text-gray-300 hover:text-white">
                  {translate("Post Jobs")}
                </Link>
              </li>
              <li>
                <Link href="/employer/view-applications" className="text-base text-gray-300 hover:text-white">
                  {translate("Find Workers")}
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-base text-gray-300 hover:text-white">
                  {translate("Company Profile")}
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-base text-gray-300 hover:text-white">
                  Hiring Resources
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              {translate("Contact Us")}
            </h3>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <a href="mailto:info@migrantmate.com" className="text-base text-gray-300 hover:text-white">
                  info@migrantmate.com
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <a href="tel:+911234567890" className="text-base text-gray-300 hover:text-white">
                  +91 1234 567 890
                </a>
              </li>
              <li className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-base text-gray-300">New Delhi, India</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} MigrantMate. {translate("All rights reserved.")}
          </p>
        </div>
      </div>
    </footer>
  );
}
