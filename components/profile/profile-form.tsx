"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User, Mail, Phone, MapPin, Calendar, Shield, Users, Edit, Save, X } from "lucide-react";
import { updateProfile } from "@/lib/actions/user.actions";

interface ProfileFormProps {
    user: {
        _id: string;
        fullName: string;
        email: string;
        phone?: string;
        gender?: string;
        dob?: string;
        address?: string;
        emergencyContact?: string;
        role: string;
        groupId?: {
            name: string;
        };
        privileges?: Array<{
            name: string;
        }>;
        createdAt: string;
    };
}

export function ProfileForm({ user }: ProfileFormProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "",
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
        address: user.address || "",
        emergencyContact: user.emergencyContact || "",
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const updateData = {
                ...formData,
                dob: formData.dob ? new Date(formData.dob) : undefined,
            };
            
            await updateProfile(updateData);
            toast.success("Profile updated successfully");
            setIsEditing(false);
        } catch (error) {
            toast.error("Failed to update profile");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            fullName: user.fullName || "",
            email: user.email || "",
            phone: user.phone || "",
            gender: user.gender || "",
            dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
            address: user.address || "",
            emergencyContact: user.emergencyContact || "",
        });
        setIsEditing(false);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <Card>
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Avatar className="h-16 w-16 sm:h-20 sm:w-20 mx-auto sm:mx-0">
                            <AvatarImage src="" />
                            <AvatarFallback className="text-base sm:text-lg">
                                {getInitials(user.fullName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-xl sm:text-2xl font-bold">{user.fullName}</h2>
                            <p className="text-sm sm:text-base text-muted-foreground">{user.email}</p>
                            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                                <Badge variant="secondary" className="text-xs">{user.role}</Badge>
                                {user.groupId && (
                                    <Badge variant="outline" className="text-xs">{user.groupId.name}</Badge>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-center sm:justify-end w-full sm:w-auto">
                            {!isEditing ? (
                                <Button onClick={() => setIsEditing(true)} className="gap-2 w-full sm:w-auto text-sm">
                                    <Edit className="h-4 w-4" />
                                    <span className="hidden sm:inline">Edit Profile</span>
                                    <span className="sm:hidden">Edit</span>
                                </Button>
                            ) : (
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button onClick={handleSave} disabled={loading} className="gap-2 flex-1 sm:flex-none text-sm">
                                        <Save className="h-4 w-4" />
                                        {loading ? "Saving..." : "Save"}
                                    </Button>
                                    <Button variant="outline" onClick={handleCancel} className="gap-2 flex-1 sm:flex-none text-sm">
                                        <X className="h-4 w-4" />
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            {isEditing ? (
                                <Input
                                    id="fullName"
                                    value={formData.fullName}
                                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                                />
                            ) : (
                                <p className="text-sm py-2">{user.fullName || "Not provided"}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender</Label>
                            {isEditing ? (
                                <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p className="text-sm py-2 capitalize">{user.gender || "Not provided"}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dob">Date of Birth</Label>
                            {isEditing ? (
                                <Input
                                    id="dob"
                                    type="date"
                                    value={formData.dob}
                                    onChange={(e) => handleInputChange("dob", e.target.value)}
                                />
                            ) : (
                                <p className="text-sm py-2">
                                    {user.dob ? formatDate(user.dob) : "Not provided"}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Contact Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            {isEditing ? (
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                />
                            ) : (
                                <p className="text-sm py-2">{user.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            {isEditing ? (
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange("phone", e.target.value)}
                                />
                            ) : (
                                <p className="text-sm py-2">{user.phone || "Not provided"}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="emergencyContact">Emergency Contact</Label>
                            {isEditing ? (
                                <Input
                                    id="emergencyContact"
                                    value={formData.emergencyContact}
                                    onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                                />
                            ) : (
                                <p className="text-sm py-2">{user.emergencyContact || "Not provided"}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Address Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Address
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            {isEditing ? (
                                <Textarea
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => handleInputChange("address", e.target.value)}
                                    rows={3}
                                />
                            ) : (
                                <p className="text-sm py-2">{user.address || "Not provided"}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Account Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Account Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <p className="text-sm py-2">
                                <Badge variant="secondary">{user.role}</Badge>
                            </p>
                        </div>

                        {user.groupId && (
                            <div className="space-y-2">
                                <Label>Group</Label>
                                <p className="text-sm py-2">
                                    <Badge variant="outline">{user.groupId.name}</Badge>
                                </p>
                            </div>
                        )}

                        {user.privileges && user.privileges.length > 0 && (
                            <div className="space-y-2">
                                <Label>Privileges</Label>
                                <div className="flex flex-wrap gap-1">
                                    {user.privileges.map((privilege, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                            {privilege.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Separator />

                        <div className="space-y-2">
                            <Label>Member Since</Label>
                            <p className="text-sm py-2 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {formatDate(user.createdAt)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}