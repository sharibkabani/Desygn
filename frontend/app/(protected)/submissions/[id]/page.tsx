"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import LoggedInNavbar from "@/components/LoggedInNavbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/utils/supabase";
import "@excalidraw/excalidraw/index.css";
import { Excalidraw } from "@excalidraw/excalidraw";
import { FullPageLoading } from "@/components/Loading";
import { Submission } from "@/models/Submission";
import { User } from "@/models/User";

export default function SubmissionDetail() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("written");
  const [submission, setSubmission] = useState<Submission>({
    id: "",
    problemId: "",
    problemTitle: "",
    writtenExplanation: [],
    diagram_data: [],
    feedback: {
      score: 0,
      strengths: [],
      improvements: [],
    },
    submittedAt: "",
    user_id: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        setUser({
          avatar_url:
            userData.user.user_metadata?.avatar_url || "/default-avatar.png",
          full_name: userData.user.user_metadata?.full_name || "Anonymous",
          email: userData.user.email || "No email provided",
          id: userData.user.id || "",
        });
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("submissions")
          .select(
            `
            id, 
            problem_id, 
            solution_text, 
            diagram_data, 
            feedback, 
            created_at, 
            user_id, 
            problems:problems!submissions_problem_id_fkey (
              title, 
              description
            )
            `
          )
          .eq("id", params.id)
          .single();

        if (error) throw error;

        // Parse feedback JSON and provide default values
        const formattedSubmission: Submission = {
          ...data,
          problemId: data.problem_id,
          problemTitle: data.problems?.title || "Unknown Problem", // Access as a single object
          writtenExplanation: data.solution_text.split("\n"),
          diagram_data: data.diagram_data || [],
          feedback: {
            score: data.feedback?.score || 0,
            strengths: data.feedback?.strengths || [],
            improvements: data.feedback?.improvements || [],
          },
          submittedAt: data.created_at,
          user_id: data.user_id,
        };
        setSubmission(formattedSubmission);
        setError(null);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Error fetching submission:", err);
        router.push("/submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [params.id, router]);

  // Function to determine score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Invalid Date"
      : new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(date);
  };

  if (loading) {
    return <FullPageLoading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1c20] text-white">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1c20] text-white">
      {user && (
        <LoggedInNavbar
          user={{
            avatar_url: user.avatar_url,
            full_name: user.full_name,
            email: user.email,
          }}
        />
      )}

      <div className="container mx-auto px-4 py-6">
        {/* Header with back button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:text-black p-0 h-auto mb-2 py-3 "
            onClick={() => router.push("/submissions")}
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> All Submissions
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">
            {submission.problemTitle}
          </h1>
          <p className="text-white/70">
            Submitted on {formatDate(submission.submittedAt)}
          </p>
        </div>

        {/* Top section with score and tabs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Score circle */}
          <div className="flex items-center">
            <div className="relative flex flex-col justify-center items-center w-full h-full">
              <div
                className={`w-80 h-80 rounded-full flex items-center justify-center ${getScoreColor(
                  submission.feedback.score
                )} text-white font-bold text-8xl relative`}
              >
                {submission.feedback.score}
                <div className="absolute bottom-[-20px] bg-[#252830] px-6 py-3 rounded-full text-lg font-medium border border-white/10">
                  Score
                </div>
              </div>
            </div>
          </div>

          {/* Tabs for written explanation and diagram */}
          <div className="bg-[#252830] rounded-lg border border-white/10 overflow-hidden h-[500px]">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full h-full flex flex-col"
            >
              {/* Tabs header */}
              <div className="border-b border-white/10 px-4 shrink-0">
                <TabsList className="bg-transparent h-12">
                  <TabsTrigger
                    value="written"
                    className="data-[state=active]:bg-[#1a1c20]/50 text-white font-bold"
                  >
                    Written Explanation
                  </TabsTrigger>
                  <TabsTrigger
                    value="diagram"
                    className="data-[state=active]:bg-[#1a1c20]/50 text-white font-bold"
                  >
                    Diagram
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab content wrapper */}
              <div className="flex-1 overflow-hidden relative">
                {/* Written Tab */}
                <div
                  className={`${
                    activeTab === "written" ? "block" : "hidden"
                  } h-full`}
                >
                  <div className="h-full overflow-auto p-4 font-mono text-sm whitespace-pre-wrap">
                    {submission.writtenExplanation.map((line, index) => (
                      <p key={index} className="mb-2">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Diagram Tab */}
                <div
                  className={`${
                    activeTab === "diagram" ? "block" : "hidden"
                  } h-full`}
                >
                  <div className="h-full w-full overflow-hidden">
                    {activeTab === "diagram" && (
                      <Excalidraw
                        initialData={{
                          elements: submission.diagram_data?.elements ?? [],
                          appState: {
                            ...(submission.diagram_data?.appState ?? {}),
                            collaborators: new Map(),
                            theme: "dark",
                          },
                          scrollToContent: true,
                        }}
                        theme="dark"
                        viewModeEnabled
                      />
                    )}
                  </div>
                </div>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Bottom section with strengths and improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="bg-[#252830] rounded-lg border border-white/10 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <div className="w-2 h-6 bg-green-500 rounded-full mr-3"></div>
              Strengths
            </h3>
            <ul className="space-y-3">
              {submission.feedback.strengths.map(
                (strength: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="min-w-5 mt-1.5 mr-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <span>{strength}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="bg-[#252830] rounded-lg border border-white/10 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <div className="w-2 h-6 bg-yellow-500 rounded-full mr-3"></div>
              Areas for Improvement
            </h3>
            <ul className="space-y-3">
              {submission.feedback.improvements.map(
                (improvement: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="min-w-5 mt-1.5 mr-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    </div>
                    <span>{improvement}</span>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex justify-end gap-4">
          <Button
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            onClick={() => router.push("/problems/" + submission.problemId)}
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
