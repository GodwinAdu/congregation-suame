"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Phone, Plus, Trash2, Star } from "lucide-react";
import { updateProfile } from "@/lib/actions/user.actions";

interface EmergencyContact {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    isPrimary: boolean;
}

interface EmergencyContactsFormProps {
    contacts: EmergencyContact[];
}

export function EmergencyContactsForm({ contacts: initialContacts }: EmergencyContactsFormProps) {
    const [contacts, setContacts] = useState<EmergencyContact[]>(initialContacts || []);
    const [loading, setLoading] = useState(false);

    const addContact = () => {
        setContacts([...contacts, { name: "", relationship: "", phone: "", email: "", isPrimary: contacts.length === 0 }]);
    };

    const removeContact = (index: number) => {
        setContacts(contacts.filter((_, i) => i !== index));
    };

    const updateContact = (index: number, field: keyof EmergencyContact, value: string | boolean) => {
        const updated = [...contacts];
        updated[index] = { ...updated[index], [field]: value };
        if (field === "isPrimary" && value === true) {
            updated.forEach((c, i) => {
                if (i !== index) c.isPrimary = false;
            });
        }
        setContacts(updated);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateProfile({ emergencyContacts: contacts });
            toast.success("Emergency contacts updated successfully");
        } catch (error) {
            toast.error("Failed to update emergency contacts");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        Emergency Contacts
                    </CardTitle>
                    <Button onClick={addContact} size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Contact
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {contacts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No emergency contacts added yet
                    </p>
                ) : (
                    contacts.map((contact, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <Badge variant={contact.isPrimary ? "default" : "outline"}>
                                    {contact.isPrimary && <Star className="h-3 w-3 mr-1" />}
                                    {contact.isPrimary ? "Primary" : "Secondary"}
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeContact(index)}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <Label>Name *</Label>
                                    <Input
                                        value={contact.name}
                                        onChange={(e) => updateContact(index, "name", e.target.value)}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <Label>Relationship *</Label>
                                    <Input
                                        value={contact.relationship}
                                        onChange={(e) => updateContact(index, "relationship", e.target.value)}
                                        placeholder="Spouse, Parent, Sibling"
                                    />
                                </div>
                                <div>
                                    <Label>Phone *</Label>
                                    <Input
                                        value={contact.phone}
                                        onChange={(e) => updateContact(index, "phone", e.target.value)}
                                        placeholder="+1234567890"
                                    />
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={contact.email || ""}
                                        onChange={(e) => updateContact(index, "email", e.target.value)}
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateContact(index, "isPrimary", true)}
                                disabled={contact.isPrimary}
                            >
                                <Star className="h-4 w-4 mr-2" />
                                Set as Primary
                            </Button>
                        </div>
                    ))
                )}
                {contacts.length > 0 && (
                    <Button onClick={handleSave} disabled={loading} className="w-full">
                        {loading ? "Saving..." : "Save Emergency Contacts"}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
