'use client'

import { useState, useEffect } from 'react'
import { getUserSplits } from '@/app/actions/workout'
import { Dumbbell, Loader2, Calendar } from 'lucide-react'
import { Split } from '@/app/types/db'

interface SelectSplitStepProps {
  onSplitSelected: (splitId: string, splitName: string) => void
  setError: (error: string | null) => void
}

export default function SelectSplitStep({ onSplitSelected, setError }: SelectSplitStepProps) {
  const [splits, setSplits] = useState<Split[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch user's splits on component mount
  useEffect(() => {
    async function fetchSplits() {
      setLoading(true)
      try {
        const result = await getUserSplits()
        
        if (!result.success) {
          setError(result.error || 'Failed to load training splits')
          setSplits([])
          return
        }
        
        // Add null check for result.data
        if (!result.data || result.data.length === 0) {
          setError('You don\'t have any training splits yet. Create a split first.')
          setSplits([])
        } else {
          setError(null)
          // Make sure we're handling possible undefined data
          setSplits(result.data || [])
        }
      } catch {
        setError('An error occurred while loading your splits')
        setSplits([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchSplits()
  }, [setError])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF5733]" />
        <p className="mt-4 text-[#b3b3b3]">Loading your training splits...</p>
      </div>
    )
  }

  if (splits.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#FF5733]/10 text-[#FF5733] mb-4">
            <Calendar className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">No Training Splits Found</h2>
          <p className="mt-3 text-[#b3b3b3]">
            You need to create a training split before you can start a workout.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#FF5733]/10 text-[#FF5733] mb-4">
          <Calendar className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-white">Select a Training Split</h2>
        <p className="mt-3 text-[#b3b3b3]">
          Choose a training split to begin your workout session
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {splits.map((split) => (
          <button
            key={split.id}
            onClick={() => onSplitSelected(split.id, split.name)}
            className="group flex flex-col items-center rounded-lg border border-[#404040] bg-[#2d2d2d] p-6 text-center transition-all duration-300 hover:border-[#FF5733]/50 hover:shadow-md hover:shadow-[#FF5733]/10"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FF5733]/10 text-[#FF5733] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#FF5733]/20">
              <Dumbbell className="h-8 w-8" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white transition-colors duration-300 group-hover:text-[#FF5733]">
              {split.name}
            </h3>
            <p className="text-sm text-[#b3b3b3]">
              Created: {new Date(split.created_at).toLocaleDateString()}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}