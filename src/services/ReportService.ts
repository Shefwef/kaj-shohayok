export interface ReportData {
  title: string;
  generatedAt: string;
  projects?: any[];
  tasks?: any[];
  summary?: Record<string, number | string>;
  dateRange?: { from: string; to: string };
}

export interface IReportGenerator {
  mimeType: string;
  extension: string;
  generate(data: ReportData): string | Buffer;
}

export class JSONReportGenerator implements IReportGenerator {
  mimeType = "application/json";
  extension = "json";

  generate(data: ReportData): string {
    return JSON.stringify(data, null, 2);
  }
}

export class CSVReportGenerator implements IReportGenerator {
  mimeType = "text/csv";
  extension = "csv";

  generate(data: ReportData): string {
    const lines: string[] = [`# ${data.title}`, `# Generated: ${data.generatedAt}`, ""];

    if (data.summary) {
      lines.push("## Summary");
      Object.entries(data.summary).forEach(([k, v]) => lines.push(`${k},${v}`));
      lines.push("");
    }

    if (data.projects && data.projects.length > 0) {
      lines.push("## Projects");
      lines.push("Name,Status,Priority,Progress,StartDate");
      data.projects.forEach((p) =>
        lines.push(
          [
            `"${String(p.name).replace(/"/g, '""')}"`,
            p.status,
            p.priority,
            p.progress ?? 0,
            p.startDate ? new Date(p.startDate).toISOString().split("T")[0] : "",
          ].join(",")
        )
      );
      lines.push("");
    }

    if (data.tasks && data.tasks.length > 0) {
      lines.push("## Tasks");
      lines.push("Title,Status,Priority,AssigneeId,DueDate");
      data.tasks.forEach((t) =>
        lines.push(
          [
            `"${String(t.title).replace(/"/g, '""')}"`,
            t.status,
            t.priority,
            t.assigneeId || "",
            t.dueDate ? new Date(t.dueDate).toISOString().split("T")[0] : "",
          ].join(",")
        )
      );
    }

    return lines.join("\n");
  }
}

export class ReportFactory {
  static create(format: "json" | "csv"): IReportGenerator {
    const generators: Record<string, IReportGenerator> = {
      json: new JSONReportGenerator(),
      csv: new CSVReportGenerator(),
    };
    return generators[format] ?? generators.json;
  }
}
