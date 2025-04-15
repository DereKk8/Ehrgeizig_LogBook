import Link from "next/link"
import { ArrowLeft, Calendar, ClipboardList, Download, History, Plus } from "lucide-react"

export default function TrainingSplitSettingsPage() {
  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Header with back navigation */}
      <header className="sticky top-0 z-10 flex h-16 items-center border-b border-[#404040] bg-[#1e1e1e] px-4 shadow-sm md:px-6">
        <Link 
          href="/user_settings" 
          className="group flex items-center rounded-md px-3 py-2 text-[#b3b3b3] transition-colors hover:bg-[#2d2d2d] hover:text-white"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          <span className="ml-2 text-sm font-medium">Back to User Settings</span>
        </Link>
      </header>

      <main className="mx-auto max-w-4xl p-4 md:p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white md:text-3xl">Training Split Settings</h1>
          <p className="mt-2 text-[#b3b3b3]">Manage your workout schedule and training history</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Set New Split */}
          <Link
            href="/user_settings/training_split_settings/set_split"
            className="group relative cursor-pointer overflow-hidden rounded-lg border border-[#404040] bg-[#1e1e1e] p-6 shadow-[0_0_0_1px_rgba(255,87,51,0.1)] transition-all duration-300 hover:-translate-y-1 hover:border-[#FF5733] hover:shadow-[0_0_0_1px_rgba(255,87,51,0.2),0_0_20px_rgba(255,87,51,0.1)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF5733]/0 to-[#FF5733]/0 opacity-0 transition-opacity duration-500 group-hover:opacity-10"></div>

            <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FF5733]/10 text-[#FF5733] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#FF5733]/20">
              <Calendar className="h-6 w-6 transition-transform duration-500 group-hover:rotate-12" />
            </div>

            <h2 className="relative mb-2 text-lg font-semibold text-white transition-colors duration-300 group-hover:text-[#FF5733]">
              Set New Split
            </h2>

            <p className="relative mb-4 text-[#b3b3b3]">
              Create or modify your weekly workout schedule to match your fitness goals.
            </p>

            <span className="relative inline-flex items-center text-[#FF5733] transition-all duration-300 group-hover:font-medium">
              <Plus className="mr-1 h-4 w-4 transition-all duration-300 group-hover:rotate-90" />
              <span className="relative">
                Create new split
                <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#FF5733] transition-all duration-300 group-hover:w-full"></span>
              </span>
            </span>

            <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[#FF5733]/5 opacity-0 transition-all duration-500 group-hover:opacity-100"></div>
            <div className="absolute -bottom-8 -left-8 h-16 w-16 rounded-full bg-[#FF5733]/5 opacity-0 transition-all duration-500 group-hover:opacity-100"></div>
          </Link>

          {/* Update Workout Split Logs */}
          <Link
            href="/user_settings/training_split_settings/workout_split_logs"
            className="group relative overflow-hidden rounded-lg border border-[#404040] bg-[#1e1e1e] p-6 shadow-[0_0_0_1px_rgba(255,87,51,0.1)] transition-all duration-300 hover:-translate-y-1 hover:border-[#FF5733] hover:shadow-[0_0_0_1px_rgba(255,87,51,0.2),0_0_20px_rgba(255,87,51,0.1)]"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FF5733]/10 text-[#FF5733] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#FF5733]/20">
              <ClipboardList className="h-6 w-6 transition-transform duration-500 group-hover:rotate-12" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-white group-hover:text-[#FF5733]">
              Update Workout Split Logs
            </h2>
            <p className="mb-4 text-[#b3b3b3]">
              Edit and manage your existing workout logs and make adjustments as needed.
            </p>
            <span className="inline-flex items-center text-[#FF5733]">
              Update logs
              <ArrowLeft className="ml-1 h-4 w-4 rotate-180 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Link>

          {/* View Workout History */}
          <Link
            href="/user_settings/training_split_settings/workout_history"
            className="group relative cursor-pointer overflow-hidden rounded-lg border border-[#404040] bg-[#1e1e1e] p-6 shadow-[0_0_0_1px_rgba(255,87,51,0.1)] transition-all duration-300 hover:-translate-y-1 hover:border-[#FF5733] hover:shadow-[0_0_0_1px_rgba(255,87,51,0.2),0_0_20px_rgba(255,87,51,0.1)]"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FF5733]/10 text-[#FF5733] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#FF5733]/20">
              <History className="h-6 w-6 transition-transform duration-500 group-hover:rotate-12" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-white group-hover:text-[#FF5733]">
              View Workout History
            </h2>
            <p className="mb-4 text-[#b3b3b3]">
              Review your past workouts, track your progress, and analyze your performance over time.
            </p>
            <span className="inline-flex items-center text-[#FF5733]">
              View history
              <ArrowLeft className="ml-1 h-4 w-4 rotate-180 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Link>

          {/* Download Workout History */}
          <Link
            href="/user_settings/training_split_settings/download_history"
            className="group relative cursor-pointer overflow-hidden rounded-lg border border-[#404040] bg-[#1e1e1e] p-6 shadow-[0_0_0_1px_rgba(255,87,51,0.1)] transition-all duration-300 hover:-translate-y-1 hover:border-[#FF5733] hover:shadow-[0_0_0_1px_rgba(255,87,51,0.2),0_0_20px_rgba(255,87,51,0.1)]"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FF5733]/10 text-[#FF5733] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#FF5733]/20">
              <Download className="h-6 w-6 transition-transform duration-500 group-hover:rotate-12" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-white group-hover:text-[#FF5733]">
              Download Workout History
            </h2>
            <p className="mb-4 text-[#b3b3b3]">
              Export your workout data in CSV format for external analysis or record-keeping.
            </p>
            <span className="inline-flex items-center text-[#FF5733]">
              <Download className="mr-1 h-4 w-4 transition-transform duration-300 group-hover:translate-y-1" />
              Download CSV
            </span>
          </Link>
        </div>
      </main>
    </div>
  )
}
