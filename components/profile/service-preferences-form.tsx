"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Briefcase } from "lucide-react";
import { updateProfile } from "@/lib/actions/user.actions";

interface ServicePreferences {
    availableDays: string[];
    preferredServiceTime?: string;
    hasVehicle: boolean;
    canDrive: boolean;
    willingToConduct: boolean;
    languages: string[];
}

interface ServicePreferencesFormProps {
    preferences: ServicePreferences;
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const COMMON_LANGUAGES = ["English", "Spanish", "French", "Portuguese", "Chinese", "Arabic", "Other"];

export function ServicePreferencesForm({ preferences: initialPrefs }: ServicePreferencesFormProps) {
    const [preferences, setPreferences] = useState<ServicePreferences>({
        availableDays: initialPrefs?.availableDays || [],
        preferredServiceTime: initialPrefs?.preferredServiceTime || "",
        hasVehicle: initialPrefs?.hasVehicle || false,
        canDrive: initialPrefs?.canDrive || false,
        willingToConduct: initialPrefs?.willingToConduct || false,
        languages: initialPrefs?.languages || []
    });
    const [loading, setLoading] = useState(false);

    const toggleDay = (day: string) => {
        const days = preferences.availableDays.includes(day)
            ? preferences.availableDays.filter(d => d !== day)
            : [...preferences.availableDays, day];
        setPreferences({ ...preferences, availableDays: days });
    };

    const toggleLanguage = (lang: string) => {
        const languages = preferences.languages.includes(lang)
            ? preferences.languages.filter(l => l !== lang)
            : [...preferences.languages, lang];
        setPreferences({ ...preferences, languages });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateProfile({ servicePreferences: preferences });
            toast.success("Service preferences updated successfully");
        } catch (error) {
            toast.error("Failed to update service preferences");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Field Service Preferences
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Label className="mb-3 block">Available Days</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {DAYS.map(day => (
                            <div key={day} className="flex items-center space-x-2">
                                <Checkbox
                                    id={day}
                                    checked={preferences.availableDays.includes(day)}
                                    onCheckedChange={() => toggleDay(day)}
                                />
                                <Label htmlFor={day} className="capitalize cursor-pointer">
                                    {day}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <Label>Preferred Service Time</Label>
                    <Select
                        value={preferences.preferredServiceTime || ""}
                        onValueChange={(v) => setPreferences({ ...preferences, preferredServiceTime: v })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select preferred time" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="morning">Morning</SelectItem>
                            <SelectItem value="afternoon">Afternoon</SelectItem>
                            <SelectItem value="evening">Evening</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="hasVehicle"
                            checked={preferences.hasVehicle}
                            onCheckedChange={(checked) => setPreferences({ ...preferences, hasVehicle: checked as boolean })}
                        />
                        <Label htmlFor="hasVehicle" className="cursor-pointer">
                            I have a vehicle
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="canDrive"
                            checked={preferences.canDrive}
                            onCheckedChange={(checked) => setPreferences({ ...preferences, canDrive: checked as boolean })}
                        />
                        <Label htmlFor="canDrive" className="cursor-pointer">
                            I can drive for field service
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="willingToConduct"
                            checked={preferences.willingToConduct}
                            onCheckedChange={(checked) => setPreferences({ ...preferences, willingToConduct: checked as boolean })}
                        />
                        <Label htmlFor="willingToConduct" className="cursor-pointer">
                            Willing to conduct Bible studies
                        </Label>
                    </div>
                </div>

                <div>
                    <Label className="mb-3 block">Languages Spoken</Label>
                    <div className="flex flex-wrap gap-2">
                        {COMMON_LANGUAGES.map(lang => (
                            <Badge
                                key={lang}
                                variant={preferences.languages.includes(lang) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => toggleLanguage(lang)}
                            >
                                {lang}
                            </Badge>
                        ))}
                    </div>
                </div>

                <Button onClick={handleSave} disabled={loading} className="w-full">
                    {loading ? "Saving..." : "Save Service Preferences"}
                </Button>
            </CardContent>
        </Card>
    );
}
