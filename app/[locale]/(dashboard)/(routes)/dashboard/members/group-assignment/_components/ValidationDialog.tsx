"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { validateGroupAssignments } from "@/lib/actions/group-assignment.actions";
import { toast } from "sonner";

interface ValidationDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function ValidationDialog({ open, onClose }: ValidationDialogProps) {
  const [warnings, setWarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadValidation();
    }
  }, [open]);

  const loadValidation = async () => {
    try {
      setLoading(true);
      const data = await validateGroupAssignments();
      setWarnings(data);
    } catch (error) {
      toast.error("Failed to validate assignments");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getWarningIcon = (type: string) => {
    switch (type) {
      case "empty":
      case "no_elder":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "small":
      case "large":
      case "no_pioneer":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getWarningColor = (type: string) => {
    switch (type) {
      case "empty":
      case "no_elder":
        return "destructive";
      case "small":
      case "large":
      case "no_pioneer":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Validation Results</DialogTitle>
          <DialogDescription>
            Review warnings and issues with current group assignments
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 p-4 border rounded-lg">
                  <Skeleton className="h-5 w-5 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </>
          ) : warnings.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">All Good!</h3>
              <p className="text-muted-foreground">
                No issues found with current group assignments
              </p>
            </div>
          ) : (
            warnings.map((warning, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                {getWarningIcon(warning.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{warning.groupName}</span>
                    <Badge variant={getWarningColor(warning.type) as any}>
                      {warning.type.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{warning.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
