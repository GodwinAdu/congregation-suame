"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { updateProfile } from "@/lib/actions/user.actions";

interface NotificationPreferences {
    email: boolean;
    sms: boolean;
    push: boolean;
    assignments: boolean;
    announcements: boolean;
    emergencies: boolean;
}

interface NotificationPreferencesFormProps {
    preferences: NotificationPreferences;
}

export function NotificationPreferencesForm({ preferences: initialPrefs }: NotificationPreferencesFormProps) {
    const [preferences, setPreferences] = useState<NotificationPreferences>(initialPrefs || {
        email: true,
        sms: false,
        push: true,
        assignments: true,
        announcements: true,
        emergencies: true
    });
    const [loading, setLoading] = useState(false);

    const handleToggle = (field: keyof NotificationPreferences) => {
        setPreferences({ ...preferences, [field]: !preferences[field] });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateProfile({ notificationPreferences: preferences });
            toast.success("Notification preferences updated successfully");
        } catch (error) {
            toast.error("Failed to update notification preferences");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="font-medium mb-3">Notification Channels</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="email" className="cursor-pointer">Email Notifications</Label>
                            <Switch
                                id="email"
                                checked={preferences.email}
                                onCheckedChange={() => handleToggle("email")}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="sms" className="cursor-pointer">SMS Notifications</Label>
                            <Switch
                                id="sms"
                                checked={preferences.sms}
                                onCheckedChange={() => handleToggle("sms")}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="push" className="cursor-pointer">Push Notifications</Label>
                            <Switch
                                id="push"
                                checked={preferences.push}
                                onCheckedChange={() => handleToggle("push")}
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h3 className="font-medium mb-3">Notification Types</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="assignments" className="cursor-pointer">Meeting Assignments</Label>
                                <p className="text-xs text-muted-foreground">Receive notifications about your meeting assignments</p>
                            </div>
                            <Switch
                                id="assignments"
                                checked={preferences.assignments}
                                onCheckedChange={() => handleToggle("assignments")}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="announcements" className="cursor-pointer">Announcements</Label>
                                <p className="text-xs text-muted-foreground">Receive congregation announcements</p>
                            </div>
                            <Switch
                                id="announcements"
                                checked={preferences.announcements}
                                onCheckedChange={() => handleToggle("announcements")}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="emergencies" className="cursor-pointer">Emergency Alerts</Label>
                                <p className="text-xs text-muted-foreground">Critical emergency notifications (recommended)</p>
                            </div>
                            <Switch
                                id="emergencies"
                                checked={preferences.emergencies}
                                onCheckedChange={() => handleToggle("emergencies")}
                            />
                        </div>
                    </div>
                </div>

                <Button onClick={handleSave} disabled={loading} className="w-full">
                    {loading ? "Saving..." : "Save Notification Preferences"}
                </Button>
            </CardContent>
        </Card>
    );
}
