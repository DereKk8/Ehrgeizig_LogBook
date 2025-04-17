'use client'

import { useFormContext } from 'react-hook-form'

export default function SplitNameStep() {
  const { register, formState: { errors } } = useFormContext()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Name Your Training Split</h2>
        <p className="mt-2 text-[#b3b3b3]">
          Give your training split a descriptive name (e.g., "Push/Pull/Legs", "Strength Split")
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="splitName" className="block text-sm font-medium text-white">
          Split Name
        </label>
        <input
          type="text"
          id="splitName"
          {...register('splitName')}
          className="block w-full rounded-md border border-[#404040] bg-[#2d2d2d] px-4 py-2 text-white placeholder-[#666666] focus:border-[#FF5733] focus:outline-none focus:ring-1 focus:ring-[#FF5733]"
          placeholder="Enter split name"
        />
        {errors.splitName && (
          <p className="text-sm text-red-500">{errors.splitName.message as string}</p>
        )}
      </div>
    </div>
  )
} 