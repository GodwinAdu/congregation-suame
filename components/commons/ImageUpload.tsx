'use client'

import { useUploadThing } from "@/lib/uploadthing"
import { useDropzone } from "@uploadthing/react"
import { useCallback, useState } from "react"
import { generateClientDropzoneAccept, generatePermittedFileTypes } from "uploadthing/client"
import { Card, CardContent } from "@/components/ui/card"
import { UploadCloud, File, X } from 'lucide-react'
import { ControllerRenderProps } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

import Image from "next/image"
import { toast } from "sonner"

interface ImageUploaderProps extends ControllerRenderProps {
  label?: string
}

export function ImageUploader({ onChange, value, }: ImageUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})


  const { startUpload, routeConfig } = useUploadThing("imageUploader", {
    onUploadProgress: (progress: number) => {
      // Assuming you have a way to map progress to file names
      // This is a placeholder implementation
      const fileName = "placeholderFileName";
      setUploadProgress((prev) => ({
        ...prev,
        [fileName]: progress,
      }));
    },
    onClientUploadComplete: (res) => {
      if (res) {
        const uploadedUrls = res.map(file => file.url)
        onChange(uploadedUrls)
        setFiles([])
        setUploadProgress({})
        toast.success(`Uploaded ${res.length} ${res.length === 1 ? 'file' : 'files'}`)
      }
    },
    onUploadError: (error) => {
      toast.error(`Upload Failed: ${error.message || "Error occurred while uploading"}`)
      setUploadProgress({})
    },
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles)
    startUpload(acceptedFiles)
  }, [startUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(
      generatePermittedFileTypes(routeConfig).fileTypes,
    ),
  })

  const removeFile = (fileToRemove: File) => {
    setFiles(files.filter(file => file !== fileToRemove))
    setUploadProgress((prev) => {
      const newProgress = { ...prev }
      delete newProgress[fileToRemove.name]
      return newProgress
    })
    onChange(value.filter((url: string) => !url.includes(fileToRemove.name)))
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${isDragActive ? "border-primary bg-primary/10" : "border-gray-300"
            }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive
              ? "Drop the files here..."
              : "Drag 'n' drop some files here, or click to select files"}
          </p>
        </div>
        {files.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Uploading Files:</h4>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li key={index} className="bg-gray-100 p-2 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <File className="h-4 w-4 mr-2" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeFile(file)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Progress value={uploadProgress[file.name] || 0} className="h-2" />
                </li>
              ))}
            </ul>
          </div>
        )}
        {value && value.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-4">Uploaded Images</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {value.map((url: string, index: number) => (
                <div key={index} className="relative group rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  {/* Display Image */}
                  <Image
                    src={url}
                    alt={`Uploaded image ${index + 1}`}
                    layout="responsive"
                    width={150}
                    height={150}
                    objectFit="cover"
                    className="rounded-lg"
                  />
                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-600 p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onChange(value.filter((_: string, i: number) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

