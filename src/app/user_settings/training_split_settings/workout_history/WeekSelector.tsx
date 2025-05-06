'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface WeekSelectorProps {
  weekOffset: number
  onWeekChange: (newOffset: number) => void
}

export default function WeekSelector({ weekOffset, onWeekChange }: WeekSelectorProps) {
  const handlePreviousWeek = () => {
    onWeekChange(weekOffset - 1)
  }

  const handleNextWeek = () => {
    onWeekChange(weekOffset + 1)
  }

  const handleCurrentWeek = () => {
    onWeekChange(0)
  }

  return (
    <div className="flex items-center justify-center space-x-2 mb-6">
      <button
        onClick={handlePreviousWeek}
        className="p-2 rounded-full bg-[#2a2a2a] hover:bg-[#353535] transition-colors border border-[#404040]"
        aria-label="Previous Week"
      >
        <ChevronLeft className="h-5 w-5 text-white" />
      </button>
      
      <button
        onClick={handleCurrentWeek}
        className="px-4 py-2 text-sm font-medium rounded-md bg-[#FF5733]/20 text-[#FF5733] hover:bg-[#FF5733]/30 transition-colors border border-[#FF5733]/30"
      >
        Current Week
      </button>
      
      <button
        onClick={handleNextWeek}
        className="p-2 rounded-full bg-[#2a2a2a] hover:bg-[#353535] transition-colors border border-[#404040] disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next Week"
        disabled={weekOffset >= 0}
      >
        <ChevronRight className="h-5 w-5 text-white" />
      </button>
    </div>
  )
}
