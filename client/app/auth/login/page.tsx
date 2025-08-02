"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { User } from "@supabase/supabase-js";
import Image from "next/image";
import { Logo } from "@/public/images";
import Link from "next/link";
import Loader from "@/components/misc/loader";

export default function LoginPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [emailLoading, setEmailLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
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

        if (user) {
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
        // await syncUserToMongoDB(session.user);
        router.push("/home");
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        router.push("/auth/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  const signInWithGoogle = async () => {
    try {
      setGoogleLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
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
        console.error("Google sign-in error:", error);
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setGoogleLoading(false);
    }
  };

  const signInWithEmail = async () => {
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    try {
      setEmailLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error("Email sign-in error:", error);
        alert(`Error: ${error.message}`);
        return;
      }

      console.log("Email sign-in successful");
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const syncUserToMongoDB = async (user: User) => {
    console.log("SYNCED");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_SERVER_URL}/api/users/sync-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            supabaseId: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.name,
            avatar:
              user.user_metadata?.avatar_url || user.user_metadata?.picture,
            provider: user.app_metadata?.provider || "email",
            createdAt: user.created_at,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("User synced to MongoDB:", result);
      return result;
    } catch (error) {
      console.error("Failed to sync user to MongoDB:", error);
      throw error;
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !emailLoading && email && password) {
      signInWithEmail();
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4 sm:px-6 lg:px-8">
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
            Welcome back
          </h2>
          <p className="text-gray-600 dark:text-gray-200">
            Sign in to your account to continue
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
                  onKeyDown={handleKeyPress}
                  required
                  autoComplete="email"
                  className="appearance-none h-12 relative block w-full px-3 py-3 placeholder-gray-500 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-200"
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
                  onKeyDown={handleKeyPress}
                  required
                  autoComplete="current-password"
                  className="appearance-none h-12 relative block w-full px-3 py-3 placeholder-gray-500 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-200"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex items-center justify-end text-sm">
                <Button
                  className="bg-transparent h-6 text-primary-600 hover:text-primary-500 font-medium hover:bg-transparent p-0 shadow-none"
                  onClick={() => {
                    alert("Forgot password functionality not implemented yet");
                  }}
                >
                  Forgot password?
                </Button>
              </div>

              <Button
                onClick={signInWithEmail}
                disabled={
                  emailLoading || googleLoading || !email.trim() || !password
                }
                className="group relative h-12 w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
              >
                {emailLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  "Sign in"
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
                Continue with Google
              </>
            )}
          </Button>
        </div>

        <div className="text-center text-md">
          <p className="text-gray-700 dark:text-gray-300">
            Don't have an account?{" "}
            <Button
              onClick={() => router.push("/auth/register")}
              className="bg-transparent px-1 hover:bg-transparent text-md font-medium text-primary-600 hover:text-primary-500 transition-colors cursor-pointer shadow-none"
            >
              Sign up for free
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
