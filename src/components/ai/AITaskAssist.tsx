"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  AlertCircle,
  Clock,
  Zap,
} from "lucide-react";

interface AIAssistResponse {
  subtasks: string[];
  priority: "low" | "medium" | "high" | "urgent";
  estimatedHours: number;
  blockers: string[];
  confidence: "low" | "medium" | "high";
  reasoning: string;
}

interface AITaskAssistProps {
  taskTitle: string;
  description?: string;
  projectContext?: string;
}

const PRIORITY_COLORS = {
  low: "text-green-600 bg-green-50 dark:bg-green-900/20",
  medium: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
  high: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
  urgent: "text-red-600 bg-red-50 dark:bg-red-900/20",
};

const CONFIDENCE_COLORS = {
  low: "text-red-500",
  medium: "text-yellow-500",
  high: "text-green-500",
};

export default function AITaskAssist({ taskTitle, description, projectContext }: AITaskAssistProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAssistResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSubtasks, setShowSubtasks] = useState(true);

  const handleFetch = async () => {
    if (result) {
      setOpen((o) => !o);
      return;
    }
    setLoading(true);
    setError(null);
    setOpen(true);
    try {
      const res = await fetch("/api/ai/task-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskTitle, description, projectContext }),
      });
      const json = await res.json();
      if (json.success) {
        setResult(json.data);
      } else {
        setError(json.error ?? "Failed to get AI suggestions");
      }
    } catch {
      setError("Failed to connect to AI service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleFetch}
        disabled={loading}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {loading ? "Analyzing..." : result ? (open ? "Hide AI Suggestions" : "Show AI Suggestions") : "AI Suggest"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 border border-indigo-200 dark:border-indigo-800 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                    AI Analysis
                  </span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {loading && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                  Analyzing task with Gemini AI...
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {result && !loading && (
                <div className="space-y-3">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLORS[result.priority]}`}>
                        {result.priority}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">Priority</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {result.estimatedHours}h
                      </span>
                      <span className="text-xs text-gray-500">Estimated</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <span className={`text-sm font-bold ${CONFIDENCE_COLORS[result.confidence]}`}>
                        {result.confidence}
                      </span>
                      <span className="text-xs text-gray-500">Confidence</span>
                    </div>
                  </div>

                  {/* Reasoning */}
                  <p className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
                    {result.reasoning}
                  </p>

                  {/* Subtasks */}
                  <div>
                    <button
                      className="flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300 w-full"
                      onClick={() => setShowSubtasks((s) => !s)}
                    >
                      <CheckSquare className="h-3.5 w-3.5 text-indigo-500" />
                      Suggested Subtasks ({result.subtasks.length})
                      {showSubtasks ? (
                        <ChevronUp className="h-3.5 w-3.5 ml-auto" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 ml-auto" />
                      )}
                    </button>
                    <AnimatePresence>
                      {showSubtasks && (
                        <motion.ul
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="mt-1.5 space-y-1"
                        >
                          {result.subtasks.map((subtask, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                              <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded border border-gray-300 dark:border-gray-600" />
                              {subtask}
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Blockers */}
                  {result.blockers.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5 text-orange-500" />
                        Potential Blockers
                      </p>
                      <ul className="mt-1 space-y-1">
                        {result.blockers.map((blocker, i) => (
                          <li key={i} className="text-xs text-orange-600 dark:text-orange-400 flex items-start gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                            {blocker}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
