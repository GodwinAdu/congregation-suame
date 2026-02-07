'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { updateRolesWithNewFeatures } from '@/lib/actions/update-roles.actions';
import { toast } from 'sonner';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function UpdateRolesClient({ roles }: any) {
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(false);

  const newFeatures = [
    'shepherdingView',
    'shepherdingManage',
    'assignmentHistoryView',
    'assignmentHistoryManage',
    'bibleStudyView',
    'bibleStudyManage',
    'publisherGoals',
    'publisherRecords',
    'literature',
    'theocraticSchool',
    'emergency',
    'expenses'
  ];

  const handleUpdate = async () => {
    setLoading(true);
    const result = await updateRolesWithNewFeatures();
    
    if (result.success) {
      toast.success(result.message);
      setUpdated(true);
      setTimeout(() => window.location.reload(), 1500);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const checkFeatureExists = (role: any, feature: string) => {
    return role.permissions && role.permissions[feature] !== undefined;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Update Roles with New Features</h1>
          <p className="text-gray-600 mt-2">Add new feature permissions to all existing roles</p>
        </div>
        <Button 
          onClick={handleUpdate} 
          disabled={loading || updated}
          size="lg"
        >
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : updated ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Updated
            </>
          ) : (
            'Update All Roles'
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Features to Add</CardTitle>
          <CardDescription>These permissions will be added to all roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {newFeatures.map((feature) => (
              <Badge key={feature} variant="outline" className="justify-center py-2">
                {feature}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Roles Status</CardTitle>
          <CardDescription>Check which roles have the new features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roles.map((role: any) => {
              const missingFeatures = newFeatures.filter(f => !checkFeatureExists(role, f));
              const hasAllFeatures = missingFeatures.length === 0;

              return (
                <div key={role._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{role.name}</h3>
                      <p className="text-sm text-gray-600">
                        {newFeatures.length - missingFeatures.length} / {newFeatures.length} features
                      </p>
                    </div>
                    {hasAllFeatures ? (
                      <Badge className="bg-green-500">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Complete
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Missing {missingFeatures.length}
                      </Badge>
                    )}
                  </div>
                  
                  {missingFeatures.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Missing features:</p>
                      <div className="flex flex-wrap gap-2">
                        {missingFeatures.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">What will happen?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>✓ All roles will receive the new feature permissions</p>
          <p>✓ Admin role will have all new features enabled</p>
          <p>✓ Elder role will have all new features enabled</p>
          <p>✓ Ministerial Servant role will have limited access</p>
          <p>✓ Publisher role will only have publisherGoals enabled</p>
          <p>✓ Existing permissions will not be affected</p>
        </CardContent>
      </Card>
    </div>
  );
}
