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
import { Eye, User, Mail, Phone, MapPin, Calendar, Users, Shield, Key } from "lucide-react"
import { useState } from "react"

interface MemberDetailsModalProps {
    member: any
}

export function MemberDetailsModal({ member }: MemberDetailsModalProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm transition-colors">
                    <Eye className="h-4 w-4" />
                    View Details
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
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

                    {/* Account Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-orange-600" />
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
            </DialogContent>
        </Dialog>
    )
}