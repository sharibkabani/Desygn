"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoggedInNavbar from "@/components/LoggedInNavbar";
import { FullPageLoading } from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Filter, SortDesc, Calendar, Trophy } from "lucide-react";
import SubmissionCard from "@/components/SubmissionCard";
import { supabase } from "@/utils/supabase";
import { User } from "@/models/User";
import { Submission } from "@/models/Submission";

type SortOption = "newest" | "oldest" | "highest" | "lowest";
type FilterOption =
  | "all"
  | "passed"
  | "failed"
  | "needs-improvement"
  | "drafts";

export default function MySubmissions() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  useEffect(() => {
    const fetchUserAndSubmissions = async () => {
      try {
        // Fetch user data
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          router.push("/login");
          return;
        }

        setUser({
          id: userData.user.id,
          avatar_url:
            userData.user.user_metadata.avatar_url || "/default-avatar.png",
          full_name: userData.user.user_metadata.full_name || "Anonymous",
          email: userData.user.email || "No email provided",
        });

        // Fetch submissions and join with problems to get problem titles
        const { data: submissionsData, error } = await supabase
          .from("submissions")
          .select(
            `
          id,
          problem_id,
          feedback,
          created_at,
          is_draft,
          user_id,
          problems:problems!submissions_problem_id_fkey (
            title
          )
        `
          )
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching submissions:", error);
          return;
        }

        // Transform the data to match our component needs
        const formattedSubmissions = submissionsData.map((submission) => ({
          id: submission.id,
          problem_id: submission.problem_id,
          problem_title: submission.problems?.title || "Unknown Problem",
          feedback: submission.feedback,
          created_at: submission.created_at,
          is_draft: submission.is_draft,
          user_id: submission.user_id,
        }));

        setSubmissions(formattedSubmissions);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndSubmissions();
  }, [router]);

  // Sort submissions based on selected option
  const sortedSubmissions = [...submissions].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "oldest":
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case "highest":
        return (b.feedback?.score || 0) - (a.feedback?.score || 0);
      case "lowest":
        return (a.feedback?.score || 0) - (b.feedback?.score || 0);
      default:
        return 0;
    }
  });

  // Filter submissions based on selected option
  const filteredSubmissions = sortedSubmissions.filter((submission) => {
    const score = submission.feedback?.score || 0;

    switch (filterBy) {
      case "passed":
        return !submission.is_draft && score >= 80;
      case "failed":
        return !submission.is_draft && score < 60;
      case "needs-improvement":
        return !submission.is_draft && score >= 60 && score < 80;
      case "drafts":
        return submission.is_draft;
      default:
        return true; // Show all submissions
    }
  });

  // Get stats
  const stats = {
    total: submissions.length,
    passed: submissions.filter(
      (s) => !s.is_draft && (s.feedback?.score || 0) >= 80
    ).length,
    drafts: submissions.filter((s) => s.is_draft).length,
    averageScore: submissions.filter((s) => !s.is_draft && s.feedback?.score)
      .length
      ? Math.round(
          submissions
            .filter((s) => !s.is_draft && s.feedback?.score)
            .reduce((acc, s) => acc + (s.feedback?.score || 0), 0) /
            submissions.filter((s) => !s.is_draft && s.feedback?.score).length
        )
      : 0,
  };

  if (loading) {
    return <FullPageLoading message="Loading your submissions..." />;
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
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Submissions</h1>
            <p className="text-white/70 mt-1">
              Review your past system design submissions
            </p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Button
                variant="outline"
                className="border-white/10 text-white hover:bg-white/10 flex items-center gap-2 hover:text-white"
                onClick={() => {
                  setShowFilterDropdown(!showFilterDropdown);
                  setShowSortDropdown(false);
                }}
              >
                <Filter className="w-4 h-4" /> Filter
              </Button>
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-[#252830] rounded-lg shadow-lg z-10 border border-white/10 py-1">
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      filterBy === "all"
                        ? "bg-white/10 text-white"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                    onClick={() => {
                      setFilterBy("all");
                      setShowFilterDropdown(false);
                    }}
                  >
                    All Submissions
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      filterBy === "drafts"
                        ? "bg-white/10 text-white"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                    onClick={() => {
                      setFilterBy("drafts");
                      setShowFilterDropdown(false);
                    }}
                  >
                    Drafts
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      filterBy === "passed"
                        ? "bg-white/10 text-white"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                    onClick={() => {
                      setFilterBy("passed");
                      setShowFilterDropdown(false);
                    }}
                  >
                    Passed
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      filterBy === "needs-improvement"
                        ? "bg-white/10 text-white"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                    onClick={() => {
                      setFilterBy("needs-improvement");
                      setShowFilterDropdown(false);
                    }}
                  >
                    Needs Improvement
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      filterBy === "failed"
                        ? "bg-white/10 text-white"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                    onClick={() => {
                      setFilterBy("failed");
                      setShowFilterDropdown(false);
                    }}
                  >
                    Failed
                  </button>
                </div>
              )}
            </div>
            <div className="relative">
              <Button
                variant="outline"
                className="border-white/10 text-white hover:bg-white/10 flex items-center gap-2 hover:text-white"
                onClick={() => {
                  setShowSortDropdown(!showSortDropdown);
                  setShowFilterDropdown(false);
                }}
              >
                <SortDesc className="w-4 h-4" /> Sort
              </Button>
              {showSortDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-[#252830] rounded-lg shadow-lg z-10 border border-white/10 py-1">
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      sortBy === "newest"
                        ? "bg-white/10 text-white"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                    onClick={() => {
                      setSortBy("newest");
                      setShowSortDropdown(false);
                    }}
                  >
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" /> Newest First
                    </div>
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      sortBy === "oldest"
                        ? "bg-white/10 text-white"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                    onClick={() => {
                      setSortBy("oldest");
                      setShowSortDropdown(false);
                    }}
                  >
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" /> Oldest First
                    </div>
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      sortBy === "highest"
                        ? "bg-white/10 text-white"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                    onClick={() => {
                      setSortBy("highest");
                      setShowSortDropdown(false);
                    }}
                  >
                    <div className="flex items-center">
                      <Trophy className="w-4 h-4 mr-2" /> Highest Score
                    </div>
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      sortBy === "lowest"
                        ? "bg-white/10 text-white"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                    onClick={() => {
                      setSortBy("lowest");
                      setShowSortDropdown(false);
                    }}
                  >
                    <div className="flex items-center">
                      <Trophy className="w-4 h-4 mr-2" /> Lowest Score
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="text-sm text-white/70">Total Submissions</div>
            <div className="text-3xl font-bold mt-1">{stats.total}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="text-sm text-white/70">Passed</div>
            <div className="text-3xl font-bold mt-1 text-green-400">
              {stats.passed}
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="text-sm text-white/70">
              {stats.drafts > 0 ? "Drafts" : "Average Score"}
            </div>
            <div className="text-3xl font-bold mt-1">
              {stats.drafts > 0 ? stats.drafts : stats.averageScore}
            </div>
          </div>
        </div>

        {/* Submissions list */}
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
              <p className="text-white/70">
                No submissions found matching your filters.
              </p>
              {filterBy !== "all" && (
                <Button
                  variant="link"
                  className="text-purple-400 hover:text-purple-300 mt-2"
                  onClick={() => setFilterBy("all")}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            filteredSubmissions.map((submission) => (
              <SubmissionCard
                key={submission.id}
                id={submission.id}
                problem_id={submission.problem_id}
                problem_title={submission.problem_title}
                feedback={submission.feedback}
                created_at={submission.created_at}
                is_draft={submission.is_draft}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
