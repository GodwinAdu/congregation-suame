"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, Award, Shield } from "lucide-react";
import { getGroupAnalytics } from "@/lib/actions/group-assignment.actions";
import { toast } from "sonner";

export default function AnalyticsView() {
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getGroupAnalytics();
      setAnalytics(data);
    } catch (error) {
      toast.error("Failed to load analytics");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analytics.map((group) => (
          <Card key={group.groupId}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{group.groupName}</span>
                <span className="text-2xl font-bold">{group.totalMembers}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>Male / Female</span>
                </div>
                <span className="font-medium">
                  {group.maleCount} / {group.femaleCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-green-500" />
                  <span>Pioneers</span>
                </div>
                <span className="font-medium">{group.pioneerCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-500" />
                  <span>Elders</span>
                </div>
                <span className="font-medium">{group.elderCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-orange-500" />
                  <span>MS</span>
                </div>
                <span className="font-medium">{group.msCount}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
