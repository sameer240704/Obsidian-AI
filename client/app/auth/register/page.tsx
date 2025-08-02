"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";
import { toast } from "sonner";
import { Logo } from "@/public/images";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import Loader from "@/components/misc/loader";

export default function SignUpPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [emailLoading, setEmailLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [showEmailSent, setShowEmailSent] = useState<boolean>(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error("Error getting user:", error);
        }

        setUser(user);
        setLoading(false);

        if (user && user.email_confirmed_at) {
          router.push("/home");
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        setLoading(false);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);

      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);

        if (session.user.email_confirmed_at) {
          // await syncUserToMongoDB(session.user);
          router.push("/home");
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  const signInWithGoogle = async () => {
    try {
      setGoogleLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("Google sign-up error:", error);
        alert(`Error: ${error.message}`);
      }
      // Note: Don't set loading to false here because the redirect will happen
    } catch (error) {
      console.error("Unexpected error:", error);
      setGoogleLoading(false);
    }
  };

  const signUpWithEmail = async () => {
    // Validation checks
    if (!email.trim()) {
      alert("Please enter your email address");
      return;
    }

    if (!isValidEmail(email)) {
      alert("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!agreedToTerms) {
      alert("Please agree to the Terms of Service and Privacy Policy!");
      return;
    }

    try {
      setEmailLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Email sign-up error:", error);
        alert(`Error: ${error.message}`);
        return;
      }

      if (data.user && !data.user.email_confirmed_at) {
        // Email confirmation required
        setShowEmailSent(true);
        console.log("Sign-up successful, email confirmation required");
      } else if (data.user && data.user.email_confirmed_at) {
        // Email already confirmed (shouldn't happen with sign-up, but just in case)
        console.log("Sign-up successful and email confirmed");
        // await syncUserToMongoDB(data.user);
        router.push("/home");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const syncUserToMongoDB = async (user: User) => {
    try {
      const response = await fetch("/api/sync-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supabaseId: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name,
          avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          provider: user.app_metadata?.provider || "email",
          createdAt: user.created_at,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("User synced to MongoDB:", result);
    } catch (error) {
      console.error("Failed to sync user to MongoDB:", error);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthText = () => {
    const strength = getPasswordStrength();
    if (strength < 2) return { text: "Weak", color: "text-red-500" };
    if (strength < 4) return { text: "Fair", color: "text-yellow-500" };
    return { text: "Strong", color: "text-green-500" };
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Enter" &&
      !emailLoading &&
      email &&
      password &&
      confirmPassword &&
      agreedToTerms
    ) {
      signUpWithEmail();
    }
  };

  const resendConfirmation = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("Confirmation email resent! Please check your inbox.");
      }
    } catch (error) {
      console.error("Error resending confirmation:", error);
      toast.error("Failed to resend confirmation email. Please try again.");
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (showEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-pink-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Check your email
            </h2>
            <p className="text-gray-600 mb-6">
              We've sent a confirmation link to <strong>{email}</strong>. Please
              click the link in the email to activate your account.
            </p>
            <div className="space-y-4">
              <Button
                onClick={resendConfirmation}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white cursor-pointer"
              >
                Resend confirmation email
              </Button>
              <Button
                onClick={() => router.push("/auth/login")}
                variant="outline"
                className="w-full cursor-pointer"
              >
                Back to Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent  px-4 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="absolute top-4 left-4 flex justify-center items-center gap-2"
      >
        <Image src={Logo} alt="Logo" className="h-8 w-auto rounded-full" />
        <h1 className="text-2xl font-bold tracking-tight">obsidian.ai</h1>
      </Link>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center flex flex-col justify-center items-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Create your account
          </h2>
          <p className="text-gray-600 dark:text-gray-200">
            Join us today and get started for free
          </p>
        </div>

        <div className="bg-transparent">
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2"
                >
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  required
                  autoComplete="email"
                  className="appearance-none h-12 relative block w-full px-3 py-3 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <Label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  required
                  autoComplete="new-password"
                  className="appearance-none h-12 relative block w-full px-3 py-3 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-200"
                  placeholder="Create a password (min. 6 characters)"
                />
              </div>

              <div>
                <Label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2"
                >
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  required
                  autoComplete="new-password"
                  className="appearance-none h-12 relative block w-full px-3 py-3 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-200"
                  placeholder="Confirm your password"
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    Passwords do not match
                  </p>
                )}
              </div>

              {password && (
                <div className="space-y-2">
                  <div className="flex space-x-1">
                    <div
                      className={`h-1 w-1/5 rounded ${
                        password.length >= 6 ? "bg-green-500" : "bg-gray-200"
                      }`}
                    ></div>
                    <div
                      className={`h-1 w-1/5 rounded ${
                        password.length >= 8 ? "bg-green-500" : "bg-gray-200"
                      }`}
                    ></div>
                    <div
                      className={`h-1 w-1/5 rounded ${
                        /[A-Z]/.test(password) ? "bg-green-500" : "bg-gray-200"
                      }`}
                    ></div>
                    <div
                      className={`h-1 w-1/5 rounded ${
                        /[0-9]/.test(password) ? "bg-green-500" : "bg-gray-200"
                      }`}
                    ></div>
                    <div
                      className={`h-1 w-1/5 rounded ${
                        /[^A-Za-z0-9]/.test(password)
                          ? "bg-green-500"
                          : "bg-gray-200"
                      }`}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      Password strength: Use 6+ characters with numbers,
                      uppercase letters, and symbols
                    </p>
                    <span
                      className={`text-xs font-medium ${
                        getPasswordStrengthText().color
                      }`}
                    >
                      {getPasswordStrengthText().text}
                    </span>
                  </div>
                </div>
              )}

              <Button
                onClick={signUpWithEmail}
                disabled={
                  emailLoading ||
                  googleLoading ||
                  !email.trim() ||
                  !password ||
                  !confirmPassword ||
                  password !== confirmPassword ||
                  password.length < 6 ||
                  !agreedToTerms
                }
                className="group mt-10 relative h-12 w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
              >
                {emailLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 dark:bg-black bg-white dark:text-slate-200 text-gray-500">
                or continue with
              </span>
            </div>
          </div>

          <Button
            onClick={signInWithGoogle}
            disabled={googleLoading || emailLoading}
            className="w-full h-12 flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:bg-black/80 dark:text-white rounded-lg text-gray-700 bg-transparent hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {googleLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
            ) : (
              <>
                <FcGoogle className="h-5 w-5" />
                Sign up with Google
              </>
            )}
          </Button>
        </div>

        <div className="text-center text-md">
          <p className="text-gray-700 dark:text-gray-300">
            Already have an account?{" "}
            <Button
              onClick={() => router.push("/auth/login")}
              className="bg-transparent px-1 hover:bg-transparent text-md font-medium text-primary-600 hover:text-primary-500 transition-colors cursor-pointer shadow-none"
            >
              Sign in here
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
