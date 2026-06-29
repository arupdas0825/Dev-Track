"use client";

import { motion } from "framer-motion";
import { X, FileText, Download, Printer, Database } from "lucide-react";
import { UserDashboardData } from "@/types";

interface ExportCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: UserDashboardData | null;
}

export default function ExportCenterModal({
  isOpen,
  onClose,
  data,
}: ExportCenterModalProps) {
  if (!isOpen || !data) return null;

  const handlePrintPDF = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `${data.profile.login}_devtrack_metrics.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Repository,Language,Stars,Forks\n";
    data.repositories.forEach((repo) => {
      csvContent += `"${repo.name}","${repo.language || "N/A"}",${repo.stargazers_count},${repo.forks_count}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${data.profile.login}_repositories.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleDownloadMarkdownReport = () => {
    const mdContent = `# Developer Report: ${data.profile.name || data.profile.login}
- **Username**: @${data.profile.login}
- **Developer Grade**: ${data.score.grade} (${data.score.overall}/100)
- **Total Repositories**: ${data.profile.public_repos}
- **Total Followers**: ${data.profile.followers}
- **Total Stars Earned**: ${data.contributions.totalStarsEarned}

## Top Languages
${data.languages.map((l) => `- **${l.name}**: ${l.percentage}%`).join("\n")}

Generated via DevTrack SaaS Platform.
`;
    const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.profile.login}_developer_report.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-xl border border-border bg-[#161B22] shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-border bg-[#0D1117]">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-accent" />
            <h3 className="text-sm font-bold font-space-grotesk text-text-primary">
              Export Center
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary rounded-lg p-1 hover:bg-surface transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handlePrintPDF}
            className="p-4 rounded-xl border border-border bg-surface/30 hover:bg-surface-secondary hover:border-accent/40 transition-all text-left flex flex-col justify-between group"
          >
            <Printer className="h-6 w-6 text-accent mb-3 group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-xs font-bold text-text-primary">Export Dashboard PDF</div>
              <div className="text-[11px] text-text-secondary mt-1">Print or save standard PDF snapshot</div>
            </div>
          </button>

          <button
            onClick={handleDownloadMarkdownReport}
            className="p-4 rounded-xl border border-border bg-surface/30 hover:bg-surface-secondary hover:border-accent/40 transition-all text-left flex flex-col justify-between group"
          >
            <FileText className="h-6 w-6 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-xs font-bold text-text-primary">Developer Summary Report</div>
              <div className="text-[11px] text-text-secondary mt-1">Download formatted Markdown summary</div>
            </div>
          </button>

          <button
            onClick={handleDownloadJSON}
            className="p-4 rounded-xl border border-border bg-surface/30 hover:bg-surface-secondary hover:border-accent/40 transition-all text-left flex flex-col justify-between group"
          >
            <Database className="h-6 w-6 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-xs font-bold text-text-primary">JSON Data Export</div>
              <div className="text-[11px] text-text-secondary mt-1">Full developer raw metrics payload</div>
            </div>
          </button>

          <button
            onClick={handleDownloadCSV}
            className="p-4 rounded-xl border border-border bg-surface/30 hover:bg-surface-secondary hover:border-accent/40 transition-all text-left flex flex-col justify-between group"
          >
            <Download className="h-6 w-6 text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-xs font-bold text-text-primary">CSV Repositories Data</div>
              <div className="text-[11px] text-text-secondary mt-1">Export repository list spreadsheet</div>
            </div>
          </button>
        </div>

        <div className="p-3 border-t border-border bg-[#0D1117] text-center text-[10px] font-mono text-text-secondary">
          DevTrack Automated Data Exporter
        </div>
      </motion.div>
    </div>
  );
}
