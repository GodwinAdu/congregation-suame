'use server'

import { ManualReading } from '@/lib/data/bible-reading-plan'

const MANUAL_READINGS_KEY = 'manual_bible_readings'
const MANUAL_MODE_KEY = 'manual_bible_mode'

export async function saveManualReadings(readings: ManualReading[]) {
  try {
    if (typeof window === 'undefined') {
      return { success: false, error: 'This action must be called from client' }
    }
    return { success: true, data: readings }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function addManualReading(date: string, chapters: string[]) {
  try {
    if (typeof window === 'undefined') {
      return { success: false, error: 'This action must be called from client' }
    }
    return { success: true, data: { date, readings: chapters } }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function removeManualReading(date: string) {
  try {
    if (typeof window === 'undefined') {
      return { success: false, error: 'This action must be called from client' }
    }
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateManualReading(date: string, chapters: string[]) {
  try {
    if (typeof window === 'undefined') {
      return { success: false, error: 'This action must be called from client' }
    }
    return { success: true, data: { date, readings: chapters } }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
