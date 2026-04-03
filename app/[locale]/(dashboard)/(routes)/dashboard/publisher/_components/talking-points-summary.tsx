'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Plus, TrendingUp } from 'lucide-react';
import { getAllTalkingPoints, TalkingPoint } from '@/lib/db/talkingPointsDB';
import Link from 'next/link';

export function TalkingPointsSummary() {
  const [talkingPoints, setTalkingPoints] = useState<TalkingPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTalkingPoints();
  }, []);

  const loadTalkingPoints = async () => {
    try {
      const points = await getAllTalkingPoints();
      setTalkingPoints(points);
    } catch (error) {
      console.error('Error loading talking points:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentPoints = talkingPoints
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 3);

  const mostUsed = talkingPoints
    .filter(p => p.useCount > 0)
    .sort((a, b) => b.useCount - a.useCount)
    .slice(0, 2);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <MessageCircle className="h-4 w-4 mr-2" />
          Talking Points
        </CardTitle>
        <Link href="/dashboard/publisher/talking-points">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">{talkingPoints.length}</div>
        <p className="text-xs text-muted-foreground mb-4">
          Total presentations saved
        </p>

        {talkingPoints.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 mb-3">No talking points yet</p>
            <Link href="/dashboard/publisher/talking-points">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add First Point
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {mostUsed.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Most Used
                </h4>
                {mostUsed.map((point) => (
                  <div key={point.id} className="flex justify-between items-center text-xs">
                    <span className="truncate">{point.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      {point.useCount}x
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-2">Recent</h4>
              {recentPoints.slice(0, 2).map((point) => (
                <div key={point.id} className="text-xs text-gray-600 truncate">
                  {point.title}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}