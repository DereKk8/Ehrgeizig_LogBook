'use client'

import Image from "next/image";
import Link from "next/link";
import { Activity, Dumbbell, ChevronRight, Calendar, LineChart, Star, Quote } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Spinner from "@/components/ui/spinner";

export default function Home() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
  // Testimonial data
  const testimonials = [
    {
      id: 1,
      name: "Alex Martinez",
      role: "Fitness Enthusiast",
      quote: "Ehrgeizig transformed how I track my workouts. The split system makes it so easy to stay consistent and see my progress over time.",
      stars: 5,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      role: "Powerlifter",
      quote: "As a competitive powerlifter, tracking my numbers is essential. Ehrgeizig's simple interface lets me focus on lifting heavy, not fiddling with apps.",
      stars: 5,
    },
    {
      id: 3,
      name: "Mike Thompson",
      role: "Personal Trainer",
      quote: "I recommend Ehrgeizig to all my clients. The progress tracking features keep them motivated and the customizable splits work for all fitness levels.",
      stars: 5,
    },
  ];
  
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
  
  // Rotate testimonials every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [testimonials.length]);
  
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
      
      {/* Testimonials Section */}
      <section className="py-16 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center">
            Trusted by <span className="text-[#FF5733]">fitness enthusiasts</span>
          </h2>
          
          <div className="relative">
            <div className="absolute left-6 top-6 text-[#FF5733] opacity-20">
              <Quote className="h-20 w-20" />
            </div>
            
            <div className="bg-gradient-to-br from-[#232323] to-[#2a2a2a] rounded-xl p-8 border border-[#404040] relative overflow-hidden">
              <div className="relative z-10">
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={testimonial.id} 
                    className={`transition-opacity duration-500 ${index === activeTestimonial ? 'opacity-100' : 'opacity-0 absolute top-0 left-0'}`}
                    style={{ display: index === activeTestimonial ? 'block' : 'none' }}
                  >
                    <div className="flex mb-6">
                      {[...Array(testimonial.stars)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-[#FFD700] text-[#FFD700]" />
                      ))}
                    </div>
                    <p className="text-lg md:text-xl mb-8 italic text-white/90">"{testimonial.quote}"</p>
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-[#FF5733]/20 flex items-center justify-center text-[#FF5733]">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <p className="font-medium">{testimonial.name}</p>
                        <p className="text-sm text-[#b3b3b3]">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Testimonial indicators */}
              <div className="flex justify-center mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`h-2 w-2 rounded-full mx-1 transition-all ${
                      index === activeTestimonial ? 'bg-[#FF5733] w-6' : 'bg-[#404040]'
                    }`}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Promo */}
      <section className="py-16 px-6 md:px-12 bg-[#1e1e1e]/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:space-x-12">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <div className="w-64 h-[500px] mx-auto rounded-[36px] border-8 border-[#333] bg-[#121212] shadow-xl relative overflow-hidden">
              <div className="absolute w-32 h-6 bg-[#333] rounded-b-xl left-1/2 transform -translate-x-1/2"></div>
              <div className="h-full w-full bg-gradient-to-br from-[#121212] to-[#1e1e1e] p-2">
                <div className="h-full w-full rounded-[24px] overflow-hidden border border-[#404040] flex items-center justify-center">
                  <div className="text-center p-4">
                    <Activity className="h-10 w-10 text-[#FF5733] mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Ehrgeizig</h3>
                    <p className="text-sm text-[#b3b3b3] mb-8">Track anywhere, anytime</p>
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-[#404040] to-transparent mb-8"></div>
                    <div className="mb-8 rounded-lg bg-[#232323] p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-medium">Today's Workout</p>
                        <span className="text-xs text-[#FF5733] bg-[#FF5733]/10 px-2 py-1 rounded-full">Ready</span>
                      </div>
                      <p className="text-sm text-[#b3b3b3]">Upper Body • PHAT Split</p>
                    </div>
                    <button className="w-full py-3 bg-[#FF5733] rounded-lg font-medium">
                      Start Workout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Take your workouts <span className="text-[#FF5733]">anywhere</span></h2>
            <p className="text-lg text-[#b3b3b3] mb-8">
              The Ehrgeizig app is designed for mobile-first use. Log your workouts at the gym, track your progress on the go, and stay consistent with your fitness routine.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <div className="mr-4 h-6 w-6 rounded-full bg-[#FF5733]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#FF5733] text-sm">✓</span>
                </div>
                <span>Optimized for mobile use at the gym</span>
              </li>
              <li className="flex items-start">
                <div className="mr-4 h-6 w-6 rounded-full bg-[#FF5733]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#FF5733] text-sm">✓</span>
                </div>
                <span>Works offline during your workout</span>
              </li>
              <li className="flex items-start">
                <div className="mr-4 h-6 w-6 rounded-full bg-[#FF5733]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#FF5733] text-sm">✓</span>
                </div>
                <span>Clean interface for quick logging between sets</span>
              </li>
            </ul>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center mb-6">
                <Activity className="h-6 w-6 text-[#FF5733]" />
                <span className="ml-2 text-xl font-bold">Ehrgeizig</span>
              </div>
              <p className="text-sm text-[#b3b3b3]">Track your fitness journey with precision and purpose.</p>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">App</h3>
              <ul className="space-y-2 text-sm text-[#b3b3b3]">
                <li><Link href="/features" className="hover:text-[#FF5733]">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-[#FF5733]">Pricing</Link></li>
                <li><Link href="/about" className="hover:text-[#FF5733]">About Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-[#b3b3b3]">
                <li><Link href="/help" className="hover:text-[#FF5733]">Help Center</Link></li>
                <li><Link href="/privacy" className="hover:text-[#FF5733]">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-[#FF5733]">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Connect</h3>
              <ul className="space-y-2 text-sm text-[#b3b3b3]">
                <li><Link href="mailto:contact@ehrgeizig.app" className="hover:text-[#FF5733]">Contact Us</Link></li>
                <li><Link href="https://twitter.com/ehrgeizigapp" className="hover:text-[#FF5733]">Twitter</Link></li>
                <li><Link href="https://instagram.com/ehrgeizigapp" className="hover:text-[#FF5733]">Instagram</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-[#404040] flex flex-col md:flex-row items-center justify-between text-sm text-[#b3b3b3]">
            <div>
              © {new Date().getFullYear()} Ehrgeizig Fitness App. All rights reserved.
            </div>
            <div className="mt-4 md:mt-0">
              Made with passion for fitness enthusiasts
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
