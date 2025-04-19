import React from 'react';
import Link from 'next/link';

export default function WorkoutHistoryPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
            <div className="max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-24 w-24 mx-auto text-gray-400 mb-4" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                    />
                </svg>
                
                <h1 className="text-2xl font-bold text-gray-800 mb-3">Coming Soon!</h1>
                
                <p className="text-gray-600 mb-6">
                    The Workout History feature is currently under development and will be available in a future update.
                    We're working hard to bring you comprehensive workout tracking and analysis.
                </p>
                
                <div className="bg-blue-50 p-4 rounded-md mb-6">
                    <p className="text-sm text-blue-700">
                        You'll soon be able to view all your past workouts, track your progress, and analyze your performance trends.
                    </p>
                </div>
                
                <Link 
                    href="/user_settings/training_split_settings" 
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 mr-2" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                    >
                        <path 
                            fillRule="evenodd" 
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" 
                            clipRule="evenodd" 
                        />
                    </svg>
                    Back to Settings
                </Link>
            </div>
        </div>
    );
}