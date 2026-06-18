import { useState, useEffect, useRef } from 'react'
import BookingsPage from './components/BookingsPage'
import ClientsPage from './components/ClientsPage'
import PackagesPage from './components/PackagesPage'
import ReportsPage from './components/ReportsPage'
import SettingsPage from './components/SettingsPage'
import logo from './assets/logo.png'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE_URL = `${API_URL}/api`;

const initialClients = []

const initialPackages = []

const initialSettings = {
  defaultMarkup: 15,
  defaultAgentSplit: 40,
  agencyName: '',
  agencyAddress: '',
  agencyPhone: '',
  agencyEmail: '',
  permissions: null,
  apis: null
}

const initialBookings = []

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Interactive Feature States
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [agentStatus, setAgentStatus] = useState('Online')
  const [notificationsList, setNotificationsList] = useState([])
  const [selectedClientIdForCRM, setSelectedClientIdForCRM] = useState(null)


  // Lifted and Persisted States (Local state updated dynamically, synced with Database)
  const [clients, rawSetClients] = useState(initialClients)
  const [packages, rawSetPackages] = useState(initialPackages)
  const [settings, rawSetSettings] = useState(initialSettings)
  const [bookings, rawSetBookings] = useState(initialBookings)

  // Use refs to avoid closure staleness during async API updates
  const clientsRef = useRef(clients)
  const packagesRef = useRef(packages)
  const bookingsRef = useRef(bookings)
  const settingsRef = useRef(settings)

  // Holds the in-flight PUT controller so a fresh settings change cancels the prior one
  const settingsAbortRef = useRef(null)
  // Pending settings payload + timer id for debounced PUT
  const settingsDebounceRef = useRef({ timeoutId: null, pending: null })

  useEffect(() => { clientsRef.current = clients }, [clients])
  useEffect(() => { packagesRef.current = packages }, [packages])
  useEffect(() => { bookingsRef.current = bookings }, [bookings])
  useEffect(() => { settingsRef.current = settings }, [settings])

  // Load from backend on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const clientsRes = await fetch(`${API_BASE_URL}/clients`)
        if (clientsRes.ok) rawSetClients(await clientsRes.json())

        const packagesRes = await fetch(`${API_BASE_URL}/packages`)
        if (packagesRes.ok) rawSetPackages(await packagesRes.json())

        const bookingsRes = await fetch(`${API_BASE_URL}/bookings`)
        if (bookingsRes.ok) rawSetBookings(await bookingsRes.json())

        const settingsRes = await fetch(`${API_BASE_URL}/settings`)
        if (settingsRes.ok) rawSetSettings(await settingsRes.json())
      } catch (err) {
        console.warn('API connection failed, falling back to initial data/mocks:', err)
      }
    }
    loadData()
  }, [])

  // Sync wrappers to perform API operations in background
  const setClients = async (newVal) => {
    const current = clientsRef.current
    const resolved = typeof newVal === 'function' ? newVal(current) : newVal
    rawSetClients(resolved)

    try {
      if (resolved.length > current.length) {
        const added = resolved.find(item => !current.some(c => c.id === item.id))
        if (added) {
          await fetch(`${API_BASE_URL}/clients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(added)
          })
        }
      } else if (resolved.length < current.length) {
        const deleted = current.find(item => !resolved.some(r => r.id === item.id))
        if (deleted) {
          await fetch(`${API_BASE_URL}/clients/${deleted.id}`, { method: 'DELETE' })
        }
      } else {
        for (const item of resolved) {
          const original = current.find(c => c.id === item.id)
          if (original && JSON.stringify(original) !== JSON.stringify(item)) {
            await fetch(`${API_BASE_URL}/clients/${item.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item)
            })
          }
        }
      }
    } catch (err) {
      console.error('Failed to sync clients to backend:', err)
    }
  }

  const setPackages = async (newVal) => {
    const current = packagesRef.current
    const resolved = typeof newVal === 'function' ? newVal(current) : newVal
    rawSetPackages(resolved)

    try {
      if (resolved.length > current.length) {
        const added = resolved.find(item => !current.some(p => p.id === item.id))
        if (added) {
          await fetch(`${API_BASE_URL}/packages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(added)
          })
        }
      } else if (resolved.length < current.length) {
        const deleted = current.find(item => !resolved.some(r => r.id === item.id))
        if (deleted) {
          await fetch(`${API_BASE_URL}/packages/${deleted.id}`, { method: 'DELETE' })
        }
      } else {
        for (const item of resolved) {
          const original = current.find(p => p.id === item.id)
          if (original && JSON.stringify(original) !== JSON.stringify(item)) {
            await fetch(`${API_BASE_URL}/packages/${item.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item)
            })
          }
        }
      }
    } catch (err) {
      console.error('Failed to sync packages to backend:', err)
    }
  }

  const setBookings = async (newVal) => {
    const current = bookingsRef.current
    const resolved = typeof newVal === 'function' ? newVal(current) : newVal
    rawSetBookings(resolved)

    try {
      if (resolved.length > current.length) {
        const added = resolved.find(item => !current.some(b => b.id === item.id))
        if (added) {
          await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(added)
          })
        }
      } else if (resolved.length < current.length) {
        const deleted = current.find(item => !resolved.some(r => r.id === item.id))
        if (deleted) {
          await fetch(`${API_BASE_URL}/bookings/${deleted.id}`, { method: 'DELETE' })
        }
      } else {
        for (const item of resolved) {
          const original = current.find(b => b.id === item.id)
          if (original && JSON.stringify(original) !== JSON.stringify(item)) {
            await fetch(`${API_BASE_URL}/bookings/${item.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item)
            })
          }
        }
      }
    } catch (err) {
      console.error('Failed to sync bookings to backend:', err)
    }
  }

  const setSettings = async (newVal) => {
    const current = settingsRef.current
    const resolved = typeof newVal === 'function' ? newVal(current) : newVal
    rawSetSettings(resolved)

    // Debounce: hold the latest payload, cancel any in-flight + scheduled PUT
    settingsDebounceRef.current.pending = resolved
    if (settingsDebounceRef.current.timeoutId) {
      clearTimeout(settingsDebounceRef.current.timeoutId)
    }
    if (settingsAbortRef.current) {
      settingsAbortRef.current.abort()
    }
    settingsDebounceRef.current.timeoutId = setTimeout(async () => {
      const payload = settingsDebounceRef.current.pending
      settingsDebounceRef.current.pending = null
      settingsDebounceRef.current.timeoutId = null
      const controller = new AbortController()
      settingsAbortRef.current = controller
      try {
        const res = await fetch(`${API_BASE_URL}/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        })
        if (!res.ok) {
          console.error(`Failed to sync settings: backend returned ${res.status}`)
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Failed to sync settings to backend:', err)
        }
      } finally {
        if (settingsAbortRef.current === controller) {
          settingsAbortRef.current = null
        }
      }
    }, 250)
  }

  const addNotification = (text, type = 'system') => {
    const newNotif = {
      id: Date.now(),
      text,
      time: 'Just now',
      unread: true,
      type
    }
    setNotificationsList(prev => [newNotif, ...prev])
  }

  // Dynamic Dashboard Stats Calculations — Indian Tier-2 travel agency
  const parseAmt = (b) => parseFloat((b.amount || '').replace(/[^0-9.-]+/g, '')) || 0
  const parseDate = (b) => {
    // b.date is now the formatted "Jun 25, 2026" string from mapBookingToFrontend
    if (!b.date) return null
    const parsed = Date.parse(b.date)
    if (!isNaN(parsed)) return new Date(parsed)
    // Fallback for "Jun 25, 2026" — V8 rejects this, parse manually
    const months = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 }
    const parts = b.date.replace(/,/g, '').split(/\s+/)
    if (parts.length === 3 && months[parts[0].toLowerCase()] !== undefined) {
      return new Date(Date.UTC(parseInt(parts[2]), months[parts[0].toLowerCase()], parseInt(parts[1])))
    }
    return null
  }

  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const fourteenDaysOut = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const thisMonthBookings = bookings.filter(b => {
    const d = parseDate(b)
    return d && d >= startOfThisMonth
  })
  const lastMonthBookings = bookings.filter(b => {
    const d = parseDate(b)
    return d && d >= startOfLastMonth && d < startOfThisMonth
  })

  const thisMonthRevenue = thisMonthBookings.reduce((s, b) => s + parseAmt(b), 0)
  const lastMonthRevenue = lastMonthBookings.reduce((s, b) => s + parseAmt(b), 0)
  const monthOverMonth = lastMonthRevenue > 0
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    : null

  const outstandingRevenue = bookings
    .filter(b => (b.status || 'Pending') !== 'Paid')
    .reduce((s, b) => s + parseAmt(b), 0)

  const upcomingDepartures = bookings
    .filter(b => {
      const d = parseDate(b)
      return d && d >= now && d <= fourteenDaysOut
    })
    .sort((a, b) => parseDate(a) - parseDate(b))

  const avgBookingValue = bookings.length > 0
    ? bookings.reduce((s, b) => s + parseAmt(b), 0) / bookings.length
    : 0

  const newClientsThisMonth = clients.filter(c => {
    if (!c.lastContact) return false
    const d = new Date(c.lastContact)
    return !isNaN(d) && d >= startOfThisMonth
  }).length

  const pendingFollowUps = clients.filter(c => {
    if (!c.lastContact) return true
    const d = new Date(c.lastContact)
    return !isNaN(d) && d < sevenDaysAgo
  })

  const formatINRCompact = (n) => {
    if (!n || n <= 0) return '₹0'
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`
    return `₹${n.toLocaleString('en-IN')}`
  }

  // Rolling 6-month revenue chart (replaces hardcoded Jan-Jun)
  const chartData = (() => {
    const result = []
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const monthBookings = bookings.filter(b => {
        const d = parseDate(b)
        return d && d >= start && d < end
      })
      const sum = monthBookings.reduce((s, b) => s + parseAmt(b), 0)
      result.push({
        month: start.toLocaleDateString('en-US', { month: 'short' }),
        revenue: sum / 1000,
        label: formatINRCompact(sum)
      })
    }
    return result
  })()
  const maxRevenueVal = Math.max(10, ...chartData.map(d => d.revenue))

  // Top destinations THIS MONTH (not all-time)
  const activeDestinations = (() => {
    const counts = new Map()
    thisMonthBookings.forEach(b => {
      if (!b.package) return
      counts.set(b.package, (counts.get(b.package) || 0) + 1)
    })
    const colors = [
      'bg-amber-100 text-amber-800',
      'bg-orange-100 text-orange-850 border-orange-200/40',
      'bg-yellow-100 text-yellow-800',
      'bg-emerald-100 text-emerald-800',
      'bg-rose-100 text-rose-800'
    ]
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count], idx) => ({
        name,
        count,
        trend: 'This Month',
        color: colors[idx % colors.length]
      }))
  })()

  const unreadCount = notificationsList.filter((n) => n.unread).length

  const markAllRead = () => {
    setNotificationsList(notificationsList.map((n) => ({ ...n, unread: false })))
  }

  const toggleRead = (id) => {
    setNotificationsList(
      notificationsList.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    )
  }

  const deleteNotification = (id) => {
    setNotificationsList(notificationsList.filter((n) => n.id !== id))
  }

  const filteredBookings = bookings.filter(
    (b) =>
      b.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.package.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'Online':
        return 'bg-emerald-500'
      case 'Away':
        return 'bg-amber-500'
      case 'Offline':
        return 'bg-stone-400'
      default:
        return 'bg-stone-400'
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFCF7] text-stone-800 font-sans flex antialiased">
      {/* Mobile sidebar backdrop */}
      <div
        className={`sidebar-backdrop ${sidebarOpen ? 'open' : ''} lg:hidden`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar-mobile ${sidebarOpen ? 'open' : ''} w-64 bg-[#FAF9F5] border-r border-stone-200/60 flex flex-col justify-between shrink-0 lg:relative lg:translate-x-0`}>
        <div>
          {/* Logo */}
          <div className="p-6 flex items-center gap-3 border-b border-stone-200/50">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-sm border border-stone-200 bg-white">
              <img src={logo} alt="KRAFT YOUR TRIP Logo" className="w-full h-full object-contain p-0.5" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-stone-900 uppercase">
                KRAFT YOUR TRIP
              </h1>
              <span className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider">
                Agency Portal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z' },
              { id: 'bookings', label: 'Bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
              { id: 'clients', label: 'Clients', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
              { id: 'packages', label: 'Packages', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
              { id: 'reports', label: 'Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
              { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => { setActiveTab(link.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group text-left ${
                  activeTab === link.id
                    ? 'bg-amber-500/10 text-amber-700 font-semibold'
                    : 'text-stone-500 hover:bg-stone-200/30 hover:text-stone-800'
                }`}
              >
                <svg
                  className={`w-4.5 h-4.5 transition-transform duration-300 group-hover:scale-105 ${
                    activeTab === link.id ? 'text-amber-600' : 'text-stone-400 group-hover:text-stone-600'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                </svg>
                <span className="text-sm">{link.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Footer Brand Info */}
        <div className="p-5 border-t border-stone-200/50 text-center">
          <p className="text-[10px] text-stone-400 font-medium">KRAFT YOUR TRIP Admin v1.4</p>
          <p className="text-[9px] text-stone-400/80 mt-0.5">© 2026 KRAFT YOUR TRIP Inc.</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="h-16 sm:h-20 border-b border-stone-200/50 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 bg-[#FDFCF7]/80 backdrop-blur-md sticky top-0 z-20 gap-3">
          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 -ml-1 rounded-xl text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-all shrink-0"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Search bar */}
          <div className="relative flex-1 max-w-96">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="h-4.5 w-4.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search bookings, clients, packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-stone-200 focus:border-amber-500 rounded-xl py-2.5 pl-11 pr-4 text-xs text-stone-850 placeholder-stone-400 outline-none focus:ring-1 focus:ring-amber-500 transition-all duration-300"
            />
          </div>

          {/* Interactive User & Notification Controls */}
          <div className="flex items-center gap-5 relative">
            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  setShowProfile(false)
                }}
                className={`relative p-2 bg-white border border-stone-200 rounded-xl transition-all duration-300 shadow-sm ${
                  showNotifications ? 'text-amber-700 bg-amber-50 border-amber-300' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
                }`}
                title="Notifications"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-amber-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Card */}
              {showNotifications && (
                <div className="absolute right-0 mt-3.5 w-80 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                    <h5 className="font-bold text-stone-900 text-xs">Recent Updates</h5>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[10px] text-amber-700 hover:text-amber-600 font-bold"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-stone-50 max-h-64 overflow-y-auto">
                    {notificationsList.length > 0 ? (
                      notificationsList.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 flex gap-3 transition-colors duration-200 ${
                            notif.unread ? 'bg-amber-50/20' : 'hover:bg-stone-50/50'
                          }`}
                        >
                          <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-[11px] leading-relaxed ${notif.unread ? 'font-semibold text-stone-900' : 'text-stone-600'}`}>
                                {notif.text}
                              </p>
                              {notif.unread && (
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0 mt-1"></span>
                              )}
                            </div>
                            <div className="flex items-center justify-between pt-1 text-[9px] text-stone-400">
                              <span>{notif.time}</span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleRead(notif.id)}
                                  className="text-stone-500 hover:text-stone-800"
                                >
                                  {notif.unread ? 'Mark read' : 'Mark unread'}
                                </button>
                                <span>•</span>
                                <button
                                  onClick={() => deleteNotification(notif.id)}
                                  className="text-stone-400 hover:text-red-600 font-medium"
                                >
                                  Clear
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-stone-400 text-xs">
                        No notifications to display.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown Toggle */}
            <div className="flex items-center gap-3 border-l border-stone-200 pl-5 relative">
              <button
                onClick={() => {
                  setShowProfile(!showProfile)
                  setShowNotifications(false)
                }}
                className="flex items-center gap-2.5 text-left group focus:outline-none"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 p-[1.5px] shadow-sm relative">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                    alt="User Avatar"
                    className="w-full h-full object-cover rounded-[10px]"
                  />
                  {/* Realtime Status Indicator dot */}
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(agentStatus)} shadow`}></span>
                </div>
                <div className="hidden md:block">
                  <h4 className="text-xs font-semibold text-stone-900 leading-tight group-hover:text-amber-700 transition-colors duration-200">
                    Seraphina Moon
                  </h4>
                  <span className="text-[10px] text-stone-400 font-medium">{agentStatus}</span>
                </div>
                <svg className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600 transition-colors duration-200 hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown Card */}
              {showProfile && (
                <div className="absolute right-0 top-full mt-3.5 w-72 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 p-5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Expanded Profile Info */}
                  <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 p-[2px] shadow-sm relative">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                        alt="User Avatar"
                        className="w-full h-full object-cover rounded-[10px]"
                      />
                    </div>
                    <div>
                      <h5 className="font-bold text-stone-900 text-sm leading-tight">Seraphina Moon</h5>
                      <p className="text-[10px] text-stone-400 font-semibold mb-0.5">seraphina.moon@kraftyourtrip.com</p>
                      <span className="bg-amber-500/10 text-amber-700 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border border-amber-500/10">
                        Agency Manager
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Status Toggle */}
                  <div className="py-4 border-b border-stone-100 space-y-2">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Set Status</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['Online', 'Away', 'Offline'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setAgentStatus(status)}
                          className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all duration-300 flex items-center justify-center gap-1.5 ${
                            agentStatus === status
                              ? 'bg-amber-500/10 border-amber-300 text-amber-750'
                              : 'bg-stone-50/50 border-stone-200 text-stone-500 hover:bg-stone-50'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(status)}`}></span>
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions Links */}
                  <div className="pt-3 space-y-1">
                    {[
                      { label: 'Account Settings', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
                      { label: 'Commission Wallet', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
                      { label: 'Sign Out', icon: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1', textClass: 'text-rose-600 hover:bg-rose-50' },
                    ].map((act, idx) => (
                      <button
                        key={idx}
                        className={`w-full py-2 px-3 rounded-lg text-[11px] font-semibold text-left transition-colors duration-200 flex items-center gap-2.5 ${
                          act.textClass ? act.textClass : 'text-stone-600 hover:bg-stone-100/50'
                        }`}
                      >
                        <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={act.icon} />
                        </svg>
                        {act.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Render Block based on activeTab */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 flex-1 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          {activeTab === 'dashboard' && (
            <>
              {/* Quick Statistics Grid — Indian Tier-2 travel agency */}
              <section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5">
                {[
                  {
                    label: 'This Month Revenue',
                    value: formatINRCompact(thisMonthRevenue),
                    sub: monthOverMonth === null
                      ? 'No data last month'
                      : `${monthOverMonth >= 0 ? '+' : ''}${monthOverMonth.toFixed(1)}% vs last month`,
                    subTone: monthOverMonth === null ? 'neutral' : monthOverMonth >= 0 ? 'good' : 'bad',
                    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                    color: 'bg-amber-50 text-amber-700 border-amber-250/20'
                  },
                  {
                    label: 'Active Bookings',
                    value: bookings.filter(b => (b.status || 'Pending') !== 'Cancelled').length.toString(),
                    sub: `${bookings.filter(b => b.status === 'Pending').length} pending`,
                    subTone: 'neutral',
                    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                    color: 'bg-orange-50 text-orange-700 border-orange-250/20'
                  },
                  {
                    label: 'Outstanding Payments',
                    value: formatINRCompact(outstandingRevenue),
                    sub: 'Awaiting collection',
                    subTone: 'bad',
                    icon: 'M3 10h18M5 14h14M5 18h14M5 6h14',
                    color: 'bg-rose-50 text-rose-700 border-rose-250/20'
                  },
                  {
                    label: 'Departures (14d)',
                    value: upcomingDepartures.length.toString(),
                    sub: upcomingDepartures.length > 0 ? 'Next stop: this week' : 'No upcoming trips',
                    subTone: upcomingDepartures.length > 0 ? 'good' : 'neutral',
                    icon: 'M3 12l2-2m0 0l7-7 7 7m-9 2v8a2 2 0 002 2h2a2 2 0 002-2v-8m-6 0h6',
                    color: 'bg-emerald-50 text-emerald-700 border-emerald-250/20'
                  },
                  {
                    label: 'Avg Booking Value',
                    value: formatINRCompact(avgBookingValue),
                    sub: `${bookings.length} total bookings`,
                    subTone: 'neutral',
                    icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
                    color: 'bg-blue-50 text-blue-700 border-blue-250/20'
                  },
                  {
                    label: 'New Clients (Month)',
                    value: newClientsThisMonth.toString(),
                    sub: `${clients.length} total profiles`,
                    subTone: 'neutral',
                    icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0M3 20a6 6 0 0112 0v1H3v-1z',
                    color: 'bg-stone-100 text-stone-700 border-stone-250/20'
                  }
                ].map((stat, i) => (
                  <div key={i} className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-5 hover:border-stone-300 transition-all duration-300 shadow-sm relative group overflow-hidden">
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <span className="text-xs font-semibold text-stone-500 group-hover:text-stone-700 transition-colors duration-300 leading-tight">
                        {stat.label}
                      </span>
                      <div className={`w-8.5 h-8.5 rounded-lg ${stat.color} flex items-center justify-center shadow-sm border border-stone-200/20 shrink-0`}>
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 mb-1 tracking-tight">
                      {stat.value}
                    </h3>
                    <p className={`text-[10px] font-medium leading-normal ${
                      stat.subTone === 'good' ? 'text-emerald-600' :
                      stat.subTone === 'bad'  ? 'text-rose-600' :
                                               'text-stone-400'
                    }`}>
                      {stat.sub}
                    </p>
                  </div>
                ))}
              </section>

              {/* Bookings & Analytics Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Left: Bookings Table & Analytics (2 cols) */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Bookings List */}
                  <section className="bg-white border border-stone-200/80 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-stone-200/50 flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-stone-900 tracking-tight">
                          Recent Bookings
                        </h3>
                        <p className="text-xs text-stone-400">
                          Live status of client package bookings and invoices.
                        </p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('bookings')}
                        className="text-xs text-amber-700 hover:text-amber-600 font-bold cursor-pointer"
                      >
                        View All
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-stone-50/50 border-b border-stone-200/50 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                            <th className="py-3 px-6">ID</th>
                            <th className="py-3 px-6">Client</th>
                            <th className="py-3 px-6">Package</th>
                            <th className="py-3 px-6">Amount</th>
                            <th className="py-3 px-6">Departure</th>
                            <th className="py-3 px-6 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {filteredBookings.length > 0 ? (
                            filteredBookings.slice(0, 5).map((b) => (
                              <tr key={b.id} className="hover:bg-stone-50/30 transition-colors duration-200 text-xs">
                                <td className="py-3.5 px-6 font-mono text-[11px] text-stone-500">{b.id}</td>
                                <td className="py-3.5 px-6 font-semibold text-stone-900">{b.client}</td>
                                <td className="py-3.5 px-6 text-stone-600">{b.package}</td>
                                <td className="py-3.5 px-6 font-bold text-stone-850">{b.amount}</td>
                                <td className="py-3.5 px-6 text-stone-500">{b.date}</td>
                                <td className="py-3.5 px-6 text-right">
                                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                    b.status === 'Paid'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/40'
                                      : 'bg-amber-50 text-amber-700 border-amber-200/40'
                                  }`}>
                                    {b.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="py-8 text-center text-stone-400">
                                No bookings match the search criteria.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* Monthly Revenue Chart */}
                  <section className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-stone-900 tracking-tight">
                        Monthly Revenue Distribution
                      </h3>
                      <p className="text-xs text-stone-400">
                        Gross monthly bookings (INR) — rolling 6-month view.
                      </p>
                    </div>

                    {/* Minimal CSS Bar Chart */}
                    <div className="flex items-end justify-between h-36 sm:h-48 pt-4 px-1 sm:px-2 border-b border-stone-100">
                      {chartData.map((data, idx) => (
                        <div key={idx} className="flex flex-col items-center flex-1 group">
                           {/* Hover Tooltip */}
                          <span className="opacity-0 group-hover:opacity-100 bg-stone-900 text-white text-[9px] font-bold px-2 py-0.5 rounded mb-2 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 shadow">
                            {data.label}
                          </span>
                          {/* Bar */}
                          <div
                            style={{ height: `${Math.min(100, (data.revenue / maxRevenueVal) * 100)}%` }}
                            className="w-6 sm:w-10 bg-amber-500/20 group-hover:bg-amber-500 rounded-t-md transition-all duration-500 ease-out shadow-sm border border-transparent group-hover:border-amber-600/10"
                          ></div>
                          {/* Month Label */}
                          <span className="text-[10px] text-stone-400 group-hover:text-stone-700 font-medium mt-3 transition-colors duration-300">
                            {data.month}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Right Column: Destination Hub & Actions (1 col) */}
                <div className="space-y-8">
                  {/* Destination Hotspots */}
                  <section className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm space-y-5">
                    <div>
                      <h3 className="text-base font-bold text-stone-900 tracking-tight">
                        Destination Activity
                      </h3>
                      <p className="text-xs text-stone-400">
                        Count of active travelers currently in transit.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {activeDestinations.map((dest, i) => (
                        <div key={i} className="flex items-center justify-between p-3.5 bg-[#FAF9F5]/40 rounded-xl border border-stone-200/30">
                          <div>
                            <h4 className="text-xs font-bold text-stone-900">{dest.name}</h4>
                            <span className="text-[10px] text-stone-400">{dest.trend}</span>
                          </div>
                          <span className={`text-xs font-bold px-3 py-1 rounded-lg ${dest.color} border border-stone-200/10 shadow-inner`}>
                            {dest.count} Travelers
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Pending Follow-ups Panel */}
                  <section className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-stone-900 tracking-tight">
                          Pending Follow-ups
                        </h3>
                        <p className="text-xs text-stone-400">
                          Clients not contacted in the last 7 days.
                        </p>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-250/20">
                        {pendingFollowUps.length}
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                      {pendingFollowUps.length === 0 ? (
                        <p className="text-xs text-stone-400 italic text-center py-6">
                          All clients are up to date!
                        </p>
                      ) : (
                        pendingFollowUps.map((client, i) => {
                          const days = client.lastContact 
                            ? Math.floor((now.getTime() - new Date(client.lastContact).getTime()) / (1000 * 60 * 60 * 24))
                            : null;
                          const contactText = days === null 
                            ? 'Never contacted' 
                            : `${days} days ago`;
                          return (
                            <div key={i} className="flex items-center justify-between p-3.5 bg-[#FAF9F5]/40 rounded-xl border border-stone-200/30">
                              <div className="min-w-0 flex-1 mr-2">
                                <h4 className="text-xs font-bold text-stone-900 truncate">{client.name}</h4>
                                <span className="text-[10px] text-stone-400">
                                  {contactText}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedClientIdForCRM(client.id)
                                  setActiveTab('clients')
                                }}
                                className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer"
                              >
                                Follow Up
                              </button>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </section>

                  {/* Quick Actions Panel */}
                  <section className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-stone-900 tracking-tight">
                        Agency Actions
                      </h3>
                      <p className="text-xs text-stone-400">
                        Quick operations for managing listings.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <button 
                        onClick={() => setActiveTab('bookings')}
                        className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-sm active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        New Client Booking
                      </button>
                      <button 
                        onClick={() => setActiveTab('reports')}
                        className="w-full py-2.5 px-4 bg-white hover:bg-stone-50 border border-stone-250/70 text-stone-700 rounded-xl text-xs font-bold shadow-sm active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <svg className="w-4.5 h-4.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export Revenue Report
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            </>
          )}

          {activeTab === 'bookings' && (
            <BookingsPage 
              bookings={bookings} 
              setBookings={setBookings} 
              clients={clients}
              setClients={setClients}
              packages={packages}
              setPackages={setPackages}
              settings={settings}
              addNotification={addNotification}
            />
          )}

          {activeTab === 'clients' && (
            <ClientsPage 
              clients={clients}
              setClients={setClients}
              bookings={bookings}
              addNotification={addNotification}
              initialSelectedClientId={selectedClientIdForCRM}
              onSelectClient={setSelectedClientIdForCRM}
            />
          )}

          {activeTab === 'packages' && (
            <PackagesPage 
              packages={packages}
              setPackages={setPackages}
              clients={clients}
              bookings={bookings}
              setBookings={setBookings}
              settings={settings}
              addNotification={addNotification}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsPage 
              bookings={bookings}
              packages={packages}
              clients={clients}
              settings={settings}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage 
              settings={settings}
              setSettings={setSettings}
              addNotification={addNotification}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default App
