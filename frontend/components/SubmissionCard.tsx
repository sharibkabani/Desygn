"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Edit } from "lucide-react";
import Link from "next/link";

interface SubmissionCardProps {
  id: string;
  problem_id: string;
  problem_title: string;
  feedback?: {
    score?: number;
    strengths?: string[];
    improvements?: string[];
  };
  created_at: string;
  is_draft: boolean;
}

export default function SubmissionCard({
  id,
  problem_id,
  problem_title,
  feedback,
  created_at,
  is_draft,
}: SubmissionCardProps) {
  // Get score from feedback if available
  const score = feedback?.score || 0;

  // Function to determine score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {!is_draft ? (
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center ${getScoreColor(
                  score
                )} text-white font-bold text-xl`}
              >
                {score}
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white/10 text-white/70 border border-white/20">
                <Edit className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold text-white">
                  {problem_title}
                </h3>
                {is_draft && (
                  <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Draft
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <span className="text-sm text-white/60">
                  Submitted on {formatDate(created_at)}
                </span>
                {!is_draft && score > 0 && (
                  <>
                    <span className="text-sm text-white/60">•</span>
                    <span
                      className={`text-sm ${
                        score >= 80
                          ? "text-green-400"
                          : score >= 60
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {score >= 80
                        ? "Passed"
                        : score >= 60
                        ? "Needs Improvement"
                        : "Failed"}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            {!is_draft ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 text-white hover:bg-white/10 flex-1 md:flex-auto hover:text-white"
                  asChild
                >
                  <Link href={`/submissions/${id}`}>
                    View Submission <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 flex-1 md:flex-auto"
                  asChild
                >
                  <Link href={`/problems/${problem_id}`}>Try Again</Link>
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 flex-1 md:flex-auto"
                asChild
              >
                <Link href={`/problems/${problem_id}`}>Continue Problem</Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
