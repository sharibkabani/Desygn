import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Excalidraw from "@/components/Excalidraw";
import "@excalidraw/excalidraw/index.css";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1a1c20] text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <Navbar />
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between py-20 gap-12">
          <div className="lg:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Master System Design Like Never Before
            </h1>
            <p className="text-xl text-white/80 max-w-xl">
              Desygn is the ultimate platform to practice, learn, and master
              system design. Solve real-world architecture challenges and
              prepare for technical interviews with our interactive challenges
              and expert feedback.
            </p>
            <div className="pt-4">
              <Button
                asChild
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:shadow-[0_0_25px_rgba(168,85,247,0.7)]"
              >
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-lg"
                >
                  Get Started <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="w-full max-w-lg mx-auto bg-gray-800 rounded-lg shadow-lg border border-gray-700">
              {/* macOS-like Header */}
              <div className="flex items-center justify-start gap-2 px-4 py-2 bg-gray-900 rounded-t-lg border-b border-gray-700">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>

              {/* Excalidraw Component */}
              <div className="relative h-[300px] overflow-hidden rounded-b-lg">
                <Excalidraw />
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20" id="features">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Desygn?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Real-world Challenges",
                description:
                  "Practice with system design problems inspired by actual industry scenarios.",
              },
              {
                title: "Interactive Learning",
                description:
                  "Get immediate feedback and learn best practices as you solve each challenge.",
              },
              {
                title: "Interview Preparation",
                description:
                  "Prepare for technical interviews at top tech companies with our curated problems.",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition group text-white"
              >
                <CardHeader>
                  <CardTitle className="group-hover:text-purple-400 transition">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 my-10 rounded-2xl bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-white/10 relative overflow-hidden">
          <div className="absolute -z-10 top-1/2 left-1/4 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[100px]"></div>
          <div className="absolute -z-10 top-1/2 right-1/4 w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[100px]"></div>

          <div className="max-w-3xl mx-auto text-center px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to level up your system design skills?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join thousands of engineers who are mastering system design with
              Desygn.
            </p>
            <Button
              asChild
              variant="secondary"
              className="bg-white text-[#1a1c20] hover:bg-white/90 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]"
            >
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-6 text-lg"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
