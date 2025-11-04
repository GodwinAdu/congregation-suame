"use client"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, User, Mail, Phone, MapPin, Calendar, Users, Shield, Key, Crown, Loader2 } from "lucide-react"
import { useState } from "react"
import { fetchUserById } from "@/lib/actions/user.actions"

interface MemberDetailsModalProps {
    member: any
    children?: React.ReactNode
}

function FamilyMemberModal({ memberId, memberName }: { memberId: string; memberName: string }) {
    const [open, setOpen] = useState(false)
    const [member, setMember] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const handleOpen = async () => {
        if (!member && memberId) {
            setLoading(true)
            try {
                const fullMember = await fetchUserById(memberId)
                setMember(fullMember)
            } catch (error) {
                console.error('Error fetching member:', error)
            } finally {
                setLoading(false)
            }
        }
        setOpen(true)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button 
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
                    onClick={handleOpen}
                >
                    {memberName}
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Loading member details...</span>
                    </div>
                ) : member ? (
                    <MemberDetailsContent member={member} />
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        Failed to load member details
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

function MemberDetailsContent({ member }: { member: any }) {
    return (
        <>
            <DialogHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 mb-4">
                    <Avatar className="w-16 h-16">
                        <AvatarImage src={member.avatar} alt={member.fullName} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-lg">
                            {member.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                    </Avatar>
                </div>
                <DialogTitle className="text-2xl font-semibold">{member.fullName}</DialogTitle>
                <DialogDescription className="text-gray-600">
                    Member Details & Information
                </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4 max-h-96 overflow-y-auto">
                {/* Basic Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Full Name</p>
                            <p className="text-sm">{member.fullName || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Gender</p>
                            <p className="text-sm capitalize">{member.gender || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                            <p className="text-sm">
                                {member.dob ? new Date(member.dob).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Role</p>
                            <Badge variant="outline" className="text-xs">
                                {member.role || 'Publisher'}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Mail className="h-5 w-5 text-green-600" />
                        Contact Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 pl-7">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Email</p>
                                <p className="text-sm">{member.email || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Phone</p>
                                <p className="text-sm">{member.phone || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Address</p>
                                <p className="text-sm">{member.address || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Emergency Contact</p>
                                <p className="text-sm">{member.emergencyContact || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Group & Privileges */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Users className="h-5 w-5 text-purple-600" />
                        Group & Privileges
                    </h3>
                    <div className="grid grid-cols-1 gap-4 pl-7">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Group</p>
                            <Badge variant="secondary" className="text-xs">
                                {member.groupId?.name || 'No Group Assigned'}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Privileges</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {member.privileges && member.privileges.length > 0 ? (
                                    member.privileges.map((privilege: any, index: number) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                            <Key className="h-3 w-3 mr-1" />
                                            {typeof privilege === 'string' ? privilege : privilege.name}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-sm text-gray-500">No privileges assigned</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Family Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Users className="h-5 w-5 text-pink-600" />
                        Family Information
                        {member.isFamilyHead && (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                <Crown className="h-3 w-3 mr-1" />
                                Family Head
                            </Badge>
                        )}
                    </h3>
                    <div className="pl-7">
                        {member.familyRelationships && member.familyRelationships.length > 0 ? (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-500">Family Members</p>
                                <div className="space-y-2">
                                    {member.familyRelationships.map((relationship: any, index: number) => {
                                        const relatedMember = relationship.memberId || relationship.member;
                                        const memberName = relatedMember?.fullName || relationship.memberName || 'Unknown Member';
                                        
                                        return (
                                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                                {relatedMember?._id ? (
                                                    <FamilyMemberModal memberId={relatedMember._id} memberName={memberName} />
                                                ) : (
                                                    <span className="text-sm font-medium text-gray-500">
                                                        {memberName}
                                                    </span>
                                                )}
                                                <Badge 
                                                    variant="outline" 
                                                    className={`text-xs ${
                                                        relationship.relationship === 'father' || relationship.relationship === 'husband' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        relationship.relationship === 'mother' || relationship.relationship === 'wife' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                                                        relationship.relationship === 'son' || relationship.relationship === 'daughter' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        relationship.relationship === 'brother' || relationship.relationship === 'sister' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                        'bg-gray-50 text-gray-700 border-gray-200'
                                                    }`}
                                                >
                                                    {relationship.relationship.charAt(0).toUpperCase() + relationship.relationship.slice(1)}
                                                </Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No family relationships added</p>
                        )}
                    </div>
                </div>

                {/* Assigned Duties */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        Assigned Duties
                    </h3>
                    <div className="pl-7">
                        {member.duties && member.duties.length > 0 ? (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-500">Current Duties</p>
                                <div className="flex flex-wrap gap-2">
                                    {member.duties
                                        .filter((duty: any) => duty.isActive)
                                        .map((duty: any, index: number) => (
                                        <Badge 
                                            key={index} 
                                            variant="secondary" 
                                            className={`text-xs ${
                                                duty.category === 'midweek_meeting' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                duty.category === 'weekend_meeting' ? 'bg-green-50 text-green-700 border-green-200' :
                                                duty.category === 'field_service' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                duty.category === 'administrative' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                'bg-gray-50 text-gray-700 border-gray-200'
                                            }`}
                                        >
                                            {duty.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No duties assigned</p>
                        )}
                    </div>
                </div>

                {/* Spiritual Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-indigo-600" />
                        Spiritual Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Baptized Date</p>
                            <p className="text-sm">
                                {member.baptizedDate ? (
                                    `${new Date(member.baptizedDate).toLocaleDateString()} (${new Date().getFullYear() - new Date(member.baptizedDate).getFullYear()} years)`
                                ) : 'Not baptized'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Account Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Shield className="h-5 w-5 text-orange-600" />
                        Account Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Created Date</p>
                            <p className="text-sm">
                                {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Created By</p>
                            <p className="text-sm">{member.createdBy?.fullName || 'System'}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                </DialogClose>
            </DialogFooter>
        </>
    )
}

export function MemberDetailsModal({ member, children }: MemberDetailsModalProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <button className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm transition-colors">
                        <Eye className="h-4 w-4" />
                        View Details
                    </button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <MemberDetailsContent member={member} />
            </DialogContent>
        </Dialog>
    )
}