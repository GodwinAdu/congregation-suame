"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Star } from "lucide-react";

interface EmergencyContact {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    isPrimary: boolean;
}

interface EmergencyContactsSectionProps {
    contacts: EmergencyContact[];
    onChange: (contacts: EmergencyContact[]) => void;
}

export function EmergencyContactsSection({ contacts, onChange }: EmergencyContactsSectionProps) {
    const addContact = () => {
        onChange([...contacts, { name: "", relationship: "", phone: "", email: "", isPrimary: contacts.length === 0 }]);
    };

    const removeContact = (index: number) => {
        onChange(contacts.filter((_, i) => i !== index));
    };

    const updateContact = (index: number, field: keyof EmergencyContact, value: string | boolean) => {
        const updated = [...contacts];
        updated[index] = { ...updated[index], [field]: value };
        if (field === "isPrimary" && value === true) {
            updated.forEach((c, i) => {
                if (i !== index) c.isPrimary = false;
            });
        }
        onChange(updated);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Label>Emergency Contacts</Label>
                <Button type="button" onClick={addContact} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                </Button>
            </div>

            {contacts.map((contact, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                    <div className="flex justify-between items-center">
                        <Badge variant={contact.isPrimary ? "default" : "outline"}>
                            {contact.isPrimary && <Star className="h-3 w-3 mr-1" />}
                            {contact.isPrimary ? "Primary" : "Secondary"}
                        </Badge>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeContact(index)}
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs">Name *</Label>
                            <Input
                                value={contact.name}
                                onChange={(e) => updateContact(index, "name", e.target.value)}
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <Label className="text-xs">Relationship *</Label>
                            <Input
                                value={contact.relationship}
                                onChange={(e) => updateContact(index, "relationship", e.target.value)}
                                placeholder="Spouse, Parent, Sibling"
                            />
                        </div>
                        <div>
                            <Label className="text-xs">Phone *</Label>
                            <Input
                                value={contact.phone}
                                onChange={(e) => updateContact(index, "phone", e.target.value)}
                                placeholder="+1234567890"
                            />
                        </div>
                        <div>
                            <Label className="text-xs">Email</Label>
                            <Input
                                type="email"
                                value={contact.email || ""}
                                onChange={(e) => updateContact(index, "email", e.target.value)}
                                placeholder="email@example.com"
                            />
                        </div>
                    </div>
                    {!contact.isPrimary && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => updateContact(index, "isPrimary", true)}
                        >
                            <Star className="h-4 w-4 mr-2" />
                            Set as Primary
                        </Button>
                    )}
                </div>
            ))}
        </div>
    );
}
