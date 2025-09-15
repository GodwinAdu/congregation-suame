"use client"

import { useEffect } from 'react'
import { motion } from "framer-motion"
import { CheckCircle, X } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface ThankYouNoteProps {
  onClose: () => void
}

export function ThankYouNote({ onClose }: ThankYouNoteProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000) // Auto close after 5 seconds

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5 }}
      className="relative flex flex-col items-center justify-center p-6 bg-green-100 rounded-lg shadow-lg"
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
      </motion.div>
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-2xl font-bold text-green-700 mb-2"
      >
        Thank You!
      </motion.h2>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-center text-green-600"
      >
        We appreciate your valuable feedback. Your input helps us improve our POS system.
      </motion.p>
    </motion.div>
  )
}

