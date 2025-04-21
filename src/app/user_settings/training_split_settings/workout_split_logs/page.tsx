import React from 'react';
import Link from 'next/link';

export default function WorkoutSplitLogsPage() {
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                </svg>
                
                <h1 className="text-2xl font-bold text-gray-800 mb-3">Coming Soon!</h1>
                
                <p className="text-gray-600 mb-6">
                    The Workout Split Logs feature is currently under development and will be available in a future update.
                    We&apos;re working hard to bring you detailed logging and tracking for your training splits.
                </p>
                
                <div className="bg-blue-50 p-4 rounded-md mb-6">
                    <p className="text-sm text-blue-700">
                        You&apos;ll soon be able to view historical data for each of your training splits and track your adherence to your workout plans.
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