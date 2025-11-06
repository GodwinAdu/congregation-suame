"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { currentUserRole } from '@/lib/helpers/get-user-role'
import { useAuth } from '@/lib/hooks/useAuth'

interface RoleContextType {
  role: IRole | undefined
  isLoading: boolean
  refetchRole: () => Promise<void>
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<IRole | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  const fetchRole = async () => {
    try {
      setIsLoading(true)
      const data = await currentUserRole()
      setRole(data)
    } catch (error) {
      console.error('Error fetching role:', error)
      setRole(undefined)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRole()
  }, [])

  const refetchRole = async () => {
    await fetchRole()
  }

  return (
    <RoleContext.Provider value={{ role, isLoading, refetchRole }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider')
  }
  return context
}