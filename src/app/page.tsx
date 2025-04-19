'use client'

import Image from "next/image";
import Link from "next/link";
import { Activity, Dumbbell, ChevronRight, Calendar, LineChart } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Spinner from "@/components/ui/spinner";

export default function Home() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Check if user is already authenticated
  useEffect(() => {
    const checkAuthStatus = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // User is authenticated, redirect to home page
        router.push('/home');
      } else {
        // User is not authenticated, show the landing page
        setIsCheckingAuth(false);
      }
    };
    
    checkAuthStatus();
  }, [router]);
  
  // Show loading spinner while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Activity className="h-12 w-12 text-[#FF5733] mb-4" />
          <Spinner />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-[#1a1a1a] text-white">
      {/* Header/Navigation */}
      <header className="fixed top-0 w-full z-10 flex items-center justify-between border-b border-[#404040] bg-[#1e1e1e]/80 backdrop-blur-md px-6 py-4">
        <div className="flex items-center">
          <Activity className="h-7 w-7 text-[#FF5733]" />
          <span className="ml-2 text-2xl font-bold">Ehrgeizig</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link 
            href="/login" 
            className="px-4 py-2 text-white/90 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link 
            href="/signup" 
            className="px-4 py-2 bg-[#FF5733] text-white rounded-md hover:bg-[#ff8a5f] transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
            Track Your <span className="text-[#FF5733]">Fitness Journey</span>
          </h1>
          <p className="text-lg md:text-xl text-[#b3b3b3] mb-8 max-w-2xl mx-auto md:mx-0">
            Ehrgeizig helps you track workouts, manage training splits, and visualize your progress on your path to reaching your fitness goals.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
            <Link 
              href="/signup" 
              className="group px-6 py-3 bg-[#FF5733] hover:bg-[#ff8a5f] text-white rounded-md font-medium transition-all flex items-center justify-center"
            >
              Create Free Account
              <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link 
              href="/login" 
              className="px-6 py-3 border border-[#404040] hover:border-[#FF5733] hover:bg-[#FF5733]/10 rounded-md font-medium transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 md:px-12 bg-[#1e1e1e]/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">
            Everything you need to <span className="text-[#FF5733]">achieve your goals</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="rounded-lg border border-[#404040] bg-[#1e1e1e] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#FF5733] hover:shadow-[0_0_0_1px_rgba(255,87,51,0.2),0_0_20px_rgba(255,87,51,0.1)]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FF5733]/10 text-[#FF5733]">
                <Dumbbell className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium mb-3">Custom Training Splits</h3>
              <p className="text-[#b3b3b3]">Create and manage personalized workout routines tailored to your specific fitness goals.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="rounded-lg border border-[#404040] bg-[#1e1e1e] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#FF5733] hover:shadow-[0_0_0_1px_rgba(255,87,51,0.2),0_0_20px_rgba(255,87,51,0.1)]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FF5733]/10 text-[#FF5733]">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium mb-3">Workout Logging</h3>
              <p className="text-[#b3b3b3]">Easily track your workouts, sets, and reps with our intuitive logging system.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="rounded-lg border border-[#404040] bg-[#1e1e1e] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#FF5733] hover:shadow-[0_0_0_1px_rgba(255,87,51,0.2),0_0_20px_rgba(255,87,51,0.1)]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FF5733]/10 text-[#FF5733]">
                <LineChart className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium mb-3">Progress Tracking</h3>
              <p className="text-[#b3b3b3]">Visualize your progress and analyze your performance over time to stay motivated.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to start your fitness journey?</h2>
          <p className="text-lg text-[#b3b3b3] mb-8">Join Ehrgeizig today and take the first step toward your fitness goals.</p>
          <Link 
            href="/signup" 
            className="inline-flex items-center px-8 py-4 bg-[#FF5733] hover:bg-[#ff8a5f] text-white rounded-md font-medium text-lg transition-all"
          >
            Get Started for Free
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#404040] bg-[#1e1e1e] py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-6 md:mb-0">
              <Activity className="h-6 w-6 text-[#FF5733]" />
              <span className="ml-2 text-xl font-bold">Ehrgeizig</span>
            </div>
            <div className="text-sm text-[#b3b3b3]">
              © {new Date().getFullYear()} Ehrgeizig Fitness App. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
