"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getTerritoryStatsByGroup } from "@/lib/actions/territory-management.actions";
import { toast } from "sonner";

export default function StatsView() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getTerritoryStatsByGroup();
      setStats(data);
    } catch (error) {
      toast.error("Failed to load statistics");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((group) => (
        <Card key={group.groupId}>
          <CardHeader>
            <CardTitle>{group.groupName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Total Territories:</span>
              <span className="font-bold">{group.totalTerritories}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Assigned:</span>
              <span className="font-bold text-green-600">{group.assignedTerritories}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Available:</span>
              <span className="font-bold text-blue-600">{group.availableTerritories}</span>
            </div>
            <div className="pt-2 border-t space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Easy:</span>
                <span>{group.easyCount}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Medium:</span>
                <span>{group.mediumCount}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Hard:</span>
                <span>{group.hardCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
