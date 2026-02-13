"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2, Printer } from "lucide-react";
import { exportAssignments } from "@/lib/actions/group-assignment.actions";
import { toast } from "sonner";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function ExportDialog({ open, onClose }: ExportDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: "csv" | "print" | "printByGroup") => {
    try {
      setLoading(true);
      const data = await exportAssignments();

      if (format === "csv") {
        const csv = convertToCSV(data);
        downloadCSV(csv, "group-assignments.csv");
        toast.success("Exported successfully");
      } else if (format === "print") {
        printData(data);
      } else {
        printByGroup(data);
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

  const printByGroup = (data: any[]) => {
    const groupedData = data.reduce((acc: any, member: any) => {
      const group = member.Group || 'Unassigned';
      if (!acc[group]) acc[group] = [];
      acc[group].push(member);
      return acc;
    }, {});

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Field Service Groups</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { 
              font-family: 'Arial', sans-serif; 
              margin: 0;
              padding: 0;
              background: white;
            }
            .page-break { page-break-after: always; }
            .group-page {
              padding: 30px;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 15px;
              border-bottom: 4px solid #2563eb;
            }
            .header h1 {
              margin: 0 0 10px 0;
              font-size: 32px;
              font-weight: bold;
              color: #1e40af;
            }
            .header p {
              margin: 0;
              font-size: 14px;
              color: #64748b;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            thead {
              background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
              color: white;
            }
            th {
              padding: 15px;
              text-align: left;
              font-weight: 600;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            th:first-child {
              width: 60px;
              text-align: center;
            }
            tbody tr {
              border-bottom: 1px solid #e2e8f0;
            }
            tbody tr:nth-child(even) {
              background: #f8fafc;
            }
            tbody tr:hover {
              background: #f1f5f9;
            }
            td {
              padding: 12px 15px;
              font-size: 15px;
              color: #334155;
            }
            td:first-child {
              text-align: center;
              font-weight: 600;
              color: #64748b;
            }
            .footer {
              margin-top: auto;
              padding-top: 20px;
              text-align: center;
              color: #94a3b8;
              font-size: 12px;
              border-top: 1px solid #e2e8f0;
            }
            @media print {
              .no-print { display: none; }
              body { background: white; }
            }
          </style>
        </head>
        <body>
          ${Object.entries(groupedData).map(([groupName, members]: [string, any], index) => `
            <div class="group-page${index < Object.keys(groupedData).length - 1 ? ' page-break' : ''}">
              <div class="header">
                <h1>${groupName}</h1>
                <p>${members.length} ${members.length === 1 ? 'Member' : 'Members'}</p>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                  </tr>
                </thead>
                <tbody>
                  ${members.map((member: any, idx: number) => `
                    <tr>
                      <td>${idx + 1}</td>
                      <td>${member.Name}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div class="footer">
                <p>Printed on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          `).join('')}
          <button class="no-print" onclick="window.print()" style="position: fixed; bottom: 20px; right: 20px; padding: 12px 24px; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">Print All Groups</button>
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
            onClick={() => handleExport("printByGroup")}
            disabled={loading}
            className="w-full gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
            Print by Group (For KH)
          </Button>
          <Button
            onClick={() => handleExport("csv")}
            disabled={loading}
            variant="outline"
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
            Print All (Table)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
