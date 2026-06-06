import { useState } from 'react'

export default function PackagesPage({ packages, setPackages, clients, bookings, setBookings, settings, addNotification }) {
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [filterRegion, setFilterRegion] = useState('All')
  const [showAddPackageForm, setShowAddPackageForm] = useState(false)

  // New Package Form States
  const [pkgName, setPkgName] = useState('')
  const [pkgDays, setPkgDays] = useState('5')
  const [pkgPrice, setPkgPrice] = useState('3000')
  const [pkgRegion, setPkgRegion] = useState('Asia')
  const [pkgSlots, setPkgSlots] = useState('15')

  // Margin Calculator Tool State
  const [calcClient, setCalcClient] = useState('')
  const [calcPackageId, setCalcPackageId] = useState('')
  const [calcCost, setCalcCost] = useState('3000')
  const [calcMarkup, setCalcMarkup] = useState(settings?.rules?.markup || '18')
  const [calcSplit, setCalcSplit] = useState(settings?.rules?.agentSplit || '45') // Agent split %

  // Itinerary Builder State
  const [newDayNum, setNewDayNum] = useState('')
  const [newDayTitle, setNewDayTitle] = useState('')
  const [newDayDesc, setNewDayDesc] = useState('')
  const [itineraryError, setItineraryError] = useState('')


  // Filter package catalog
  const filteredPackages = filterRegion === 'All'
    ? packages
    : packages.filter(p => p.region === filterRegion)

  // Calculates Margin metrics
  const cost = parseFloat(calcCost) || 0
  const markupPercent = parseFloat(calcMarkup) || 0
  const splitPercent = parseFloat(calcSplit) || 0

  const retailPrice = cost * (1 + markupPercent / 100)
  const totalMargin = retailPrice - cost
  const marginPercent = retailPrice > 0 ? (totalMargin / retailPrice) * 100 : 0
  const agentCommission = totalMargin * (splitPercent / 100)
  const agencyRevenue = totalMargin - agentCommission

  const handlePackageSelectChange = (packageId) => {
    setCalcPackageId(packageId)
    const pkg = packages.find(p => p.id === packageId)
    if (pkg) {
      setCalcCost(pkg.basePrice.toString())
    }
  }

  const handleAddPackage = (e) => {
    e.preventDefault()
    if (!pkgName || !pkgDays || !pkgPrice) return

    const newPkgObj = {
      id: `PKG-${Math.floor(100 + Math.random() * 900)}`,
      name: pkgName,
      duration: `${pkgDays} Days`,
      basePrice: parseFloat(pkgPrice) || 0,
      region: pkgRegion,
      slots: { booked: 0, total: parseInt(pkgSlots) || 10 },
      trend: 'New',
      color: 'bg-stone-100 text-stone-800 border-stone-200',
      itinerary: []
    }

    setPackages([newPkgObj, ...packages])
    setSelectedPackage(newPkgObj)
    setShowAddPackageForm(false)

    // Reset fields
    setPkgName('')
    setPkgDays('5')
    setPkgPrice('3000')
    setPkgRegion('Asia')
    setPkgSlots('15')
  }

  const handleAddItineraryDay = (e) => {
    e.preventDefault()
    if (!newDayNum || !newDayTitle || !newDayDesc || !selectedPackage) return
    setItineraryError('')

    const dayNum = parseInt(newDayNum)
    const maxDays = parseInt(selectedPackage.duration) || 10

    // Duration Guardrail
    if (dayNum > maxDays || dayNum < 1) {
      const errMsg = `This package duration is restricted to ${maxDays} Days. Cannot add Day ${dayNum}.`
      setItineraryError(errMsg)
      if (addNotification) addNotification(errMsg, 'warning')
      return
    }

    // Prevent duplicate days
    if (selectedPackage.itinerary.some(item => item.day === dayNum)) {
      const errMsg = `Day ${dayNum} already exists in the itinerary sequence. Delete it first to overwrite.`
      setItineraryError(errMsg)
      if (addNotification) addNotification(errMsg, 'warning')
      return
    }

    const updatedPackage = {
      ...selectedPackage,
      itinerary: [
        ...selectedPackage.itinerary,
        { day: dayNum, title: newDayTitle, desc: newDayDesc }
      ].sort((a, b) => a.day - b.day)
    }

    setPackages(packages.map(p => p.id === selectedPackage.id ? updatedPackage : p))
    setSelectedPackage(updatedPackage)

    // Reset day inputs
    setNewDayNum('')
    setNewDayTitle('')
    setNewDayDesc('')
    setItineraryError('')
  }

  const handleRemoveItineraryDay = (dayToRemove) => {
    if (!selectedPackage) return

    const updatedPackage = {
      ...selectedPackage,
      itinerary: selectedPackage.itinerary.filter(item => item.day !== dayToRemove)
    }

    setPackages(packages.map(p => p.id === selectedPackage.id ? updatedPackage : p))
    setSelectedPackage(updatedPackage)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">Luxury Travel Catalog</h2>
          <p className="text-xs text-stone-400">Review itineraries, check booking slots, and calculate commissions splits in real time.</p>
        </div>
        <button
          onClick={() => setShowAddPackageForm(true)}
          className="py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-sm active:scale-[0.98] transition-all duration-300 flex items-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Vacation Package
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Packages List & Calculator (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Destination Category Filters */}
          <div className="flex gap-2 border-b border-stone-200 pb-3">
            {['All', 'Asia', 'Europe'].map(reg => (
              <button
                key={reg}
                onClick={() => setFilterRegion(reg)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterRegion === reg 
                    ? 'bg-amber-600 text-white shadow-sm' 
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {reg === 'All' ? 'All Regions' : reg}
              </button>
            ))}
          </div>

          {/* Packages List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPackages.map(pkg => {
              const spotsLeft = pkg.slots.total - pkg.slots.booked
              const isLowAllotment = spotsLeft <= 3
              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`bg-white border rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative ${
                    selectedPackage?.id === pkg.id ? 'ring-1 ring-amber-500 border-amber-300' : 'border-stone-200'
                  }`}
                >
                  <div>
                    {/* Header: base price and region tag */}
                    <div className="flex justify-between items-center mb-2">
                      <span className="px-2 py-0.5 text-[8.5px] font-extrabold uppercase rounded bg-stone-100 text-stone-600 border border-stone-200">
                        {pkg.region}
                      </span>
                      <span className="text-xs font-bold text-stone-850">${pkg.basePrice.toLocaleString()}</span>
                    </div>
                    <h3 className="text-sm font-bold text-stone-900 group-hover:text-amber-700 transition-colors leading-tight">
                      {pkg.name}
                    </h3>
                    <p className="text-[10px] text-stone-400 font-semibold mt-0.5">Duration: {pkg.duration}</p>
                  </div>

                  {/* Allotment Details & Visual Progress Bar */}
                  <div className="border-t border-stone-100 mt-4 pt-3 text-xs">
                    <div className="flex justify-between items-center mb-1.5">
                      <div>
                        <span className="text-[9px] text-stone-400 font-bold uppercase block">Allotment Filled</span>
                        <span className="font-semibold text-stone-700">{pkg.slots.booked}/{pkg.slots.total} Spaces</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                        isLowAllotment
                          ? 'bg-rose-50 text-rose-700 border-rose-250 animate-pulse'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-250'
                      }`}>
                        {isLowAllotment ? `${spotsLeft} Slots Left!` : 'Available'}
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isLowAllotment ? 'bg-rose-500' : 'bg-amber-500'}`}
                        style={{ width: `${(pkg.slots.booked / pkg.slots.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Quick CTAs on Card */}
                  <div className="flex gap-2 mt-4 pt-3 border-t border-stone-100/60">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        alert(`Booking request registered for ${pkg.name}!`);
                      }}
                      className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-bold shadow-sm active:scale-[0.98] transition-all cursor-pointer text-center"
                    >
                      Book Now
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        const clientName = prompt(`Enter client name for quick quote on ${pkg.name}:`)
                        if (clientName) {
                          alert(`Drafted Quote for ${clientName}:\nPackage: ${pkg.name}\nRetail Cost: $${pkg.basePrice.toLocaleString()}`);
                        }
                      }}
                      className="flex-1 py-1.5 bg-white hover:bg-stone-50 border border-stone-250/70 text-stone-700 rounded-lg text-[10px] font-bold shadow-sm active:scale-[0.98] transition-all cursor-pointer text-center"
                    >
                      Quick Quote
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pricing Calculator Panel */}
          <div className="bg-white border border-stone-200/85 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 tracking-tight">Dynamic Commission & Margin Calculator</h3>
              <p className="text-[11px] text-stone-400">Estimate agency commission splits and retail cost margin limits.</p>
            </div>

            {/* Traceable Client & Package Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-stone-100 pb-4">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Target Client Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sophia Loren"
                  value={calcClient}
                  onChange={(e) => setCalcClient(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-250 focus:border-amber-500 rounded-lg p-2.5 text-xs text-stone-850 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Link Vacation Package</label>
                <select
                  value={calcPackageId}
                  onChange={(e) => handlePackageSelectChange(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-250 focus:border-amber-500 rounded-lg p-2.5 text-xs text-stone-850 outline-none"
                >
                  <option value="">-- Choose Package --</option>
                  {packages.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (${p.basePrice.toLocaleString()})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-stone-100 pb-4">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Supplier Cost (USD)</label>
                <input
                  type="number"
                  value={calcCost}
                  onChange={(e) => setCalcCost(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-250 focus:border-amber-500 rounded-lg p-2.5 text-xs text-stone-850 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Markup Percentage (%)</label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="number"
                    value={calcMarkup}
                    onChange={(e) => setCalcMarkup(e.target.value)}
                    className="w-16 bg-stone-50 border border-stone-250 focus:border-amber-500 rounded-lg p-2 text-xs text-stone-850 outline-none"
                  />
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={calcMarkup}
                    onChange={(e) => setCalcMarkup(e.target.value)}
                    className="flex-1 accent-amber-600 cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Agent Split (%)</label>
                <input
                  type="number"
                  value={calcSplit}
                  onChange={(e) => setCalcSplit(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-250 focus:border-amber-500 rounded-lg p-2.5 text-xs text-stone-850 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-center">
              <div className="bg-[#FAF9F5] p-3 rounded-xl border border-stone-200/40">
                <span className="text-[9px] font-bold text-stone-400 block uppercase mb-1">Retail Price</span>
                <span className="text-sm font-extrabold text-stone-900">${retailPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div className="bg-[#FAF9F5] p-3 rounded-xl border border-stone-200/40">
                <span className="text-[9px] font-bold text-stone-400 block uppercase mb-1">Total Margin</span>
                <div className="flex flex-col items-center">
                  <span className="text-sm font-extrabold text-amber-700">${totalMargin.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  <span className="text-[9px] text-stone-500 font-bold mt-0.5">{marginPercent.toFixed(1)}% of retail</span>
                </div>
              </div>
              <div className="bg-[#FAF9F5] p-3 rounded-xl border border-stone-200/40">
                <span className="text-[9px] font-bold text-stone-400 block uppercase mb-1">Agent Yield</span>
                <span className="text-sm font-extrabold text-stone-800">${agentCommission.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div className="bg-amber-600/5 p-3 rounded-xl border border-amber-600/10">
                <span className="text-[9px] font-bold text-amber-750 block uppercase mb-1">Agency Net</span>
                <span className="text-sm font-extrabold text-amber-800">${agencyRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Itinerary Builder Sidebar (1 col) */}
        <div className="lg:col-span-1">
          {selectedPackage ? (
            <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm space-y-6 animate-in fade-in duration-200 sticky top-24">
              <div>
                <h3 className="text-sm font-bold text-stone-900 tracking-tight">{selectedPackage.name}</h3>
                <div className="flex justify-between items-center mt-0.5">
                  <span className="text-[10px] text-stone-400 font-semibold">{selectedPackage.duration} Plan</span>
                  <span className="text-[10px] text-stone-500 font-bold">{selectedPackage.id}</span>
                </div>
              </div>

              {/* Day Timeline with Deletion */}
              <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                {selectedPackage.itinerary.length > 0 ? (
                  selectedPackage.itinerary.map(item => (
                    <div key={item.day} className="flex gap-3 text-xs items-start group relative">
                      <span className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-300 text-amber-700 flex items-center justify-center font-bold shrink-0">
                        D{item.day}
                      </span>
                      <div className="space-y-0.5 flex-1 pr-6">
                        <h4 className="font-bold text-stone-850">{item.title}</h4>
                        <p className="text-[11px] text-stone-500 leading-relaxed">{item.desc}</p>
                      </div>
                      {/* Hover delete day button */}
                      <button
                        onClick={() => handleRemoveItineraryDay(item.day)}
                        className="absolute right-0 top-0.5 p-1 rounded hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                        title={`Remove Day ${item.day}`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-400 italic">No itinerary days added yet. Use the form below to append Day 1.</p>
                )}
              </div>

              {/* Form to Add Day */}
              <div className="border-t border-stone-100 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-stone-850 uppercase tracking-wider">Add Day Itinerary Event</h4>
                  <span className="text-[10px] text-stone-500 font-bold bg-stone-100 px-1.5 py-0.5 rounded">
                    Limit: {selectedPackage.itinerary.length}/{parseInt(selectedPackage.duration)}
                  </span>
                </div>
                {itineraryError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-[11px] font-medium flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {itineraryError}
                  </div>
                )}
                <form onSubmit={handleAddItineraryDay} className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">Day No.</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 4"
                        value={newDayNum}
                        onChange={(e) => setNewDayNum(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-250 focus:border-amber-500 rounded-lg p-2 text-xs text-stone-850 outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">Title Header</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Free Time & Shopping"
                        value={newDayTitle}
                        onChange={(e) => setNewDayTitle(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-250 focus:border-amber-500 rounded-lg p-2 text-xs text-stone-850 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <textarea
                      required
                      rows="2"
                      placeholder="Details on hotels, restaurants, excursions, ground transport schedules..."
                      value={newDayDesc}
                      onChange={(e) => setNewDayDesc(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-250 focus:border-amber-500 rounded-lg p-2 text-xs text-stone-850 outline-none resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Append Itinerary Day
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-stone-50 border border-dashed border-stone-300/60 rounded-2xl p-12 text-center text-stone-400 text-xs">
              <svg className="w-10 h-10 mx-auto text-stone-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8m-9-3.5h12M3 21h18a2.25 2.25 0 002.25-2.25V5.25A2.25 2.25 0 0021 3H3a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 003 21z" />
              </svg>
              Select a vacation package from the grid to modify its day-by-day itinerary sequence or edit traveler schedules.
            </div>
          )}
        </div>
      </div>

      {/* Add Package Modal */}
      {showAddPackageForm && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-stone-200 rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">Add New Vacation Package</h3>
              <button 
                onClick={() => setShowAddPackageForm(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 cursor-pointer"
              >
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddPackage} className="space-y-4 pt-4">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tuscan Gastronomy Experience"
                  value={pkgName}
                  onChange={(e) => setPkgName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-250 focus:border-amber-500 rounded-lg p-2.5 text-xs text-stone-850 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="30"
                    placeholder="e.g. 5"
                    value={pkgDays}
                    onChange={(e) => setPkgDays(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-250 focus:border-amber-500 rounded-lg p-2.5 text-xs text-stone-850 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Base Price (USD)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="e.g. 3500"
                    value={pkgPrice}
                    onChange={(e) => setPkgPrice(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-250 focus:border-amber-500 rounded-lg p-2.5 text-xs text-stone-850 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Destination Region</label>
                  <select
                    value={pkgRegion}
                    onChange={(e) => setPkgRegion(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-250 focus:border-amber-500 rounded-lg p-2.5 text-xs text-stone-850 outline-none"
                  >
                    <option value="Asia">Asia</option>
                    <option value="Europe">Europe</option>
                    <option value="Americas">Americas</option>
                    <option value="Africa">Africa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Total Allotment Slots</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 20"
                    value={pkgSlots}
                    onChange={(e) => setPkgSlots(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-250 focus:border-amber-500 rounded-lg p-2.5 text-xs text-stone-850 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPackageForm(false)}
                  className="px-4 py-2 border border-stone-250 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-50 active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow active:scale-95 transition-all cursor-pointer"
                >
                  Create Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
