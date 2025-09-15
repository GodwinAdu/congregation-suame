"use client"
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface AnnouncementProps {
  id: string
  message: string
  type?: "info" | "success" | "warning" | "error"
  onClose: (id: string) => void
}

const getStyles = (type: string = "info") => {
  switch (type) {
    case "success":
      return {
        bg: "bg-green-500",
        text: "text-white",
        border: "border-green-600"
      }
    case "warning":
      return {
        bg: "bg-yellow-500",
        text: "text-black",
        border: "border-yellow-600"
      }
    case "error":
      return {
        bg: "bg-red-500",
        text: "text-white",
        border: "border-red-600"
      }
    case "info":
    default:
      return {
        bg: "bg-blue-500",
        text: "text-white",
        border: "border-blue-600"
      }
  }
}

export function Announcement({ id, message, type = "info", onClose }: AnnouncementProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(id), 300)
  }

  const styles = getStyles(type)

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
    >
      <div className={`${styles.bg} ${styles.text} border ${styles.border} px-4 py-3 shadow-lg`}>
        <div className="container mx-auto flex items-center justify-between">
          <p className="text-sm font-medium">{message}</p>
          <button
            onClick={handleClose}
            className="hover:opacity-75 transition-colors duration-200"
            aria-label="Close announcement"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
