"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bold, Italic, Heading1, Heading2 } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({
  value,
  onChange,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after = "") => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    // Construct the new text
    const newText =
      textarea.value.substring(0, start) +
      before +
      selectedText +
      after +
      textarea.value.substring(end);

    // Update the state
    onChange(newText);

    // Set cursor position after update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleBold = () => insertText("**", "**");
  const handleItalic = () => insertText("*", "*");
  const handleH1 = () => insertText("# ");
  const handleH2 = () => insertText("## ");

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          handleBold();
          break;
        case "i":
          e.preventDefault();
          handleItalic();
          break;
        case "1":
          e.preventDefault();
          handleH1();
          break;
        case "2":
          e.preventDefault();
          handleH2();
          break;
        default:
          break;
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-white/10 bg-[#1e2028] p-2">
        <div className="flex items-center justify-between">
          <div className="text-white font-medium">Documentation</div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:text-white hover:bg-white/10"
              onClick={handleBold}
              title="Bold (Cmd+B)"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:text-white hover:bg-white/10"
              onClick={handleItalic}
              title="Italic (Cmd+I)"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:text-white hover:bg-white/10"
              onClick={handleH1}
              title="Heading 1 (Cmd+1)"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:text-white hover:bg-white/10"
              onClick={handleH2}
              title="Heading 2 (Cmd+2)"
            >
              <Heading2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full h-full p-4 bg-[#252830] text-white resize-none focus:outline-none font-mono text-sm"
        placeholder="Write your solution here using Markdown..."
        spellCheck="false"
      />
    </div>
  );
}
