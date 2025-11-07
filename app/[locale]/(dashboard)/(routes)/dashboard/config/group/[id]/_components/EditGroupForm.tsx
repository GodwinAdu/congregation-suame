"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { updateGroup } from '@/lib/actions/group.actions'

interface EditGroupFormProps {
    group: any
}

export function EditGroupForm({ group }: EditGroupFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState(group.name || '')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!name.trim()) {
            toast.error('Group name is required')
            return
        }

        setLoading(true)

        try {
            await updateGroup(group._id, { name: name.trim() })
            toast.success('Group updated successfully')
            router.push('/dashboard/config/group')
        } catch (error: any) {
            toast.error(error.message || 'Failed to update group')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="max-w-md">
            <CardHeader>
                <CardTitle>Edit Group</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Group Name *</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter group name"
                            required
                        />
                    </div>
                    
                    <div className="flex gap-4">
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Group'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}