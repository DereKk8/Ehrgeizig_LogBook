'use client'

import { Check, Dumbbell, ArrowLeft, Home, Calendar, Clock, ListOrdered } from 'lucide-react'
import Link from 'next/link'
import { FormData } from '../page'

interface SuccessConfirmationProps {
  formData: FormData;
}

export default function SuccessConfirmation({ formData }: SuccessConfirmationProps) {
  const DAYS = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ]

  const trainingDayCount = formData.days.filter(day => !day.isRestDay).length;
  const exerciseCount = formData.days.reduce((count, day) => 
    count + (day.isRestDay ? 0 : day.exercises.length), 0);

  // Format rest time in minutes and seconds
  const formatRestTime = (seconds: number) => {
    if (seconds < 60) return `${seconds} sec`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 
      ? `${minutes} min ${remainingSeconds} sec`
      : `${minutes} min`;
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col">
      {/* Success header */}
      <div className="bg-gradient-to-br from-[#1e1e1e] to-[#252525] p-8 border-b border-[#404040]">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white text-center mb-2">
            Split Created Successfully!
          </h1>
          
          <p className="text-[#b3b3b3] text-center max-w-lg mx-auto">
            Your training split "<span className="text-white font-medium">{formData.splitName}</span>" 
            has been saved successfully. You can now use it for your workout sessions.
          </p>
          
          <div className="flex justify-center space-x-4 mt-8">
            <Link 
              href="/home"
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-[#FF5733] text-white hover:bg-[#ff8a5f] transition-colors duration-200 shadow-md"
            >
              <Home className="mr-2 h-5 w-5" />
              Go to Home
            </Link>
            
            <Link 
              href="/user_settings/training_split_settings"
              className="inline-flex items-center px-5 py-2.5 rounded-lg border border-[#404040] bg-[#2d2d2d] text-white hover:bg-[#333333] transition-colors duration-200"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Training Splits
            </Link>
          </div>
        </div>
      </div>
      
      {/* Split details */}
      <div className="flex-grow py-8 px-4 md:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-6 border-b border-[#404040] pb-4">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-md bg-[#FF5733]/10 flex items-center justify-center mr-4">
                <Dumbbell className="h-6 w-6 text-[#FF5733]" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {formData.splitName}
                </h2>
                <p className="text-[#b3b3b3]">
                  {trainingDayCount} training {trainingDayCount === 1 ? 'day' : 'days'} · 
                  {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
                </p>
              </div>
            </div>
            
            <div className="bg-[#FF5733]/10 text-[#FF5733] px-3 py-1 rounded-full text-sm font-medium">
              New Split
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-[#FF5733]" />
              Weekly Schedule
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {formData.days.map((day, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${
                    day.isRestDay 
                      ? 'border-[#404040] bg-[#1e1e1e]' 
                      : 'border-[#FF5733]/30 bg-gradient-to-br from-[#2d2d2d] to-[#252525]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{DAYS[index]}</h4>
                    <div className={`text-xs px-2 py-0.5 rounded-full ${
                      day.isRestDay 
                        ? 'bg-[#404040]/50 text-[#b3b3b3]' 
                        : 'bg-[#FF5733]/10 text-[#FF5733]'
                    }`}>
                      {day.isRestDay ? 'Rest Day' : 'Training Day'}
                    </div>
                  </div>
                  
                  {!day.isRestDay && (
                    <>
                      <p className="text-sm text-[#b3b3b3] mb-2">
                        {day.workoutName}
                      </p>
                      <p className="text-xs text-[#808080]">
                        {day.exercises.length} {day.exercises.length === 1 ? 'exercise' : 'exercises'}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <ListOrdered className="mr-2 h-5 w-5 text-[#FF5733]" />
              Exercise Details
            </h3>
            
            {formData.days.map((day, dayIndex) => {
              if (day.isRestDay) return null;
              
              return (
                <div key={dayIndex} className="mb-6">
                  <h4 className="text-lg font-medium text-white mb-3">
                    {DAYS[dayIndex]} · {day.workoutName}
                  </h4>
                  
                  <div className="space-y-4">
                    {day.exercises.map((exercise, exerciseIndex) => (
                      <div 
                        key={exerciseIndex}
                        className="p-4 rounded-lg border border-[#404040] bg-[#1e1e1e]"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 pb-2 border-b border-[#404040]">
                          <h5 className="font-medium text-white">
                            {exercise.name}
                          </h5>
                          
                          <div className="flex items-center space-x-4 text-sm text-[#b3b3b3] mt-2 sm:mt-0">
                            <div className="flex items-center">
                              <ListOrdered className="h-4 w-4 mr-1.5 text-[#FF5733]" />
                              <span>{exercise.sets} {exercise.sets === 1 ? 'set' : 'sets'}</span>
                            </div>
                            
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1.5 text-[#FF5733]" />
                              <span>{formatRestTime(exercise.restTimeSec)} rest</span>
                            </div>
                          </div>
                        </div>
                        
                        {exercise.note && (
                          <div className="mb-3 text-sm text-[#b3b3b3] italic pb-2">
                            {exercise.note}
                          </div>
                        )}
                        
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr>
                                <th className="py-2 text-left text-xs text-[#b3b3b3]">Set</th>
                                <th className="py-2 text-left text-xs text-[#b3b3b3]">Reps</th>
                                <th className="py-2 text-left text-xs text-[#b3b3b3]">Weight </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#404040]/30">
                              {exercise.setsData.map((set, setIndex) => (
                                <tr key={setIndex}>
                                  <td className="py-2 text-[#b3b3b3]">{setIndex + 1}</td>
                                  <td className="py-2 text-white">{set.reps}</td>
                                  <td className="py-2 text-white">{set.weight}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  )
}