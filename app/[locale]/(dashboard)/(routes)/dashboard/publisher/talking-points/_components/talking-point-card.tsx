'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Play, Clock, BookOpen } from 'lucide-react';
import { TalkingPoint } from '@/lib/db/talkingPointsDB';

interface TalkingPointCardProps {
  point: TalkingPoint;
  onUse: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const categoryColors = {
  introduction: 'bg-blue-100 text-blue-800',
  presentation: 'bg-green-100 text-green-800',
  'return-visit': 'bg-purple-100 text-purple-800',
  'bible-study': 'bg-orange-100 text-orange-800',
  informal: 'bg-yellow-100 text-yellow-800',
  other: 'bg-gray-100 text-gray-800'
};

export function TalkingPointCard({ point, onUse, onEdit, onDelete }: TalkingPointCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{point.title}</CardTitle>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge className={categoryColors[point.category] || categoryColors.other}>
                {point.category.replace('-', ' ')}
              </Badge>
              <Badge variant="outline">{point.topic}</Badge>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={onUse}>
              <Play className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {point.scriptures.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              Scriptures
            </h4>
            <div className="flex flex-wrap gap-2">
              {point.scriptures.map((scripture) => (
                <Badge key={scripture.id} variant="secondary" className="text-xs">
                  {scripture.book} {scripture.chapter}:{scripture.verses}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {point.points.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2">Key Points</h4>
            <ul className="space-y-1">
              {point.points.slice(0, 3).map((keyPoint, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {keyPoint}
                </li>
              ))}
              {point.points.length > 3 && (
                <li className="text-sm text-gray-500 italic">
                  +{point.points.length - 3} more points
                </li>
              )}
            </ul>
          </div>
        )}

        {point.notes && (
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-1">Notes</h4>
            <p className="text-sm text-gray-600 line-clamp-2">{point.notes}</p>
          </div>
        )}

        <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t">
          <div className="flex items-center gap-4">
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Used {point.useCount} times
            </span>
            {point.lastUsed && (
              <span>
                Last used {new Date(point.lastUsed).toLocaleDateString()}
              </span>
            )}
          </div>
          <span>
            Updated {new Date(point.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}