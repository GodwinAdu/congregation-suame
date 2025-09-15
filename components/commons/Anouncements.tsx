"use client"

import { useState } from "react"
import { Announcement } from "./Anouncement"


export interface AnnouncementData {
  id: string
  message: string
  type?: "info" | "success" | "warning" | "error"
}

interface AnnouncementsProps {
  initial?: AnnouncementData[]
}

export function Announcements({ initial = [] }: AnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>(initial)

  const closeAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 max-w-7xl mx-auto px-4">
      {announcements.map((a) => (
        <Announcement
          key={a.id}
          id={a.id}
          message={a.message}
          type={a.type}
          onClose={closeAnnouncement}
        />
      ))}
    </div>
  )
}
