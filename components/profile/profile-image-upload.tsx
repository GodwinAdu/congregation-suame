"use client"

import { useState, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Loader2, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { useUploadThing } from '@/lib/uploadthing-client'
import { updateProfile } from '@/lib/actions/user.actions'

interface ProfileImageUploadProps {
    currentImage?: string | null
    fullName: string
    onImageUpdate?: (url: string) => void
}

export function ProfileImageUpload({ currentImage, fullName, onImageUpdate }: ProfileImageUploadProps) {
    const [imageUrl, setImageUrl] = useState(currentImage || '')
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { startUpload } = useUploadThing('profileImage', {
        onClientUploadComplete: async (res) => {
            if (res && res[0]) {
                const url = res[0].ufsUrl
                setImageUrl(url)
                setUploading(false)

                // Save to database
                try {
                    await updateProfile({ profileImage: url } as any)
                    toast.success('Profile photo updated')
                    onImageUpdate?.(url)
                } catch {
                    toast.error('Failed to save profile photo')
                }
            }
        },
        onUploadError: (error) => {
            setUploading(false)
            toast.error(error.message || 'Upload failed')
        },
    })

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file')
            return
        }
        if (file.size > 4 * 1024 * 1024) {
            toast.error('Image must be less than 4MB')
            return
        }

        setUploading(true)
        await startUpload([file])
    }

    const handleRemove = async () => {
        try {
            await updateProfile({ profileImage: '' } as any)
            setImageUrl('')
            toast.success('Profile photo removed')
            onImageUpdate?.('')
        } catch {
            toast.error('Failed to remove photo')
        }
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Profile Photo
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group">
                        <Avatar className="h-24 w-24 border-2 border-border">
                            <AvatarImage src={imageUrl} alt={fullName} />
                            <AvatarFallback className="text-xl bg-primary/10 text-primary">
                                {getInitials(fullName)}
                            </AvatarFallback>
                        </Avatar>
                        {uploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                <Loader2 className="h-6 w-6 animate-spin text-white" />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            className="hidden"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            {imageUrl ? 'Change Photo' : 'Upload Photo'}
                        </Button>
                        {imageUrl && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRemove}
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                            </Button>
                        )}
                        <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 4MB.</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
