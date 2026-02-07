"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface MedicalInfo {
    bloodType?: string;
    allergies?: string;
    medications?: string;
    conditions?: string;
    noBloodCard?: boolean;
    notes?: string;
}

interface MedicalInfoSectionProps {
    medicalInfo: MedicalInfo;
    onChange: (medicalInfo: MedicalInfo) => void;
}

export function MedicalInfoSection({ medicalInfo, onChange }: MedicalInfoSectionProps) {
    const updateField = (field: keyof MedicalInfo, value: string | boolean) => {
        onChange({ ...medicalInfo, [field]: value });
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label>Blood Type</Label>
                    <Select value={medicalInfo.bloodType || ""} onValueChange={(v) => updateField("bloodType", v)}>
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
                        checked={medicalInfo.noBloodCard || false}
                        onCheckedChange={(checked) => updateField("noBloodCard", checked as boolean)}
                    />
                    <Label htmlFor="noBloodCard" className="cursor-pointer">
                        Carries No Blood Card
                    </Label>
                </div>

                <div>
                    <Label>Allergies</Label>
                    <Input
                        value={medicalInfo.allergies || ""}
                        onChange={(e) => updateField("allergies", e.target.value)}
                        placeholder="e.g., Penicillin, Peanuts"
                    />
                </div>

                <div>
                    <Label>Medications</Label>
                    <Input
                        value={medicalInfo.medications || ""}
                        onChange={(e) => updateField("medications", e.target.value)}
                        placeholder="Current medications"
                    />
                </div>

                <div>
                    <Label>Medical Conditions</Label>
                    <Input
                        value={medicalInfo.conditions || ""}
                        onChange={(e) => updateField("conditions", e.target.value)}
                        placeholder="e.g., Diabetes, Asthma"
                    />
                </div>

                <div>
                    <Label>Additional Notes</Label>
                    <Textarea
                        value={medicalInfo.notes || ""}
                        onChange={(e) => updateField("notes", e.target.value)}
                        placeholder="Any other medical information"
                        rows={2}
                    />
                </div>
            </div>
        </div>
    );
}
