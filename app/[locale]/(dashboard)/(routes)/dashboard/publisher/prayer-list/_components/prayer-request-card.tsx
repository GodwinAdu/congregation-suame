"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Heart } from 'lucide-react';
import { PrayerRequest } from '@/lib/db/prayerListDB';
import { format } from 'date-fns';

interface PrayerRequestCardProps {
  request: PrayerRequest;
  onEdit: (request: PrayerRequest) => void;
  onRemove: (id: string) => void;
}

export function PrayerRequestCard({ request, onEdit, onRemove }: PrayerRequestCardProps) {
  const getCategoryColor = (category: string) => {
    const colors = {
      personal: 'bg-blue-100 text-blue-800',
      family: 'bg-green-100 text-green-800',
      health: 'bg-red-100 text-red-800',
      spiritual: 'bg-purple-100 text-purple-800',
      congregation: 'bg-yellow-100 text-yellow-800',
      ministry: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-3 w-3 rounded-full ${getPriorityColor(request.priority)}`}></div>
              <h3 className="font-semibold text-sm md:text-base truncate">{request.title}</h3>
            </div>
            
            {request.description && (
              <p className="text-xs md:text-sm text-muted-foreground mb-3 line-clamp-2">
                {request.description}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="secondary" className={`text-xs ${getCategoryColor(request.category)}`}>
                {request.category.charAt(0).toUpperCase() + request.category.slice(1)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
              </Badge>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Added {format(new Date(request.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(request)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemove(request.id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Remove (I've prayed about this)"
            >
              <Heart className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}