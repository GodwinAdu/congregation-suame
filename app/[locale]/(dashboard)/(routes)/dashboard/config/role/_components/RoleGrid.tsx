"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle, Shield, Plus, Users } from 'lucide-react'
import { getAllRoles } from '@/lib/actions/role.actions'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DataTable } from '@/components/table/data-table'
import { createColumns, RoleType } from './columns'
import { RoleModal } from './RoleModal'
import { DeleteRoleModal } from './DeleteRoleModal'

const RoleGrid = () => {
    const [rolesData, setRolesData] = useState<RoleType[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedRole, setSelectedRole] = useState<RoleType | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const data = await getAllRoles()
            setRolesData(data)
        } catch (err) {
            setError('Failed to fetch roles. Please try again.')
            console.error('Error fetching roles:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleRefresh = () => {
        fetchData()
    }

    const handleCreate = () => {
        setSelectedRole(null)
        setShowCreateModal(true)
    }

    const handleEdit = (role: RoleType) => {
        setSelectedRole(role)
        setShowEditModal(true)
    }

    const handleDelete = (role: RoleType) => {
        setSelectedRole(role)
        setShowDeleteModal(true)
    }

    const handleCloseModals = () => {
        setShowCreateModal(false)
        setShowEditModal(false)
        setShowDeleteModal(false)
        setSelectedRole(null)
    }

    const LoadingSkeleton = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-4 w-24" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )

    // Calculate statistics
    const totalRoles = rolesData.length
    const adminRoles = rolesData.filter(role =>
        role.permissions.manageAllMembers || role.permissions.manageUser
    ).length
    const basicRoles = totalRoles - adminRoles

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Shield className="w-5 h-5 text-blue-600" />
                            <div>
                                <div className="text-2xl font-bold text-blue-600">{totalRoles}</div>
                                <div className="text-sm text-muted-foreground">Total Roles</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Users className="w-5 h-5 text-purple-600" />
                            <div>
                                <div className="text-2xl font-bold text-purple-600">{adminRoles}</div>
                                <div className="text-sm text-muted-foreground">Admin Roles</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Shield className="w-5 h-5 text-green-600" />
                            <div>
                                <div className="text-2xl font-bold text-green-600">{basicRoles}</div>
                                <div className="text-sm text-muted-foreground">Basic Roles</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Header */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-card-foreground">
                            <Shield className="w-5 h-5 text-primary" />
                            Role Management
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleCreate}
                                disabled={loading}
                                className="shrink-0"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Role
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleRefresh}
                                disabled={loading}
                                className="shrink-0"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Error State */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Data Table */}
            {loading ? (
                <LoadingSkeleton />
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>System Roles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            searchKey='name'
                            columns={createColumns({
                                onEdit: handleEdit,
                                onDelete: handleDelete
                            })}
                            data={rolesData}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Modals */}
            <RoleModal
                open={showCreateModal}
                onClose={handleCloseModals}
                role={null}
                onSuccess={handleRefresh}
                mode="create"
            />

            <RoleModal
                open={showEditModal}
                onClose={handleCloseModals}
                role={selectedRole}
                onSuccess={handleRefresh}
                mode="edit"
            />

            <DeleteRoleModal
                open={showDeleteModal}
                onClose={handleCloseModals}
                role={selectedRole}
                onSuccess={handleRefresh}
            />
        </div>
    )
}

export default RoleGrid