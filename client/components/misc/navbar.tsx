"use client";

import Image from "next/image";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { FiMenu, FiX } from "react-icons/fi";
import { ThemeSwitcher } from "./theme-switcher";
import { Logo } from "@/public/images";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const router = useRouter();

  const handleNavigateLogin = () => {
    router.push("/auth/login");
  };

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[95%] max-w-5xl z-50 rounded-2xl backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 shadow-lg border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-1">
          <div className="bg-transparent w-8 h-8 rounded-xl flex items-center justify-center">
            <Image src={Logo} alt="JobFu" className="h-8 w-auto rounded-md" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent dark:from-primary-400 dark:to-primary-600 tracking-tight">
            obsidian.ai
          </span>
        </div>

        <div className="hidden lg:flex items-center space-x-8">
          <a
            href="#features"
            className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors font-medium"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors font-medium"
          >
            How It Works
          </a>
          <a
            href="#testimonials"
            className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors font-medium"
          >
            Testimonials
          </a>
          <a
            href="#pricing"
            className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors font-medium"
          >
            Pricing
          </a>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center space-x-3">
          <ThemeSwitcher />

          <Button
            onClick={handleNavigateLogin}
            className="hidden lg:flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-purple-500/25 dark:shadow-purple-900/30 font-semibold cursor-pointer"
          >
            <span>Get Started</span>
          </Button>

          <Button
            onClick={handleNavigateLogin}
            className="lg:hidden bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-purple-500/25 text-sm font-semibold"
          >
            Start
          </Button>

          <button
            className="lg:hidden p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <FiX className="w-5 h-5" />
            ) : (
              <FiMenu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-b-2xl">
          <div className="flex flex-col space-y-4">
            <a
              href="#features"
              className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#testimonials"
              className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Testimonials
            </a>
            <a
              href="#pricing"
              className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
