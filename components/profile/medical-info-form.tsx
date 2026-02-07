"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { updateProfile } from "@/lib/actions/user.actions";

interface MedicalInfo {
    bloodType?: string;
    allergies?: string;
    medications?: string;
    conditions?: string;
    noBloodCard: boolean;
    notes?: string;
}

interface MedicalInfoFormProps {
    medicalInfo: MedicalInfo;
}

export function MedicalInfoForm({ medicalInfo: initialInfo }: MedicalInfoFormProps) {
    const [medicalInfo, setMedicalInfo] = useState<MedicalInfo>(initialInfo || {
        bloodType: "",
        allergies: "",
        medications: "",
        conditions: "",
        noBloodCard: false,
        notes: ""
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (field: keyof MedicalInfo, value: string | boolean) => {
        setMedicalInfo({ ...medicalInfo, [field]: value });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateProfile({ medicalInfo });
            toast.success("Medical information updated successfully");
        } catch (error) {
            toast.error("Failed to update medical information");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-600" />
                    Medical Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label>Blood Type</Label>
                        <Select value={medicalInfo.bloodType || ""} onValueChange={(v) => handleChange("bloodType", v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select blood type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="A+">A+</SelectItem>
                                <SelectItem value="A-">A-</SelectItem>
                                <SelectItem value="B+">B+</SelectItem>
                                <SelectItem value="B-">B-</SelectItem>
                                <SelectItem value="AB+">AB+</SelectItem>
                                <SelectItem value="AB-">AB-</SelectItem>
                                <SelectItem value="O+">O+</SelectItem>
                                <SelectItem value="O-">O-</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                        <Checkbox
                            id="noBloodCard"
                            checked={medicalInfo.noBloodCard}
                            onCheckedChange={(checked) => handleChange("noBloodCard", checked as boolean)}
                        />
                        <Label htmlFor="noBloodCard" className="cursor-pointer">
                            I carry a No Blood Card
                        </Label>
                    </div>
                </div>

                <div>
                    <Label>Allergies</Label>
                    <Textarea
                        value={medicalInfo.allergies || ""}
                        onChange={(e) => handleChange("allergies", e.target.value)}
                        placeholder="List any allergies (medications, food, etc.)"
                        rows={2}
                    />
                </div>

                <div>
                    <Label>Current Medications</Label>
                    <Textarea
                        value={medicalInfo.medications || ""}
                        onChange={(e) => handleChange("medications", e.target.value)}
                        placeholder="List current medications and dosages"
                        rows={2}
                    />
                </div>

                <div>
                    <Label>Medical Conditions</Label>
                    <Textarea
                        value={medicalInfo.conditions || ""}
                        onChange={(e) => handleChange("conditions", e.target.value)}
                        placeholder="List any medical conditions (diabetes, asthma, etc.)"
                        rows={2}
                    />
                </div>

                <div>
                    <Label>Additional Notes</Label>
                    <Textarea
                        value={medicalInfo.notes || ""}
                        onChange={(e) => handleChange("notes", e.target.value)}
                        placeholder="Any other important medical information"
                        rows={2}
                    />
                </div>

                <Button onClick={handleSave} disabled={loading} className="w-full">
                    {loading ? "Saving..." : "Save Medical Information"}
                </Button>
            </CardContent>
        </Card>
    );
}
