import { useState } from 'react'

export default function DevSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

  // Resolve target url dynamically based on environment
  const targetUrl = isLocalhost 
    ? 'http://localhost:5173'
    : window.location.origin.includes('admin') 
      ? window.location.origin.replace('admin', 'customer') // e.g. vercel apps
      : '/' // fallback to root context

  return (
    <div className="fixed bottom-4 right-4 z-[9999] font-sans">
      <div 
        className={`flex items-center gap-3 bg-stone-900/90 backdrop-blur-md border border-stone-800 text-white p-2.5 rounded-full shadow-2xl transition-all duration-300 ${
          isOpen ? 'pr-4 pl-3.5 rounded-2xl' : 'w-11 h-11 justify-center'
        }`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {/* Active pulse status dot */}
        <div className="relative flex h-3.5 w-3.5 items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-450 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </div>

        {isOpen && (
          <div className="flex items-center gap-3 animate-fade-in whitespace-nowrap text-xs font-semibold tracking-wide">
            <span className="text-stone-400">Dev Preview</span>
            <div className="h-3 w-px bg-stone-750" />
            <a 
              href={targetUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1D63FF] hover:bg-[#1D63FF]/90 rounded-lg text-white font-bold transition-colors shadow-sm duration-200"
            >
              Open Customer Site
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
            </a>
          </div>
        )}

        {!isOpen && (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-[#1D63FF]" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>
    </div>
  )
}
