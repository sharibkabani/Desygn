"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import GitHubLoginButton from "@/components/GitHubLoginButton";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#1a1c20] flex flex-col">
      {/* Back to Home Button */}
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-white/70 hover:text-black"
        >
          <Link href="/" className="inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </Button>
      </div>

      {/* Login Card */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <Image
                src="/icon.png"
                alt="Desygn Logo"
                width={60}
                height={60}
                className="w-16 h-16"
              />
            </div>
            <h1 className="text-3xl font-bold text-white">Welcome to Desygn</h1>
            <p className="text-white/70 mt-2">Sign in to continue</p>
          </div>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-lg">
            <CardContent className="p-6 space-y-6">
              {/* Google Login Button */}
              <GoogleLoginButton />

              {/* GitHub Login Button */}
              <GitHubLoginButton />

              {/* Terms and Privacy */}
              <div className="text-center text-sm text-white/50">
                By continuing, you agree to our{" "}
                <Link
                  href="#"
                  className="text-purple-400 hover:text-purple-300"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="#"
                  className="text-purple-400 hover:text-purple-300"
                >
                  Privacy Policy
                </Link>
                .
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
