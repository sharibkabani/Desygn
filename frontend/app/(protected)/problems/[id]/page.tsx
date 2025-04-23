"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import LoggedInNavbar from "@/components/LoggedInNavbar";
import { FullPageLoading } from "@/components/Loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useDebounce } from "@/utils/useDebounce";
import { Problem } from "@/models/Problem";
import { User } from "@/models/User";

const defaultMarkdownContent = `# 🎩 Problem Overview

Summarize the problem, clarify assumptions, and define the key requirements.

---

## 🔧 Functional Requirements

- Describe what the system must do
- List user actions and system responses

---

## 📏 Non-Functional Requirements

- Scale, latency, availability, consistency, etc.

---

## 🏗️ High-Level Design

- Overview of main components
- Include a short description of the architecture you'll build

---

## 🛠️ Components

- Describe key components: DB, services, queues, caches, etc.
- Mention communication between services

---

## 📦 Data Model

- Show the schema or explain entities and relationships

---

## 🔁 API Design (Optional)`;

export default function ProblemDetail() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [markdownContent, setMarkdownContent] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [excalidrawContent, setExcalidrawContent] = useState<any>(null);

  const debouncedMarkdown = useDebounce(markdownContent, 1000);
  const debouncedDrawing = useDebounce(excalidrawContent, 1000);

  async function handleSubmit({
    userId,
    problemId,
    solutionText,
    excalidrawContent,
  }: {
    userId: string;
    problemId: number;
    solutionText: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    excalidrawContent: any;
  }) {
    try {
      // Show loading screen
      setLoading(true);

      const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          problem_id: problemId,
          solution_text: solutionText,
          diagram_data: excalidrawContent,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Error submitting:", error);
        alert("Submission failed: " + error.error);
        return;
      }

      // Parse the response to get the submission ID
      const { submission_id } = await res.json();

      // Navigate to the submission page
      router.push(`/submissions/${submission_id}`);
    } catch (err) {
      console.error("Submission error:", err);
      alert("Something went wrong during submission");
    } finally {
      // Hide loading screen
      // setLoading(false);
    }
  }

  useEffect(() => {
    const fetchProblemAndUser = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          router.push("/login");
          return;
        }

        setUser({
          avatar_url:
            userData.user.user_metadata.avatar_url || "/default-avatar.png",
          full_name: userData.user.user_metadata.full_name || "Anonymous",
          email: userData.user.email || "No email provided",
          id: userData.user.id,
        });

        const { data: problemData } = await supabase
          .from("problems")
          .select("*")
          .eq("id", params.id)
          .eq("is_published", true)
          .single();

        if (!problemData) {
          router.push("/problems");
          return;
        }

        setProblem(problemData);

        // Fetch the user's submission for this problem (draft or completed)
        const { data: submission } = await supabase
          .from("submissions")
          .select("solution_text, diagram_data, is_draft")
          .eq("problem_id", params.id)
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: false }) // Get the latest submission
          .limit(1)
          .single();

        if (submission) {
          // Load the previous submission data
          setMarkdownContent(submission.solution_text || "");
          if (submission.diagram_data) {
            try {
              setExcalidrawContent(submission.diagram_data);
            } catch (e) {
              console.error("Invalid diagram_data format", e);
            }
          }
        } else {
          // No previous submission, load default content
          setMarkdownContent(defaultMarkdownContent);
        }
      } catch (e) {
        console.error("Error loading problem or user", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProblemAndUser();
  }, [params.id, router]);

  useEffect(() => {
    if (!user || !problem) return;

    const saveDraft = async () => {
      try {
        // Check if the current submission is a draft
        const { data: existingSubmission } = await supabase
          .from("submissions")
          .select("is_draft")
          .eq("problem_id", problem.id)
          .eq("user_id", user.id)
          .single();

        if (existingSubmission && !existingSubmission.is_draft) {
          // Do not overwrite completed submissions
          return;
        }

        // Save or update the draft
        await supabase.from("submissions").upsert(
          {
            user_id: user.id,
            problem_id: problem.id,
            solution_text: debouncedMarkdown,
            diagram_data: debouncedDrawing,
            is_draft: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,problem_id" }
        );
      } catch (e) {
        console.error("Auto-save failed:", e);
      }
    };

    saveDraft();
  }, [debouncedMarkdown, debouncedDrawing, user, problem]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "hard":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  if (loading) return <FullPageLoading />;
  if (!user || !problem) return null;

  return (
    <div className="h-screen flex flex-col bg-[#1a1c20] text-white overflow-hidden">
      <LoggedInNavbar user={user} />
      <div className="border-b border-white/10 shrink-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white p-3 h-auto"
                  onClick={() => router.push("/problems")}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Problems
                </Button>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {problem.title}
              </h1>
              <p className="text-sm text-white/70">{problem.description}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <Badge
                  className={`${getDifficultyColor(problem.difficulty)} border`}
                >
                  {problem.difficulty}
                </Badge>
                {problem.tags?.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="border-white/20 text-white"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            {/* Submit Button */}
            <Button
              variant="default"
              size="sm"
              className="text-white p-3 h-auto cursor-pointer bg-green-700 hover:bg-green-600 font-bold"
              onClick={() =>
                handleSubmit({
                  userId: user.id,
                  problemId: problem.id,
                  solutionText: markdownContent,
                  excalidrawContent: excalidrawContent ?? [],
                })
              }
            >
              <ArrowRight className="w-4 h-4 mr-1" /> Submit Solution
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={40} minSize={25}>
            <div className="h-full bg-[#252830] border-r border-white/10 flex flex-col">
              <div className="text-white font-medium py-2 px-4 border-b border-white/10">
                Documentation
              </div>
              <div className="flex-1 overflow-y-auto">
                <Textarea
                  value={markdownContent}
                  onChange={(e) => setMarkdownContent(e.target.value)}
                  className="w-full h-full p-4 bg-[#121419] text-white resize-none focus:outline-none font-mono text-sm"
                  placeholder="Write your solution here using Markdown..."
                  spellCheck="false"
                />
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle className="bg-white/10 w-1 hover:bg-purple-500/50 transition-colors" />
          <ResizablePanel defaultSize={60} minSize={30}>
            <div className="h-full bg-[#252830] overflow-hidden flex flex-col">
              <div className="text-white font-medium py-2 px-4 border-b border-white/10">
                Diagram
              </div>
              <div className="flex-1 overflow-y-auto">
                <Excalidraw
                  initialData={{
                    ...excalidrawContent,
                    appState: {
                      ...excalidrawContent?.appState,
                      collaborators: new Map(), // ✅ ensures correct type
                    },
                    scrollToContent: true,
                  }}
                  onChange={(elements, appState) => {
                    const newData = {
                      elements,
                      appState: {
                        ...appState,
                        collaborators: undefined, // ❌ we don't store this
                      },
                    };

                    const newStr = JSON.stringify(newData);
                    const oldStr = JSON.stringify({
                      ...excalidrawContent,
                      appState: {
                        ...excalidrawContent?.appState,
                        collaborators: undefined,
                      },
                    });

                    if (newStr !== oldStr) {
                      setExcalidrawContent(newData);
                    }
                  }}
                  theme="dark"
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
