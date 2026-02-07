"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { exportAssignments } from "@/lib/actions/group-assignment.actions";
import { toast } from "sonner";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function ExportDialog({ open, onClose }: ExportDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: "csv" | "print") => {
    try {
      setLoading(true);
      const data = await exportAssignments();

      if (format === "csv") {
        const csv = convertToCSV(data);
        downloadCSV(csv, "group-assignments.csv");
        toast.success("Exported successfully");
      } else {
        printData(data);
      }

      onClose();
    } catch (error) {
      toast.error("Failed to export");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const convertToCSV = (data: any[]) => {
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) => Object.values(row).join(","));
    return [headers, ...rows].join("\n");
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const printData = (data: any[]) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Group Assignments</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Group Assignments</h1>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Gender</th>
                <th>Group</th>
                <th>Pioneer Status</th>
                <th>Privileges</th>
              </tr>
            </thead>
            <tbody>
              ${data.map((row) => `
                <tr>
                  <td>${row.Name}</td>
                  <td>${row.Gender}</td>
                  <td>${row.Group}</td>
                  <td>${row.PioneerStatus}</td>
                  <td>${row.Privileges}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px;">Print</button>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Assignments</DialogTitle>
          <DialogDescription>
            Choose how you want to export the group assignments
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          <Button
            onClick={() => handleExport("csv")}
            disabled={loading}
            className="w-full gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            Export as CSV
          </Button>
          <Button
            onClick={() => handleExport("print")}
            disabled={loading}
            variant="outline"
            className="w-full gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            Print Roster
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
