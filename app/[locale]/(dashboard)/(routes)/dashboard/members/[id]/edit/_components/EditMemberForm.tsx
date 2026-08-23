"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { updateMember } from '@/lib/actions/user.actions'
import {
    Plus, X, Crown, Phone, Heart, MapPin, Loader2,
    User, Building2, Bell, Briefcase, Users, CheckCircle
} from 'lucide-react'
import { EmergencyContactsSection } from '@/app/[locale]/(dashboard)/(routes)/dashboard/members/_components/EmergencyContactsSection'
import { MedicalInfoSection } from '@/app/[locale]/(dashboard)/(routes)/dashboard/members/_components/MedicalInfoSection'

interface EditMemberFormProps {
    member: any
    groups: any[]
    privileges: any[]
    members: any[]
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
const COMMON_LANGUAGES = ["English", "Twi", "Fante", "Ga", "Ewe", "Hausa", "French", "Other"]

export function EditMemberForm({ member, groups, privileges, members }: EditMemberFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [gettingLocation, setGettingLocation] = useState(false)
    const [familyRelationships, setFamilyRelationships] = useState<Array<{ memberId: string; memberName: string; relationship: string }>>([])
    const [isFamilyHead, setIsFamilyHead] = useState(false)
    const [emergencyContacts, setEmergencyContacts] = useState<Array<{ name: string; relationship: string; phone: string; email?: string; isPrimary: boolean }>>([])
    const [medicalInfo, setMedicalInfo] = useState<any>({})

    const [formData, setFormData] = useState({
        fullName: member.fullName || '',
        email: member.email || '',
        phone: member.phone || '',
        alternatePhone: member.alternatePhone || '',
        gender: member.gender || '',
        dob: member.dob ? new Date(member.dob).toISOString().split('T')[0] : '',
        baptizedDate: member.baptizedDate ? new Date(member.baptizedDate).toISOString().split('T')[0] : '',
        address: member.address || '',
        emergencyContact: member.emergencyContact || '',
        pioneerStatus: member.pioneerStatus || 'none',
        pioneerStartDate: member.pioneerStartDate ? new Date(member.pioneerStartDate).toISOString().split('T')[0] : '',
        role: member.role || 'publisher',
        groupId: member.groupId?._id || 'none',
        privileges: member.privileges?.map((p: any) => p._id) || []
    })

    const [location, setLocation] = useState({
        latitude: member.location?.latitude || '',
        longitude: member.location?.longitude || '',
        address: member.location?.address || '',
        isPublic: member.location?.isPublic || false
    })

    const [servicePreferences, setServicePreferences] = useState({
        availableDays: member.servicePreferences?.availableDays || [],
        preferredServiceTime: member.servicePreferences?.preferredServiceTime || '',
        hasVehicle: member.servicePreferences?.hasVehicle || false,
        canDrive: member.servicePreferences?.canDrive || false,
        willingToConduct: member.servicePreferences?.willingToConduct || false,
        languages: member.servicePreferences?.languages || []
    })

    const [notificationPreferences, setNotificationPreferences] = useState({
        email: member.notificationPreferences?.email ?? true,
        sms: member.notificationPreferences?.sms ?? false,
        push: member.notificationPreferences?.push ?? true,
        assignments: member.notificationPreferences?.assignments ?? true,
        announcements: member.notificationPreferences?.announcements ?? true,
        emergencies: member.notificationPreferences?.emergencies ?? true
    })

    useEffect(() => {
        if (member.familyRelationships) {
            setFamilyRelationships(member.familyRelationships.map((rel: any) => ({
                memberId: rel.memberId._id || rel.memberId,
                memberName: rel.memberId.fullName || members.find(m => m._id === rel.memberId)?.fullName || '',
                relationship: rel.relationship
            })))
        }
        setIsFamilyHead(member.isFamilyHead || false)
        setEmergencyContacts(member.emergencyContacts || [])
        setMedicalInfo(member.medicalInfo || {})
    }, [member, members])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await updateMember(member._id, {
                ...formData,
                groupId: formData.groupId === 'none' ? null : formData.groupId,
                dob: formData.dob ? new Date(formData.dob) : undefined,
                baptizedDate: formData.baptizedDate ? new Date(formData.baptizedDate) : undefined,
                pioneerStartDate: formData.pioneerStartDate ? new Date(formData.pioneerStartDate) : undefined,
                emergencyContacts,
                medicalInfo,
                location: {
                    latitude: location.latitude ? Number(location.latitude) : null,
                    longitude: location.longitude ? Number(location.longitude) : null,
                    address: location.address || null,
                    isPublic: location.isPublic,
                    lastUpdated: (location.latitude && location.longitude) ? new Date() : null
                },
                servicePreferences,
                notificationPreferences,
                familyRelationships: familyRelationships.filter(r => r.memberId).map(r => ({
                    memberId: r.memberId,
                    relationship: r.relationship
                })),
                isFamilyHead
            })
            toast.success('Member updated successfully')
            router.push('/dashboard/members')
        } catch (error: any) {
            toast.error(error?.message ?? 'Failed to update member')
        } finally {
            setLoading(false)
        }
    }

    const handlePrivilegeChange = (privilegeId: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            privileges: checked
                ? [...prev.privileges, privilegeId]
                : prev.privileges.filter((id: string) => id !== privilegeId)
        }))
    }

    const getCurrentLocation = () => {
        setGettingLocation(true)

        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by this browser')
            setGettingLocation(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation(prev => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }))
                setGettingLocation(false)
                toast.success('Location detected successfully')
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    toast.error('Location access denied. Please enable location permissions.')
                } else {
                    toast.error('Failed to get current location')
                }
                setGettingLocation(false)
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        )
    }

    const toggleDay = (day: string) => {
        const days = servicePreferences.availableDays.includes(day)
            ? servicePreferences.availableDays.filter((d: string) => d !== day)
            : [...servicePreferences.availableDays, day]
        setServicePreferences(prev => ({ ...prev, availableDays: days }))
    }

    const toggleLanguage = (lang: string) => {
        const languages = servicePreferences.languages.includes(lang)
            ? servicePreferences.languages.filter((l: string) => l !== lang)
            : [...servicePreferences.languages, lang]
        setServicePreferences(prev => ({ ...prev, languages }))
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="personal" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
                    <TabsTrigger value="personal" className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 hidden sm:inline" />
                        <span>Personal</span>
                    </TabsTrigger>
                    <TabsTrigger value="congregation" className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 hidden sm:inline" />
                        <span>Congregation</span>
                    </TabsTrigger>
                    <TabsTrigger value="location" className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 hidden sm:inline" />
                        <span>Location</span>
                    </TabsTrigger>
                    <TabsTrigger value="service" className="flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 hidden sm:inline" />
                        <span>Service</span>
                    </TabsTrigger>
                    <TabsTrigger value="emergency" className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 hidden sm:inline" />
                        <span>Emergency</span>
                    </TabsTrigger>
                    <TabsTrigger value="medical" className="flex items-center gap-1.5">
                        <Heart className="h-3.5 w-3.5 hidden sm:inline" />
                        <span>Medical</span>
                    </TabsTrigger>
                    <TabsTrigger value="family" className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 hidden sm:inline" />
                        <span>Family</span>
                    </TabsTrigger>
                </TabsList>

                {/* Personal Information Tab */}
                <TabsContent value="personal">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Personal Information
                            </CardTitle>
                            <CardDescription>Basic personal details and contact information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="fullName">Full Name *</Label>
                                    <Input
                                        id="fullName"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone *</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="alternatePhone">Alternate Phone</Label>
                                    <Input
                                        id="alternatePhone"
                                        value={formData.alternatePhone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, alternatePhone: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="gender">Gender *</Label>
                                    <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="dob">Date of Birth</Label>
                                    <Input
                                        id="dob"
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="baptizedDate">Baptized Date</Label>
                                    <Input
                                        id="baptizedDate"
                                        type="date"
                                        value={formData.baptizedDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, baptizedDate: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="emergencyContact">Emergency Contact (Legacy)</Label>
                                    <Input
                                        id="emergencyContact"
                                        value={formData.emergencyContact}
                                        onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                                        placeholder="Phone number"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="pioneerStatus">Pioneer Status</Label>
                                    <Select value={formData.pioneerStatus || 'none'} onValueChange={(value) => setFormData(prev => ({ ...prev, pioneerStatus: value === 'none' ? null : value }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select pioneer status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="regular">Regular Pioneer</SelectItem>
                                            <SelectItem value="auxiliary">Auxiliary Pioneer</SelectItem>
                                            <SelectItem value="special">Special Pioneer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="pioneerStartDate">Pioneer Start Date</Label>
                                    <Input
                                        id="pioneerStartDate"
                                        type="date"
                                        value={formData.pioneerStartDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, pioneerStartDate: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="address">Home Address</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    placeholder="Enter home address"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Congregation Details Tab */}
                <TabsContent value="congregation">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Congregation Details
                            </CardTitle>
                            <CardDescription>Role, group assignment, and privileges</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="role">Role</Label>
                                    <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="publisher">Publisher</SelectItem>
                                            <SelectItem value="elder">Elder</SelectItem>
                                            <SelectItem value="ministerial_servant">Ministerial Servant</SelectItem>
                                            <SelectItem value="pioneer">Pioneer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="group">Group</Label>
                                    <Select value={formData.groupId} onValueChange={(value) => setFormData(prev => ({ ...prev, groupId: value }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select group">
                                                {formData.groupId && formData.groupId !== 'none' ? groups.find(g => g._id === formData.groupId)?.name : formData.groupId === 'none' ? "No Group" : "Select group"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No Group</SelectItem>
                                            {groups.map((group) => (
                                                <SelectItem key={group._id} value={group._id}>
                                                    {group.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label>Privileges</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                    {privileges.map((privilege) => (
                                        <div key={privilege._id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={privilege._id}
                                                checked={formData.privileges.includes(privilege._id)}
                                                onCheckedChange={(checked) => handlePrivilegeChange(privilege._id, checked as boolean)}
                                            />
                                            <Label htmlFor={privilege._id} className="text-sm cursor-pointer">
                                                {privilege.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Location Tab */}
                <TabsContent value="location">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Home Location
                            </CardTitle>
                            <CardDescription>GPS coordinates and address for territory mapping and shepherding visits</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="latitude">Latitude</Label>
                                    <Input
                                        id="latitude"
                                        type="number"
                                        step="any"
                                        value={location.latitude}
                                        onChange={(e) => setLocation(prev => ({ ...prev, latitude: e.target.value }))}
                                        placeholder="e.g., 6.6745"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="longitude">Longitude</Label>
                                    <Input
                                        id="longitude"
                                        type="number"
                                        step="any"
                                        value={location.longitude}
                                        onChange={(e) => setLocation(prev => ({ ...prev, longitude: e.target.value }))}
                                        placeholder="e.g., -1.5716"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="locationAddress">Address</Label>
                                <Input
                                    id="locationAddress"
                                    value={location.address}
                                    onChange={(e) => setLocation(prev => ({ ...prev, address: e.target.value }))}
                                    placeholder="Enter home address or landmark"
                                />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Switch
                                    id="isPublic"
                                    checked={location.isPublic}
                                    onCheckedChange={(checked) => setLocation(prev => ({ ...prev, isPublic: checked }))}
                                />
                                <Label htmlFor="isPublic" className="text-sm cursor-pointer">
                                    Make location visible to elders and overseers
                                </Label>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={getCurrentLocation}
                                    disabled={gettingLocation}
                                    className="flex-1"
                                >
                                    {gettingLocation ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <MapPin className="h-4 w-4 mr-2" />
                                    )}
                                    Detect Current Location
                                </Button>
                            </div>

                            {member.location?.lastUpdated && (
                                <p className="text-sm text-muted-foreground">
                                    Last updated: {new Date(member.location.lastUpdated).toLocaleString()}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Service Preferences Tab */}
                <TabsContent value="service">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5" />
                                Field Service Preferences
                            </CardTitle>
                            <CardDescription>Availability, transportation, and language abilities</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label className="mb-3 block font-medium">Available Days</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {DAYS.map(day => (
                                        <div key={day} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`day-${day}`}
                                                checked={servicePreferences.availableDays.includes(day)}
                                                onCheckedChange={() => toggleDay(day)}
                                            />
                                            <Label htmlFor={`day-${day}`} className="capitalize cursor-pointer text-sm">
                                                {day}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label>Preferred Service Time</Label>
                                <Select
                                    value={servicePreferences.preferredServiceTime || 'none'}
                                    onValueChange={(v) => setServicePreferences(prev => ({ ...prev, preferredServiceTime: v === 'none' ? '' : v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select preferred time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Preference</SelectItem>
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
                                        checked={servicePreferences.hasVehicle}
                                        onCheckedChange={(checked) => setServicePreferences(prev => ({ ...prev, hasVehicle: checked as boolean }))}
                                    />
                                    <Label htmlFor="hasVehicle" className="cursor-pointer text-sm">
                                        Has a vehicle
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="canDrive"
                                        checked={servicePreferences.canDrive}
                                        onCheckedChange={(checked) => setServicePreferences(prev => ({ ...prev, canDrive: checked as boolean }))}
                                    />
                                    <Label htmlFor="canDrive" className="cursor-pointer text-sm">
                                        Can drive for field service
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="willingToConduct"
                                        checked={servicePreferences.willingToConduct}
                                        onCheckedChange={(checked) => setServicePreferences(prev => ({ ...prev, willingToConduct: checked as boolean }))}
                                    />
                                    <Label htmlFor="willingToConduct" className="cursor-pointer text-sm">
                                        Willing to conduct Bible studies
                                    </Label>
                                </div>
                            </div>

                            <div>
                                <Label className="mb-3 block font-medium">Languages Spoken</Label>
                                <div className="flex flex-wrap gap-2">
                                    {COMMON_LANGUAGES.map(lang => (
                                        <Badge
                                            key={lang}
                                            variant={servicePreferences.languages.includes(lang) ? "default" : "outline"}
                                            className="cursor-pointer transition-colors"
                                            onClick={() => toggleLanguage(lang)}
                                        >
                                            {lang}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Emergency Contacts Tab */}
                <TabsContent value="emergency">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Phone className="h-5 w-5" />
                                Emergency Contacts
                            </CardTitle>
                            <CardDescription>People to contact in case of emergency</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <EmergencyContactsSection
                                contacts={emergencyContacts}
                                onChange={setEmergencyContacts}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Medical Information Tab */}
                <TabsContent value="medical">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Heart className="h-5 w-5" />
                                Medical Information
                            </CardTitle>
                            <CardDescription>Health details, blood type, and no-blood card status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MedicalInfoSection
                                medicalInfo={medicalInfo}
                                onChange={setMedicalInfo}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Family Tab */}
                <TabsContent value="family">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Family Relationships
                            </CardTitle>
                            <CardDescription>Manage family members and their relationships</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant={isFamilyHead ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setIsFamilyHead(!isFamilyHead)}
                                >
                                    <Crown className="w-4 h-4 mr-2" />
                                    {isFamilyHead ? "Family Head" : "Set as Family Head"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFamilyRelationships([...familyRelationships, { memberId: '', memberName: '', relationship: 'other' }])}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Family Member
                                </Button>
                            </div>

                            {familyRelationships.length === 0 && (
                                <p className="text-sm text-muted-foreground py-4 text-center">
                                    No family relationships added yet. Click &quot;Add Family Member&quot; to begin.
                                </p>
                            )}

                            {familyRelationships.map((relationship, index) => (
                                <div key={index} className="flex gap-2 items-end p-3 bg-muted/50 rounded-lg">
                                    <div className="flex-1">
                                        <Label className="text-xs font-medium text-muted-foreground">Family Member</Label>
                                        <Select
                                            value={relationship.memberId}
                                            onValueChange={(value) => {
                                                const memberData = members.find(m => m._id === value)
                                                const updated = [...familyRelationships]
                                                updated[index] = { ...updated[index], memberId: value, memberName: memberData?.fullName || '' }
                                                setFamilyRelationships(updated)
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select member" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {members.filter(m => m._id !== member._id).map((memberOption) => (
                                                    <SelectItem key={memberOption._id} value={memberOption._id}>
                                                        {memberOption.fullName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-36">
                                        <Label className="text-xs font-medium text-muted-foreground">Relationship</Label>
                                        <Select
                                            value={relationship.relationship}
                                            onValueChange={(value) => {
                                                const updated = [...familyRelationships]
                                                updated[index] = { ...updated[index], relationship: value }
                                                setFamilyRelationships(updated)
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="father">Father</SelectItem>
                                                <SelectItem value="mother">Mother</SelectItem>
                                                <SelectItem value="son">Son</SelectItem>
                                                <SelectItem value="daughter">Daughter</SelectItem>
                                                <SelectItem value="husband">Husband</SelectItem>
                                                <SelectItem value="wife">Wife</SelectItem>
                                                <SelectItem value="brother">Brother</SelectItem>
                                                <SelectItem value="sister">Sister</SelectItem>
                                                <SelectItem value="grandfather">Grandfather</SelectItem>
                                                <SelectItem value="grandmother">Grandmother</SelectItem>
                                                <SelectItem value="grandson">Grandson</SelectItem>
                                                <SelectItem value="granddaughter">Granddaughter</SelectItem>
                                                <SelectItem value="uncle">Uncle</SelectItem>
                                                <SelectItem value="aunt">Aunt</SelectItem>
                                                <SelectItem value="nephew">Nephew</SelectItem>
                                                <SelectItem value="niece">Niece</SelectItem>
                                                <SelectItem value="cousin">Cousin</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setFamilyRelationships(familyRelationships.filter((_, i) => i !== index))}
                                        className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Sticky Submit Bar */}
            <div className="sticky bottom-4 bg-background/95 backdrop-blur-sm border rounded-lg p-4 flex gap-3 shadow-lg">
                <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
                    {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    {loading ? 'Updating...' : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
            </div>
        </form>
    )
}
