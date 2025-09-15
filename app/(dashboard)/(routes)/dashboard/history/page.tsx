import { HistoryList } from '@/components/commons/history/history-list'
import React from 'react'

const page =  () => {
    
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">All History</h1>
      <HistoryList />
    </div>
  )
}

export default page
