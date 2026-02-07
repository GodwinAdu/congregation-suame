"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { getAssignmentHistory } from "@/lib/actions/group-assignment.actions";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function HistoryView() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getAssignmentHistory(50);
      setHistory(data);
    } catch (error) {
      toast.error("Failed to load history");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case "members_assigned_to_group":
        return "bg-blue-500";
      case "groups_balanced":
        return "bg-green-500";
      case "members_removed_from_group":
        return "bg-red-500";
      case "members_swapped":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assignment History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignment History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No history available</p>
          ) : (
            history.map((item) => (
              <div key={item._id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                <div className={`h-10 w-10 rounded-full ${getActionColor(item.actionType)} flex items-center justify-center text-white`}>
                  <Clock className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {item.actionType.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
