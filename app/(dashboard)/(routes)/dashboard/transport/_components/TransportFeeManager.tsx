"use client"

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, DollarSign, Users, Calendar, FileX, Edit, Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { fetchAllTransportFees, fetchMembersWithFeeStatus, toggleMemberJoinStatus, deleteTransportFee, resetAllTransportData } from "@/lib/actions/transport-fee.actions";
import { fetchAllMembers } from "@/lib/actions/user.actions";
import { CreateFeeModal } from "./CreateFeeModal";
import { FeePaymentModal } from "./FeePaymentModal";

interface TransportFee {
    _id: string;
    name: string;
    description?: string;
    amount: number;
    dueDate?: string;
    createdBy: { fullName: string };
    createdAt: string;
}

interface MemberFeeStatus {
    _id: string;
    fullName: string;
    amountPaid: number;
    isPaid: boolean;
    balance: number;
    isJoined: boolean;
    paymentDate?: string;
}

interface AllMember {
    _id: string;
    fullName: string;
}

export function TransportFeeManager() {
    const [fees, setFees] = useState<TransportFee[]>([]);
    const [selectedFee, setSelectedFee] = useState<TransportFee | null>(null);
    const [members, setMembers] = useState<MemberFeeStatus[]>([]);
    const [allMembers, setAllMembers] = useState<AllMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<MemberFeeStatus | null>(null);
    const [editingFee, setEditingFee] = useState<TransportFee | null>(null);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");

    const fetchFees = useCallback(async () => {
        try {
            const data = await fetchAllTransportFees();
            setFees(data);
            if (data.length > 0 && !selectedFee) {
                setSelectedFee(data[0]);
            }
        } catch (error) {
            toast.error("Failed to fetch transport fees");
        } finally {
            setLoading(false);
        }
    }, [selectedFee]);

    const fetchAllMembersData = useCallback(async () => {
        try {
            const data = await fetchAllMembers();
            setAllMembers(data);
        } catch (error) {
            toast.error("Failed to fetch members");
        }
    }, []);

    useEffect(() => {
        fetchFees();
        fetchAllMembersData();
    }, [fetchFees, fetchAllMembersData]);

    useEffect(() => {
        if (selectedFee) {
            fetchMembersForFee(selectedFee._id);
        }
    }, [selectedFee, allMembers]);

    const fetchMembersForFee = async (feeId: string) => {
        try {
            const data = await fetchMembersWithFeeStatus(feeId);
            // Merge with all members to show join status
            const mergedMembers = allMembers.map(member => {
                const feeStatus = data.members.find((m: any) => m._id === member._id);
                return {
                    _id: member._id,
                    fullName: member.fullName,
                    amountPaid: feeStatus?.amountPaid || 0,
                    isPaid: feeStatus?.isPaid || false,
                    balance: feeStatus?.balance || 0,
                    isJoined: feeStatus?.isJoined || false,
                    paymentDate: feeStatus?.paymentDate
                };
            });
            setMembers(mergedMembers);
        } catch (error) {
            toast.error("Failed to fetch member payment status");
        }
    };

    const handleFeeCreated = () => {
        setShowCreateModal(false);
        setEditingFee(null);
        setModalMode("create");
        fetchFees();
    };

    const handleEditFee = (fee: TransportFee) => {
        setEditingFee(fee);
        setModalMode("edit");
        setShowCreateModal(true);
    };

    const handleDeleteFee = async (fee: TransportFee) => {
        if (!confirm(`Are you sure you want to delete "${fee.name}"? This will remove all payment records.`)) {
            return;
        }
        
        try {
            await deleteTransportFee(fee._id);
            toast.success(`${fee.name} deleted successfully`);
            
            // If deleted fee was selected, select another one
            if (selectedFee?._id === fee._id) {
                const remainingFees = fees.filter(f => f._id !== fee._id);
                setSelectedFee(remainingFees.length > 0 ? remainingFees[0] : null);
            }
            
            fetchFees();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete fee");
        }
    };

    const handleResetAll = async () => {
        if (!confirm("Are you sure you want to reset all transport data? This will delete all fees and payments permanently.")) {
            return;
        }
        
        try {
            await resetAllTransportData();
            toast.success("All transport data has been reset");
            setFees([]);
            setSelectedFee(null);
            setMembers([]);
        } catch (error: any) {
            toast.error(error.message || "Failed to reset transport data");
        }
    };

    const handlePaymentAdded = () => {
        setShowPaymentModal(false);
        setSelectedMember(null);
        if (selectedFee) {
            fetchMembersForFee(selectedFee._id);
        }
    };

    const handleAddPayment = (member: MemberFeeStatus) => {
        setSelectedMember(member);
        setShowPaymentModal(true);
    };

    const handleToggleJoin = async (member: MemberFeeStatus) => {
        if (!selectedFee) return;
        
        try {
            await toggleMemberJoinStatus(member._id, selectedFee._id, !member.isJoined);
            toast.success(`${member.fullName} ${!member.isJoined ? 'joined' : 'left'} ${selectedFee.name}`);
            fetchMembersForFee(selectedFee._id);
        } catch (error: any) {
            toast.error(error.message || "Failed to update join status");
        }
    };

    const getPaymentStats = () => {
        const joinedMembers = members.filter(m => m.isJoined);
        const totalMembers = joinedMembers.length;
        const paidMembers = joinedMembers.filter(m => m.isPaid).length;
        const totalCollected = joinedMembers.reduce((sum, m) => sum + m.amountPaid, 0);
        const totalExpected = selectedFee ? selectedFee.amount * totalMembers : 0;

        return { totalMembers, paidMembers, totalCollected, totalExpected };
    };

    const stats = getPaymentStats();

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="pb-2">
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-48" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-6 w-16" />
                                        <Skeleton className="h-8 w-24" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (fees.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Transport Fee Management</h2>
                    <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create New Fee
                    </Button>
                </div>
                
                <Card className="p-12">
                    <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                            <FileX className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">No Transport Fees Created</h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                Get started by creating your first transport fee. You can manage multiple fees like convention fees, execution fees, and more.
                            </p>
                        </div>
                        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create Your First Fee
                        </Button>
                    </div>
                </Card>

                <CreateFeeModal
                    open={showCreateModal}
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingFee(null);
                        setModalMode("create");
                    }}
                    onSuccess={handleFeeCreated}
                    editFee={editingFee}
                    mode={modalMode}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-end items-center">
               
                <div className="flex gap-2">
                    <Button 
                        onClick={handleResetAll} 
                        variant="outline" 
                        className="gap-2 text-red-600 hover:text-red-700"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset All
                    </Button>
                    <Button onClick={() => {
                        setModalMode("create");
                        setEditingFee(null);
                        setShowCreateModal(true);
                    }} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create New Fee
                    </Button>
                </div>
            </div>

            <Tabs value={selectedFee?._id} onValueChange={(value) => {
                const fee = fees.find(f => f._id === value);
                if (fee) setSelectedFee(fee);
            }}>
                <TabsList className="">
                    {fees.map((fee) => (
                        <TabsTrigger key={fee._id} value={fee._id} className="flex-1">
                            {fee.name}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {fees.map((fee) => (
                    <TabsContent key={fee._id} value={fee._id} className="space-y-6">
                        {/* Fee Actions */}
                        <div className="flex justify-end gap-2 mb-4">
                            <Button
                                onClick={() => handleEditFee(fee)}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <Edit className="h-4 w-4" />
                                Edit Fee
                            </Button>
                            <Button
                                onClick={() => handleDeleteFee(fee)}
                                variant="outline"
                                size="sm"
                                className="gap-2 text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete Fee
                            </Button>
                        </div>

                        {/* Fee Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        Fee Amount
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">₵{fee.amount}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Payment Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.paidMembers}/{stats.totalMembers}</div>
                                    <p className="text-xs text-muted-foreground">Members Paid</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        Total Collected
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">₵{stats.totalCollected}</div>
                                    <p className="text-xs text-muted-foreground">of ₵{stats.totalExpected}</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Due Date
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm font-medium">
                                        {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : "No due date"}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Members List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Member Payments - {fee.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {members.map((member) => (
                                        <div key={member._id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <p className="font-medium">{member.fullName}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {member.isJoined ? `Paid: ₵${member.amountPaid} | Balance: ₵${member.balance}` : "Not joined"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {member.isJoined ? (
                                                    <>
                                                        <Badge variant={member.isPaid ? "default" : "destructive"}>
                                                            {member.isPaid ? "Paid" : "Pending"}
                                                        </Badge>
                                                        {!member.isPaid && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleAddPayment(member)}
                                                            >
                                                                Add Payment
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleToggleJoin(member)}
                                                        >
                                                            Leave
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Badge variant="secondary">Not Joined</Badge>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleToggleJoin(member)}
                                                        >
                                                            Join
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>

            <CreateFeeModal
                open={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setEditingFee(null);
                    setModalMode("create");
                }}
                onSuccess={handleFeeCreated}
                editFee={editingFee}
                mode={modalMode}
            />

            <FeePaymentModal
                open={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                member={selectedMember}
                fee={selectedFee}
                onSuccess={handlePaymentAdded}
            />
        </div>
    );
}