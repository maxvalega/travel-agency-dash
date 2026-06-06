import { useState, useEffect } from 'react'
import BookingsPage from './components/BookingsPage'
import ClientsPage from './components/ClientsPage'
import PackagesPage from './components/PackagesPage'
import ReportsPage from './components/ReportsPage'
import SettingsPage from './components/SettingsPage'
import logo from './assets/logo.png'
import DevSwitcher from './components/DevSwitcher'

const initialClients = [
  { 
    id: 'C-001', 
    name: 'Sophia Loren', 
    email: 'sophia@loren.com', 
    phone: '+1 (555) 019-2831', 
    status: 'Active', 
    tier: 'Platinum', 
    historicalLtv: 19700, 
    historicalBookingsCount: 3, 
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', 
    preferences: { airline: 'Singapore Airlines', seat: 'Window', room: 'Suite / High Floor', dietary: 'None' }, 
    passport: { number: 'US9827361', expires: '2026-11-20', status: 'Expiring Soon' }, 
    visa: { country: 'Japan', expires: '2027-04-12', class: 'Tourist' },
    emergencyContact: { name: 'Carlo Ponti Jr.', phone: '+1 (555) 019-8800', relation: 'Son' },
    walletBalance: '$450.00',
    notes: 'Loves boutique ryokans and traditional gardens. Prefers morning flights to avoid late check-ins.',
    lastContact: '2026-06-02',
    logs: [
      { time: '2026-06-02 14:32', text: 'Call logs: Confirmed Swiss flight voucher' },
      { time: '2026-05-28 09:15', text: 'Email: Prefers Kyoto over Osaka' }
    ]
  },
  { 
    id: 'C-002', 
    name: 'Liam Neeson', 
    email: 'liam@neeson.com', 
    phone: '+1 (555) 014-9928', 
    status: 'Active', 
    tier: 'Gold', 
    historicalLtv: 14500, 
    historicalBookingsCount: 2, 
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80', 
    preferences: { airline: 'Swiss International', seat: 'Aisle', room: 'Deluxe King', dietary: 'Gluten-Free' }, 
    passport: { number: 'IE7721832', expires: '2029-05-14', status: 'Valid' }, 
    visa: { country: 'Switzerland', expires: '2030-08-20', class: 'Schengen' },
    emergencyContact: { name: 'Micheál Richardson', phone: '+1 (555) 014-0011', relation: 'Son' },
    walletBalance: '$1,200.00',
    notes: 'Requires physical training guidelines for hiking packages. Prefers high altitude lodges.',
    lastContact: '2026-05-29',
    logs: [
      { time: '2026-05-29 11:22', text: 'Text: Checked details for Alps hike' },
      { time: '2026-05-24 16:45', text: 'Call logs: Inquired about flight upgrades' }
    ]
  },
  { 
    id: 'C-003', 
    name: 'Dr. Evans', 
    email: 'dr.evans@medical.org', 
    phone: '+44 20 7946 0912', 
    status: 'Active', 
    tier: 'Platinum', 
    historicalLtv: 29100, 
    historicalBookingsCount: 5, 
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80', 
    preferences: { airline: 'Emirates', seat: 'Window', room: 'Water Villa', dietary: 'Vegetarian' }, 
    passport: { number: 'GB4482910', expires: '2026-07-08', status: 'Expiring Soon' }, 
    visa: { country: 'Maldives', expires: 'On Arrival', class: 'Tourist' },
    emergencyContact: { name: 'Sarah Evans', phone: '+44 20 7946 0888', relation: 'Spouse' },
    walletBalance: '$0.00',
    notes: 'Anniversary celebration trip. High privacy requested. Prefers overwater villas away from main docks.',
    lastContact: '2026-06-03',
    logs: [
      { time: '2026-06-03 10:14', text: 'Email: Confirmed Maldivian VIP speedboat transfer' },
      { time: '2026-05-15 11:00', text: 'System: Anniversary voucher sent' }
    ]
  },
  { 
    id: 'C-004', 
    name: 'Tanaka Corp Group', 
    email: 'travel@tanaka.co.jp', 
    phone: '+81 3 5555 0123', 
    status: 'Active', 
    tier: 'Corporate', 
    historicalLtv: 69500, 
    historicalBookingsCount: 7, 
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80', 
    preferences: { airline: 'Japan Airlines', seat: 'Aisle', room: 'Executive Twin', dietary: 'None' }, 
    passport: { number: 'JP1192837', expires: '2031-10-12', status: 'Valid' }, 
    visa: { country: 'United States', expires: '2028-11-05', class: 'B1/B2' },
    emergencyContact: { name: 'Kenji Tanaka', phone: '+81 3 5555 0199', relation: 'HR Manager' },
    walletBalance: '$5,400.00',
    notes: 'Corporate travel coordinator. Fast invoicing critical. Prefers business hotels with conference centers.',
    lastContact: '2026-06-01',
    logs: [
      { time: '2026-06-01 09:00', text: 'System: Auto-invoiced executive stay' },
      { time: '2026-05-20 13:40', text: 'Email: Corporate budget revision submitted' }
    ]
  },
  { 
    id: 'C-005', 
    name: 'The Baker Family', 
    email: 'bakers@bakerfam.net', 
    phone: '+1 (555) 017-8833', 
    status: 'Active', 
    tier: 'Silver', 
    historicalLtv: 5000, 
    historicalBookingsCount: 1, 
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', 
    preferences: { airline: 'Lufthansa', seat: 'Adjacent', room: 'Family Suite', dietary: 'Nut Allergy' }, 
    passport: { number: 'US5543219', expires: '2028-02-18', status: 'Valid' }, 
    visa: { country: 'Switzerland', expires: '2028-04-30', class: 'Schengen' },
    emergencyContact: { name: 'Robert Baker Sr.', phone: '+1 (555) 017-9911', relation: 'Grandfather' },
    walletBalance: '$150.00',
    notes: 'Traveling with children. Needs baby cot and connecting rooms. Severe peanut allergy caution.',
    lastContact: '2026-05-18',
    logs: [
      { time: '2026-05-18 15:10', text: 'Call logs: Discussed kids play area requirements' }
    ]
  }
]

const initialPackages = [
  { id: 'PKG-001', name: 'Kyoto Cultural Tour', duration: '7 Days', basePrice: 4800, region: 'Asia', slots: { booked: 18, total: 25 }, trend: '+4 this week', color: 'bg-amber-100 text-amber-800 border-amber-250', itinerary: [
    { day: 1, title: 'Arrival & Welcome Tea Ceremony', desc: 'Transfer from Kansai Airport via private towncar to Ryokan Kurama. Evening welcome ceremony and Kaiseki dinner.' },
    { day: 2, title: 'Historic Higashiyama District Guided Walk', desc: 'Guided stroll through preserved streets. Visit Kiyomizu-dera Temple and participate in a pottery workshop.' },
    { day: 3, title: 'Golden Pavilion & Bamboo Groves', desc: 'Morning visit to Kinkaku-ji (Golden Pavilion), followed by private rickshaw ride through Arashiyama Bamboo Grove.' },
  ] },
  { id: 'PKG-002', name: 'Swiss Alps Luxury Hiking', duration: '9 Days', basePrice: 3700, region: 'Europe', slots: { booked: 12, total: 15 }, trend: 'Stable', color: 'bg-orange-100 text-orange-800 border-orange-250', itinerary: [
    { day: 1, title: 'Zurich Arrival & Helicopter to Zermatt', desc: 'Arrival at Zurich Airport. Scenic helicopter transfer to Zermatt. Check-in at Mont Cervin Palace.' },
    { day: 2, title: 'Gornergrat Cogwheel & Matterhorn Views', desc: 'Ride the famous cogwheel railway. Moderate acclimatization hike facing the Matterhorn with private alpine guide.' },
  ] },
  { id: 'PKG-003', name: 'Maldives Overwater Resort Stay', duration: '5 Days', basePrice: 9800, region: 'Asia', slots: { booked: 8, total: 10 }, trend: '+2 this week', color: 'bg-yellow-100 text-yellow-800 border-yellow-250', itinerary: [
    { day: 1, title: 'Male Speedboat Transfer to Resort', desc: 'Meet-and-greet at Male airport. Premium speedboat transfer to Soneva Jani. Overwater villa check-in.' },
  ] },
  { id: 'PKG-004', name: 'Tokyo Business Executive Package', duration: '4 Days', basePrice: 14500, region: 'Asia', slots: { booked: 15, total: 30 }, trend: '+1 this week', color: 'bg-stone-200 text-stone-800 border-stone-300', itinerary: [
    { day: 1, title: 'Shunjuku Penthouse & Business Lounge Access', desc: 'VIP airport assistance and premium executive sedan transfer to Park Hyatt Tokyo.' }
  ] },
  { id: 'PKG-005', name: 'Swiss Alps Family Stay', duration: '6 Days', basePrice: 7400, region: 'Europe', slots: { booked: 5, total: 12 }, trend: 'Stable', color: 'bg-orange-100 text-orange-850 border-orange-200', itinerary: [
    { day: 1, title: 'Geneva Arrival & Scenic Train to Grindelwald', desc: 'Scenic rail journey to Grindelwald. Dinner at traditional chalet.' }
  ] }
]

const initialSettings = {
  defaultMarkup: 15,
  defaultAgentSplit: 40,
  agencyName: 'KRAFT YOUR TRIP',
  agencyAddress: '456 Sandstone Ave, Suite 100, San Francisco, CA',
  permissions: {
    admin: { viewFinancials: true, editPricing: true, supplierCreds: true, clientScans: true },
    manager: { viewFinancials: true, editPricing: true, supplierCreds: false, clientScans: true },
    agent: { viewFinancials: false, editPricing: false, supplierCreds: false, clientScans: true }
  },
  apis: {
    sabre: { connected: true, endpoint: 'https://api.sabre.com/v2/flights', key: '••••••••••••••••••••' },
    amadeus: { connected: false, endpoint: 'https://api.amadeus.com/v1/booking', key: '' },
    bedbank: { connected: true, endpoint: 'https://api.hotelbeds.com/hotel/v3', key: '••••••••••••••••••••' }
  }
}

const initialBookings = [
  { id: 'BK-9021', client: 'Sophia Loren', package: 'Kyoto Cultural Tour', amount: '$4,800', date: 'Jun 25, 2026', status: 'Paid', agent: 'Seraphina Moon' },
  { id: 'BK-8840', client: 'Liam Neeson', package: 'Swiss Alps Luxury Hiking', amount: '$3,700', date: 'Jul 12, 2026', status: 'Pending', agent: 'Lucas Sand' },
  { id: 'BK-7561', client: 'Dr. Evans', package: 'Maldives Overwater Resort Stay', amount: '$9,800', date: 'Jul 28, 2026', status: 'Paid', agent: 'Elena Stone' },
  { id: 'BK-6204', client: 'Tanaka Corp Group', package: 'Tokyo Business Executive Package', amount: '$14,500', date: 'Aug 05, 2026', status: 'Paid', agent: 'Daniel Gold' },
  { id: 'BK-5190', client: 'The Baker Family', package: 'Swiss Alps Family Stay', amount: '$7,400', date: 'Aug 18, 2026', status: 'Pending', agent: 'Seraphina Moon' },
]

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Interactive Feature States
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [agentStatus, setAgentStatus] = useState('Online')
  const [notificationsList, setNotificationsList] = useState([
    { id: 1, text: 'New booking BK-9021 payment received from Sophia Loren', time: '10 min ago', unread: true, type: 'payment' },
    { id: 2, text: 'Pending deposit reminder for booking BK-8840 (Liam Neeson)', time: '2 hours ago', unread: true, type: 'reminder' },
    { id: 3, text: 'Dr. Evans requested invoice update for Maldives Overwater Resort Stay', time: '1 day ago', unread: false, type: 'request' },
  ])

  // Lifted and Persisted States
  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('v_clients')
    return saved ? JSON.parse(saved) : initialClients
  })

  const [packages, setPackages] = useState(() => {
    const saved = localStorage.getItem('v_packages')
    return saved ? JSON.parse(saved) : initialPackages
  })

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('v_settings')
    return saved ? JSON.parse(saved) : initialSettings
  })

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('v_bookings')
    return saved ? JSON.parse(saved) : initialBookings
  })

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('v_clients', JSON.stringify(clients))
  }, [clients])

  useEffect(() => {
    localStorage.setItem('v_packages', JSON.stringify(packages))
  }, [packages])

  useEffect(() => {
    localStorage.setItem('v_settings', JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    localStorage.setItem('v_bookings', JSON.stringify(bookings))
  }, [bookings])

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

  // Dynamic Dashboard Stats Calculations
  const historicalRevenue = 84300
  const currentRevenueSum = bookings.reduce((sum, b) => sum + parseFloat(b.amount.replace(/[^0-9.-]+/g, "") || 0), 0)
  const totalRevenue = historicalRevenue + currentRevenueSum
  const formattedGrossRevenue = `$${totalRevenue.toLocaleString()}`

  const historicalClientsCount = 179
  const totalClientsCount = historicalClientsCount + clients.length

  const yieldVal = (settings.defaultMarkup / (100 + settings.defaultMarkup)) * 100 * 1.242
  const formattedYield = `${yieldVal.toFixed(1)}%`

  const getMonthlyRevenue = (monthName, baseK) => {
    const monthBookings = bookings.filter(b => b.date.toLowerCase().includes(monthName.toLowerCase()))
    const sum = monthBookings.reduce((acc, b) => acc + parseFloat(b.amount.replace(/[^0-9.-]+/g, "") || 0), 0)
    const total = baseK * 1000 + sum
    return {
      month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      revenue: total / 1000,
      label: `$${(total / 1000).toFixed(1)}k`
    }
  }

  const chartData = [
    getMonthlyRevenue('jan', 65),
    getMonthlyRevenue('feb', 78),
    getMonthlyRevenue('mar', 95),
    getMonthlyRevenue('apr', 110),
    getMonthlyRevenue('may', 124),
    getMonthlyRevenue('jun', 140.2),
  ]

  const activeDestinations = [
    { name: 'Kyoto, Japan', count: packages.find(p => p.id === 'PKG-001')?.slots.booked || 0, trend: '+4 this week', color: 'bg-amber-100 text-amber-800' },
    { name: 'Swiss Alps, Zermatt', count: (packages.find(p => p.id === 'PKG-002')?.slots.booked || 0) + (packages.find(p => p.id === 'PKG-005')?.slots.booked || 0), trend: 'Stable', color: 'bg-orange-100 text-orange-800' },
    { name: 'Maldives Overwater', count: packages.find(p => p.id === 'PKG-003')?.slots.booked || 0, trend: '+2 this week', color: 'bg-yellow-100 text-yellow-800' },
  ]

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
              {/* Quick Statistics Grid */}
              <section className="grid grid-cols-2 gap-4 sm:gap-6">
                {[
                  { label: 'Active Bookings', value: bookings.length.toString(), sub: '+12 finalized this week', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'bg-amber-50 text-amber-700 border-amber-250/20' },
                  { label: 'Gross Revenue', value: formattedGrossRevenue, sub: '+18.4% month-over-month', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-orange-50 text-orange-700 border-orange-250/20' },
                  { label: 'Total Clients', value: totalClientsCount.toString(), sub: '+24 new profiles created', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0', color: 'bg-stone-100 text-stone-700 border-stone-250/20' },
                  { label: 'Commission Yield', value: formattedYield, sub: 'Avg. gross margin on sales', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', color: 'bg-yellow-50 text-yellow-700 border-yellow-250/20' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white border border-stone-200/80 rounded-2xl p-5 hover:border-stone-300 transition-all duration-300 shadow-sm relative group overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-stone-500 group-hover:text-stone-700 transition-colors duration-300">
                        {stat.label}
                      </span>
                      <div className={`w-8.5 h-8.5 rounded-lg ${stat.color} flex items-center justify-center shadow-sm border border-stone-200/20`}>
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 mb-1 tracking-tight">
                      {stat.value}
                    </h3>
                    <p className="text-[10px] text-stone-400 font-medium">
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
                        Gross monthly bookings growth (USD) over the last two quarters.
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
                            style={{ height: `${Math.min(100, (data.revenue / 180) * 100)}%` }}
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
      <DevSwitcher />
    </div>
  )
}

export default App
