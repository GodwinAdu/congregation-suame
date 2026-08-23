import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const f = createUploadthing()

// Middleware to check auth via JWT cookie
const authMiddleware = async () => {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
        throw new UploadThingError('Unauthorized')
    }

    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY!) as { id: string }
        return { userId: decoded.id }
    } catch {
        throw new UploadThingError('Invalid token')
    }
}

export const ourFileRouter = {
    profileImage: f({
        image: { maxFileSize: '4MB', maxFileCount: 1 },
    })
        .middleware(authMiddleware)
        .onUploadComplete(async ({ metadata, file }) => {
            return { uploadedBy: metadata.userId, url: file.ufsUrl }
        }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
