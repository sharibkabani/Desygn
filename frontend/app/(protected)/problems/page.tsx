"use client";

import { useEffect, useState } from "react";
import LoggedInNavbar from "@/components/LoggedInNavbar";
import { supabase } from "@/utils/supabase";
import { FullPageLoading } from "@/components/Loading";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Filter, SortDesc } from "lucide-react";
import Link from "next/link";
import { Problem } from "@/models/Problem";
import { User } from "@/models/User";

export default function Problems() {
  const [user, setUser] = useState<User | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "difficulty">(
    "newest"
  );

  useEffect(() => {
    const fetchUserAndProblems = async () => {
      try {
        // Fetch user data
        const { data: userData } = await supabase.auth.getUser();

        if (userData.user) {
          setUser({
            id: userData.user.id,
            avatar_url:
              userData.user.user_metadata.avatar_url || "/default-avatar.png",
            full_name: userData.user.user_metadata.full_name || "Anonymous",
            email: userData.user.email || "No email provided",
          });

          // Fetch problems data
          let query = supabase
            .from("problems")
            .select("*")
            .eq("is_published", true);

          // Apply sorting
          switch (sortBy) {
            case "newest":
              query = query.order("created_at", { ascending: false });
              break;
            case "oldest":
              query = query.order("created_at", { ascending: true });
              break;
            case "difficulty":
              // Custom sorting for difficulty (easy, medium, hard)
              query = query.order("difficulty_rank", { ascending: true });
              break;
          }

          // Apply filtering if needed
          if (filter) {
            query = query.contains("tags", [filter]);
          }

          const { data: problemsData, error } = await query;

          if (error) {
            console.error("Error fetching problems:", error);
            return;
          }

          // Fetch user's submissions for these problems
          const { data: submissionsData } = await supabase
            .from("submissions")
            .select("id, problem_id, is_draft")
            .eq("user_id", userData.user.id);

          // Map submissions to problems
          const problemsWithSubmissions = problemsData?.map((problem) => {
            const userSubmission =
              submissionsData?.find((sub) => sub.problem_id === problem.id) ||
              null;
            return {
              ...problem,
              userSubmission,
            };
          });

          setProblems(problemsWithSubmissions || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProblems();
  }, [filter, sortBy]);

  const handleFilterChange = (newFilter: string | null) => {
    setFilter(newFilter);
    setLoading(true);
  };

  const handleSortChange = (newSort: "newest" | "oldest" | "difficulty") => {
    setSortBy(newSort);
    setLoading(true);
  };

  if (loading) {
    return <FullPageLoading message="Loading problems..." />;
  }

  if (!user) {
    // Redirect to login or show an error
    return null;
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
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

  // Get unique tags for filtering
  const allTags = Array.from(
    new Set(problems.flatMap((problem) => problem.tags || []))
  );

  // Check if a problem was created within the last 7 days
  const isNew = (createdAt: string) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return new Date(createdAt) > oneWeekAgo;
  };

  return (
    <div className="min-h-screen bg-[#1a1c20] text-white">
      <LoggedInNavbar user={user} />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">System Design Problems</h1>
            <p className="text-white/70 mt-1">
              Practice with real-world system design challenges
            </p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Button
                variant="outline"
                className="border-white/10 text-white hover:bg-white/10 flex items-center gap-2 hover:text-white"
                onClick={() =>
                  document
                    .getElementById("filterDropdown")
                    ?.classList.toggle("hidden")
                }
              >
                <Filter className="w-4 h-4" /> Filter
              </Button>
              <div
                id="filterDropdown"
                className="absolute right-0 mt-2 w-48 bg-[#252830] rounded-lg shadow-lg z-10 border border-white/10 hidden"
              >
                <div className="py-1">
                  <button
                    onClick={() => handleFilterChange(null)}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      filter === null
                        ? "bg-white/10 text-white"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    All Problems
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleFilterChange(tag)}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        filter === tag
                          ? "bg-white/10 text-white"
                          : "text-white/80 hover:bg-white/10"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="relative">
              <Button
                variant="outline"
                className="border-white/10 text-white hover:bg-white/10 flex items-center gap-2 hover:text-white"
                onClick={() =>
                  document
                    .getElementById("sortDropdown")
                    ?.classList.toggle("hidden")
                }
              >
                <SortDesc className="w-4 h-4" /> Sort
              </Button>
              <div
                id="sortDropdown"
                className="absolute right-0 mt-2 w-48 bg-[#252830] rounded-lg shadow-lg z-10 border border-white/10 hidden"
              >
                <div className="py-1">
                  <button
                    onClick={() => handleSortChange("newest")}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      sortBy === "newest"
                        ? "bg-white/10 text-white"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    Newest First
                  </button>
                  <button
                    onClick={() => handleSortChange("oldest")}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      sortBy === "oldest"
                        ? "bg-white/10 text-white"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    Oldest First
                  </button>
                  <button
                    onClick={() => handleSortChange("difficulty")}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      sortBy === "difficulty"
                        ? "bg-white/10 text-white"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    By Difficulty
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {problems.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
              <div className="text-white/50 text-lg mb-4">
                No problems found
              </div>
              <p className="text-white/70 mb-6">
                {filter
                  ? `No problems match the "${filter}" filter.`
                  : "There are no published problems yet."}
              </p>
              {filter && (
                <Button
                  variant="outline"
                  onClick={() => handleFilterChange(null)}
                >
                  Clear Filter
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {problems.map((problem) => (
              <Card
                key={problem.id}
                className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold text-white">
                        {problem.title}
                      </h3>
                      {isNew(problem.created_at) && (
                        <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          New
                        </Badge>
                      )}
                      {problem.userSubmission && (
                        <Badge
                          className={
                            problem.userSubmission.is_draft
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : "bg-green-500/20 text-green-400 border border-green-500/30"
                          }
                        >
                          {problem.userSubmission.is_draft
                            ? "In Progress"
                            : "Completed"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-white/70 mt-1 line-clamp-2">
                      {problem.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <Badge
                        className={`${getDifficultyColor(
                          problem.difficulty
                        )} border`}
                      >
                        {problem.difficulty}
                      </Badge>
                      {problem.tags &&
                        problem.tags.map((tag) => (
                          <span key={tag} className="text-sm text-white/60">
                            {tag}
                          </span>
                        ))}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 whitespace-nowrap"
                    asChild
                  >
                    <Link href={`/problems/${problem.id}`}>
                      {problem.userSubmission
                        ? problem.userSubmission.is_draft
                          ? "Continue"
                          : "Review"
                        : "Solve"}{" "}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
