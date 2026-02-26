import React from 'react'

export default function LoadingSpinner({ size = 'md', text = '' }) {
    const sizeMap = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-2',
        lg: 'w-12 h-12 border-4',
    }
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-10">
            <div
                className={`${sizeMap[size]} rounded-full border-gray-700 border-t-indigo-500 animate-spin`}
            />
            {text && <p className="text-gray-400 text-sm">{text}</p>}
        </div>
    )
}
