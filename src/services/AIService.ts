import { logger } from "@/lib/logger";

interface TaskAssistRequest {
  taskTitle: string;
  description?: string;
  projectContext?: string;
}

interface TaskAssistResponse {
  subtasks: string[];
  priority: "low" | "medium" | "high" | "urgent";
  estimatedHours: number;
  blockers: string[];
  confidence: "low" | "medium" | "high";
  reasoning: string;
}

interface PredictionRequest {
  taskTitle: string;
  priority: string;
  assigneeId: string;
  completedTasks: number;
  avgDays: number;
  activeTasks: number;
}

interface PredictionResponse {
  estimatedDays: number;
  confidence: "low" | "medium" | "high";
  reasoning: string;
}

interface WorkloadAnalysis {
  alerts: Array<{
    assigneeId: string;
    activeTasks: number;
    severity: "low" | "medium" | "high";
    suggestion: string;
  }>;
  summary: string;
}

export class AIService {
  private apiKey: string;
  private apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
  }

  private isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  private async callGemini(prompt: string): Promise<string> {
    const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API error: ${response.status} — ${err}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }

  private parseJSON<T>(text: string, fallback: T): T {
    try {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]) as T;
      }
      return JSON.parse(text) as T;
    } catch {
      return fallback;
    }
  }

  async getTaskAssistance(req: TaskAssistRequest): Promise<TaskAssistResponse> {
    if (!this.isConfigured()) {
      return this.getMockTaskAssistance(req);
    }

    const prompt = `You are a project management assistant. Analyze this task and respond with ONLY valid JSON.

Task: "${req.taskTitle}"
Description: "${req.description || "No description provided"}"
Project context: "${req.projectContext || "General software project"}"

Respond with JSON in this exact format:
{
  "subtasks": ["subtask 1", "subtask 2", "subtask 3"],
  "priority": "medium",
  "estimatedHours": 8,
  "blockers": ["potential blocker 1"],
  "confidence": "high",
  "reasoning": "Brief explanation of the analysis"
}

priority must be one of: low, medium, high, urgent
confidence must be one of: low, medium, high`;

    try {
      const text = await this.callGemini(prompt);
      logger.info({ taskTitle: req.taskTitle }, "AI task assistance generated");
      return this.parseJSON<TaskAssistResponse>(text, this.getMockTaskAssistance(req));
    } catch (error) {
      logger.error({ err: error }, "AI task assist failed, using fallback");
      return this.getMockTaskAssistance(req);
    }
  }

  async predictCompletion(req: PredictionRequest): Promise<PredictionResponse> {
    if (!this.isConfigured()) {
      return this.getMockPrediction(req);
    }

    const prompt = `You are a project analytics expert. Predict task completion time and respond with ONLY valid JSON.

Task: "${req.taskTitle}" (Priority: ${req.priority})
Assignee history (last 30 days): ${req.completedTasks} tasks completed, average ${req.avgDays} days per task
Current workload: ${req.activeTasks} active tasks

Respond with JSON in this exact format:
{
  "estimatedDays": 3,
  "confidence": "medium",
  "reasoning": "Brief explanation"
}

confidence must be one of: low, medium, high`;

    try {
      const text = await this.callGemini(prompt);
      logger.info({ taskTitle: req.taskTitle }, "Completion prediction generated");
      return this.parseJSON<PredictionResponse>(text, this.getMockPrediction(req));
    } catch (error) {
      logger.error({ err: error }, "AI prediction failed, using fallback");
      return this.getMockPrediction(req);
    }
  }

  async analyzeWorkload(
    assigneeStats: Array<{ assigneeId: string; count: number; completed: number }>
  ): Promise<WorkloadAnalysis> {
    if (!this.isConfigured() || assigneeStats.length === 0) {
      return this.getMockWorkloadAnalysis(assigneeStats);
    }

    const statsText = assigneeStats
      .map((s) => `User ${s.assigneeId}: ${s.count} active tasks, ${s.completed} completed`)
      .join("\n");

    const prompt = `You are a team workload analyst. Analyze team workload and respond with ONLY valid JSON.

Team workload:
${statsText}

Respond with JSON in this exact format:
{
  "alerts": [
    {
      "assigneeId": "user_id_here",
      "activeTasks": 10,
      "severity": "high",
      "suggestion": "Consider redistributing 2-3 tasks to less busy team members"
    }
  ],
  "summary": "Overall team workload summary"
}

severity must be one of: low, medium, high. Only include alerts for users with genuinely unbalanced workloads.`;

    try {
      const text = await this.callGemini(prompt);
      logger.info({}, "Workload analysis generated");
      return this.parseJSON<WorkloadAnalysis>(text, this.getMockWorkloadAnalysis(assigneeStats));
    } catch (error) {
      logger.error({ err: error }, "AI workload analysis failed, using fallback");
      return this.getMockWorkloadAnalysis(assigneeStats);
    }
  }

  async semanticSearch(query: string, tasks: Array<{ _id: string; title: string; description?: string; status: string }>): Promise<string[]> {
    if (!this.isConfigured() || tasks.length === 0) return [];

    const taskList = tasks
      .slice(0, 50)
      .map((t) => `ID:${t._id} | ${t.title} (${t.status})`)
      .join("\n");

    const prompt = `Find the most relevant task IDs for the query: "${query}"

Tasks:
${taskList}

Respond with ONLY a JSON array of matching task IDs (most relevant first, max 10):
["id1", "id2", "id3"]`;

    try {
      const text = await this.callGemini(prompt);
      return this.parseJSON<string[]>(text, []);
    } catch {
      return [];
    }
  }

  private getMockTaskAssistance(req: TaskAssistRequest): TaskAssistResponse {
    return {
      subtasks: [
        `Research and define requirements for "${req.taskTitle}"`,
        "Create implementation plan and design",
        "Implement core functionality",
        "Write tests and review",
        "Document and deploy",
      ],
      priority: "medium",
      estimatedHours: 8,
      blockers: ["Requirements need clarification", "Dependencies on other tasks"],
      confidence: "medium",
      reasoning: "Based on the task title and context, this appears to be a standard development task.",
    };
  }

  private getMockPrediction(req: PredictionRequest): PredictionResponse {
    const basedays = req.avgDays > 0 ? req.avgDays : 3;
    const workloadFactor = 1 + req.activeTasks * 0.1;
    const priorityFactor = req.priority === "critical" ? 0.7 : req.priority === "high" ? 0.85 : 1;
    return {
      estimatedDays: Math.ceil(basedays * workloadFactor * priorityFactor),
      confidence: req.completedTasks > 5 ? "high" : "low",
      reasoning: `Based on ${req.completedTasks} completed tasks with avg ${req.avgDays} days, adjusted for current ${req.activeTasks} active tasks.`,
    };
  }

  private getMockWorkloadAnalysis(
    stats: Array<{ assigneeId: string; count: number; completed: number }>
  ): WorkloadAnalysis {
    const avg = stats.length > 0 ? stats.reduce((s, u) => s + u.count, 0) / stats.length : 0;
    const alerts = stats
      .filter((u) => u.count > avg * 1.5 && u.count > 5)
      .map((u) => ({
        assigneeId: u.assigneeId,
        activeTasks: u.count,
        severity: (u.count > avg * 2 ? "high" : "medium") as "low" | "medium" | "high",
        suggestion: `This team member has ${u.count} active tasks vs team average of ${Math.round(avg)}. Consider redistributing some tasks.`,
      }));

    return {
      alerts,
      summary:
        alerts.length > 0
          ? `${alerts.length} team member(s) have significantly above-average workloads.`
          : "Team workload appears balanced.",
    };
  }
}

export const aiService = new AIService();
