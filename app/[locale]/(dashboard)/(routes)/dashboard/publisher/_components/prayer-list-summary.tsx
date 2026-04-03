"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Plus, ArrowRight } from 'lucide-react';
import { PrayerRequest, getAllPrayerRequests, getPrayerStats } from '@/lib/db/prayerListDB';
import Link from 'next/link';

export function PrayerListSummary() {
  const [recentRequests, setRecentRequests] = useState<PrayerRequest[]>([]);
  const [stats, setStats] = useState<{
    totalRequests: number;
    requestsByCategory: Record<string, number>;
    requestsByPriority: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [requests, statistics] = await Promise.all([
          getAllPrayerRequests(),
          getPrayerStats()
        ]);
        
        // Get the 3 most recent requests
        setRecentRequests(requests.slice(0, 3));
        setStats(statistics);
      } catch (error) {
        console.error('Error loading prayer list data:', error);
      }
    };

    loadData();
  }, []);

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Prayer List</CardTitle>
        <Heart className="h-4 w-4 text-red-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Stats */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Items:</span>
            <span className="font-medium">{stats?.totalRequests || 0}</span>
          </div>
          
          {stats && stats.totalRequests > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">High Priority:</span>
              <span className="font-medium text-red-600">{stats.requestsByPriority.high || 0}</span>
            </div>
          )}

          {/* Recent Requests */}
          {recentRequests.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Recent Items:</h4>
              {recentRequests.map((request) => (
                <div key={request.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm">
                  <div className={`h-2 w-2 rounded-full ${getPriorityColor(request.priority)}`}></div>
                  <span className="flex-1 truncate">{request.title}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <Heart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">No prayer items yet</p>
              <p className="text-xs text-muted-foreground">Add things you want to pray about</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button asChild size="sm" className="flex-1">
              <Link href="/dashboard/publisher/prayer-list">
                <Heart className="h-3 w-3 mr-1" />
                View All
              </Link>
            </Button>
            {recentRequests.length > 0 && (
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/publisher/prayer-list">
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}