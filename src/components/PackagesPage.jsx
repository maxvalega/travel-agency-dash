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
  const [pkgCardImage, setPkgCardImage] = useState('https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80')
  const [pkgHeroImage, setPkgHeroImage] = useState('https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80')
  const [pkgInclusions, setPkgInclusions] = useState({
    hotel: true,
    sightseeing: true,
    guide: true,
    airportTransfer: true,
    flight: false
  })

  // Edit Package Form States
  const [showEditPackageForm, setShowEditPackageForm] = useState(false)
  const [editPkgName, setEditPkgName] = useState('')
  const [editPkgDays, setEditPkgDays] = useState('5')
  const [editPkgPrice, setEditPkgPrice] = useState('3000')
  const [editPkgRegion, setEditPkgRegion] = useState('Asia')
  const [editPkgSlots, setEditPkgSlots] = useState('15')
  const [editPkgCardImage, setEditPkgCardImage] = useState('')
  const [editPkgHeroImage, setEditPkgHeroImage] = useState('')
  const [editPkgInclusions, setEditPkgInclusions] = useState({
    hotel: true,
    sightseeing: true,
    guide: true,
    airportTransfer: true,
    flight: false
  })
  const [packageToDelete, setPackageToDelete] = useState(null)

  // Margin Calculator Tool State
  const [calcClient, setCalcClient] = useState('')
  const [calcPackageId, setCalcPackageId] = useState('')
  const [calcCost, setCalcCost] = useState('3000')
  const [calcMarkup, setCalcMarkup] = useState(settings?.rules?.markup ?? settings?.defaultMarkup?.toString() ?? '15')
  const [calcSplit, setCalcSplit] = useState(settings?.rules?.agentSplit ?? settings?.defaultAgentSplit?.toString() ?? '40') // Agent split %

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

  const handlePackageImageUpload = async (e, isEdit = false) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      if (addNotification) addNotification('File size exceeds the 5MB limit!', 'warning')
      return
    }

    const formData = new FormData()
    formData.append('image', file)

    try {
      if (addNotification) addNotification('Uploading image...', 'info')
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Failed to upload image')
      }

      const data = await response.json()
      if (isEdit) {
        setEditPkgCardImage(data.imageUrl)
        setEditPkgHeroImage(data.imageUrl)
      } else {
        setPkgCardImage(data.imageUrl)
        setPkgHeroImage(data.imageUrl)
      }
      if (addNotification) addNotification('Image uploaded successfully!', 'success')
    } catch (err) {
      console.error(err)
      if (addNotification) addNotification(err.message || 'Image upload failed', 'error')
    }
  }

  const handleOpenEditPackage = (pkg) => {
    setEditPkgName(pkg.name)
    setEditPkgDays((pkg.duration || '').replace(' Days', '').replace(' Day', ''))
    setEditPkgPrice(pkg.basePrice ? pkg.basePrice.toString() : '0')
    setEditPkgRegion(pkg.region || 'Asia')
    setEditPkgSlots(pkg.slots?.total ? pkg.slots.total.toString() : '10')
    setEditPkgCardImage(pkg.cardImage || '')
    setEditPkgHeroImage(pkg.heroImage || '')
    setEditPkgInclusions(pkg.inclusionsSelection || {
      hotel: false,
      sightseeing: false,
      guide: false,
      airportTransfer: false,
      flight: false
    })
    setShowEditPackageForm(true)
  }

  const handleSaveEditPackage = (e) => {
    e.preventDefault()
    if (!editPkgName || !editPkgDays || !editPkgPrice) return

    const updated = {
      ...selectedPackage,
      name: editPkgName,
      duration: `${editPkgDays} Days`,
      basePrice: parseFloat(editPkgPrice) || 0,
      region: editPkgRegion,
      slots: { ...selectedPackage.slots, total: parseInt(editPkgSlots) || 10 },
      inclusionsSelection: editPkgInclusions,
      cardImage: editPkgCardImage,
      heroImage: editPkgHeroImage
    }

    setPackages(packages.map(p => p.id === selectedPackage.id ? updated : p))
    setSelectedPackage(updated)
    setShowEditPackageForm(false)
    if (addNotification) {
      addNotification(`Package ${updated.name} updated successfully`, 'success')
    }
  }

  const handleDeletePackage = (pkgId) => {
    setPackageToDelete(pkgId)
  }

  const confirmDeletePackage = () => {
    if (!packageToDelete) return
    const deletedPkg = packages.find(p => p.id === packageToDelete)
    setPackages(packages.filter(p => p.id !== packageToDelete))
    if (selectedPackage?.id === packageToDelete) {
      setSelectedPackage(null)
    }
    setPackageToDelete(null)
    if (addNotification) {
      addNotification(`Package ${deletedPkg?.name || 'Deleted'} removed successfully`, 'success')
    }
  }

  const handleAddPackage = (e) => {
    e.preventDefault()
    if (!pkgName || !pkgDays || !pkgPrice) return

    const newPkgObj = {
      id: `PKG-${crypto.randomUUID()}`,
      name: pkgName,
      duration: `${pkgDays} Days`,
      basePrice: parseFloat(pkgPrice) || 0,
      region: pkgRegion,
      slots: { booked: 0, total: parseInt(pkgSlots) || 10 },
      trend: 'New',
      color: 'bg-stone-100 text-stone-800 border-stone-200',
      inclusionsSelection: pkgInclusions,
      heroImage: pkgHeroImage,
      cardImage: pkgCardImage,
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
    setPkgCardImage('https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80')
    setPkgHeroImage('https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80')
    setPkgInclusions({
      hotel: true,
      sightseeing: true,
      guide: true,
      airportTransfer: true,
      flight: false
    })
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
                      <div className="flex items-center gap-1.5 text-stone-400 bg-stone-50 px-2 py-1 rounded border border-stone-100/60">
                        <span className="text-xs font-bold text-stone-850 mr-0.5">₹{pkg.basePrice.toLocaleString('en-IN')}</span>
                        {pkg.inclusionsSelection?.hotel && (
                          <svg className="w-3.5 h-3.5 text-stone-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" title="Hotel Included">
                            <path d="M3 21V9a2 2 0 012-2h14a2 2 0 012 2v12M10 21v-4a2 2 0 014 0v4" />
                          </svg>
                        )}
                        {pkg.inclusionsSelection?.sightseeing && (
                          <svg className="w-3.5 h-3.5 text-stone-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" title="Sightseeing Included">
                            <circle cx="12" cy="12" r="10" />
                            <polygon points="16.2 7.8 14.1 14.1 7.8 16.2 9.9 9.9 16.2 7.8" fill="currentColor" className="fill-stone-400" />
                          </svg>
                        )}
                        {pkg.inclusionsSelection?.guide && (
                          <svg className="w-3.5 h-3.5 text-stone-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" title="Guide Included">
                            <path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        )}
                        {pkg.inclusionsSelection?.airportTransfer && (
                          <svg className="w-3.5 h-3.5 text-stone-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" title="Airport Transfer Included">
                            <path d="M19 17h2c.6 0 1-.4 1-1v-3a2 2 0 00-2-2h-3l-3-4H7L4 11H3c-.6 0-1 .4-1 1v4c0 .6.4 1 1 1h2" />
                            <circle cx="7" cy="17" r="2" />
                            <circle cx="17" cy="17" r="2" />
                            <path d="M9 17h6" />
                          </svg>
                        )}
                        {pkg.inclusionsSelection?.flight && (
                          <svg className="w-3.5 h-3.5 text-stone-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" title="Flight Included">
                            <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3.5S19 4 17.5 5.5L14 9L5.8 7.2L3 8.6L11 13l-4 4H3.8L3 21l4-.8l4-4l4.4 8l1.4-2.8z" />
                          </svg>
                        )}
                      </div>
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
                          alert(`Drafted Quote for ${clientName}:\nPackage: ${pkg.name}\nRetail Cost: ₹${pkg.basePrice.toLocaleString('en-IN')}`);
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
                    <option key={p.id} value={p.id}>{p.name} (₹{p.basePrice.toLocaleString('en-IN')})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-stone-100 pb-4">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Supplier Cost (INR)</label>
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
                <span className="text-sm font-extrabold text-stone-900">₹{retailPrice.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div className="bg-[#FAF9F5] p-3 rounded-xl border border-stone-200/40">
                <span className="text-[9px] font-bold text-stone-400 block uppercase mb-1">Total Margin</span>
                <div className="flex flex-col items-center">
                  <span className="text-sm font-extrabold text-amber-700">₹{totalMargin.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  <span className="text-[9px] text-stone-500 font-bold mt-0.5">{marginPercent.toFixed(1)}% of retail</span>
                </div>
              </div>
              <div className="bg-[#FAF9F5] p-3 rounded-xl border border-stone-200/40">
                <span className="text-[9px] font-bold text-stone-400 block uppercase mb-1">Agent Yield</span>
                <span className="text-sm font-extrabold text-stone-800">₹{agentCommission.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div className="bg-amber-600/5 p-3 rounded-xl border border-amber-600/10">
                <span className="text-[9px] font-bold text-amber-750 block uppercase mb-1">Agency Net</span>
                <span className="text-sm font-extrabold text-amber-805">₹{agencyRevenue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Itinerary Builder Sidebar (1 col) */}
        <div className="lg:col-span-1">
          {selectedPackage ? (
            <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm space-y-6 animate-in fade-in duration-200 sticky top-24">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 tracking-tight">{selectedPackage.name}</h3>
                  <div className="flex justify-between items-center mt-0.5">
                    <span className="text-[10px] text-stone-400 font-semibold">{selectedPackage.duration} Plan</span>
                    <span className="text-[10px] text-stone-500 font-bold ml-2">{selectedPackage.id}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenEditPackage(selectedPackage)}
                  className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-500 hover:text-stone-700 transition-all cursor-pointer"
                  title="Edit Package"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>

              {/* Manage Inclusions */}
              <div className="border-t border-stone-100 pt-4 space-y-2">
                <h4 className="text-xs font-bold text-stone-850 uppercase tracking-wider">Inclusions Selection</h4>
                <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200/60">
                  <label className="flex items-center gap-2 text-[11px] font-semibold text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPackage.inclusionsSelection?.hotel ?? false}
                      onChange={(e) => {
                        const updatedPackage = {
                          ...selectedPackage,
                          inclusionsSelection: {
                            ...(selectedPackage.inclusionsSelection || {}),
                            hotel: e.target.checked
                          }
                        }
                        setPackages(packages.map(p => p.id === selectedPackage.id ? updatedPackage : p))
                        setSelectedPackage(updatedPackage)
                      }}
                      className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Hotel</span>
                  </label>
                  <label className="flex items-center gap-2 text-[11px] font-semibold text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPackage.inclusionsSelection?.sightseeing ?? false}
                      onChange={(e) => {
                        const updatedPackage = {
                          ...selectedPackage,
                          inclusionsSelection: {
                            ...(selectedPackage.inclusionsSelection || {}),
                            sightseeing: e.target.checked
                          }
                        }
                        setPackages(packages.map(p => p.id === selectedPackage.id ? updatedPackage : p))
                        setSelectedPackage(updatedPackage)
                      }}
                      className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Sightseeing</span>
                  </label>
                  <label className="flex items-center gap-2 text-[11px] font-semibold text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPackage.inclusionsSelection?.guide ?? false}
                      onChange={(e) => {
                        const updatedPackage = {
                          ...selectedPackage,
                          inclusionsSelection: {
                            ...(selectedPackage.inclusionsSelection || {}),
                            guide: e.target.checked
                          }
                        }
                        setPackages(packages.map(p => p.id === selectedPackage.id ? updatedPackage : p))
                        setSelectedPackage(updatedPackage)
                      }}
                      className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Guide</span>
                  </label>
                  <label className="flex items-center gap-2 text-[11px] font-semibold text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPackage.inclusionsSelection?.airportTransfer ?? false}
                      onChange={(e) => {
                        const updatedPackage = {
                          ...selectedPackage,
                          inclusionsSelection: {
                            ...(selectedPackage.inclusionsSelection || {}),
                            airportTransfer: e.target.checked
                          }
                        }
                        setPackages(packages.map(p => p.id === selectedPackage.id ? updatedPackage : p))
                        setSelectedPackage(updatedPackage)
                      }}
                      className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Transfer</span>
                  </label>
                  <label className="flex items-center gap-2 text-[11px] font-semibold text-stone-700 cursor-pointer col-span-2 mt-1 pt-1.5 border-t border-stone-200/60">
                    <input
                      type="checkbox"
                      checked={selectedPackage.inclusionsSelection?.flight ?? false}
                      onChange={(e) => {
                        const updatedPackage = {
                          ...selectedPackage,
                          inclusionsSelection: {
                            ...(selectedPackage.inclusionsSelection || {}),
                            flight: e.target.checked
                          }
                        }
                        setPackages(packages.map(p => p.id === selectedPackage.id ? updatedPackage : p))
                        setSelectedPackage(updatedPackage)
                      }}
                      className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Flight Included</span>
                  </label>
                </div>
              </div>

              {/* Slots Booked Adjustment */}
              <div className="border-t border-stone-100 pt-4 space-y-2">
                <h4 className="text-xs font-bold text-stone-850 uppercase tracking-wider">Booking Slots</h4>
                <div className="flex items-center justify-between bg-stone-50 p-3 rounded-xl border border-stone-200/60">
                  <div className="text-[11px] text-stone-600 font-semibold">
                    <span className="text-stone-900 font-bold">{selectedPackage.slots?.booked ?? 0}</span> / {selectedPackage.slots?.total ?? 10} booked
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        const newBooked = Math.max(0, (selectedPackage.slots?.booked ?? 0) - 1)
                        const updatedPackage = { ...selectedPackage, slots: { ...selectedPackage.slots, booked: newBooked } }
                        setPackages(packages.map(p => p.id === selectedPackage.id ? updatedPackage : p))
                        setSelectedPackage(updatedPackage)
                      }}
                      className="w-6 h-6 rounded-md bg-white border border-stone-200 hover:border-amber-400 text-stone-600 hover:text-amber-700 flex items-center justify-center text-sm font-bold cursor-pointer transition-all"
                      title="Decrease booked"
                    >−</button>
                    <button
                      onClick={() => {
                        const max = selectedPackage.slots?.total ?? 10
                        const newBooked = Math.min(max, (selectedPackage.slots?.booked ?? 0) + 1)
                        const updatedPackage = { ...selectedPackage, slots: { ...selectedPackage.slots, booked: newBooked } }
                        setPackages(packages.map(p => p.id === selectedPackage.id ? updatedPackage : p))
                        setSelectedPackage(updatedPackage)
                      }}
                      className="w-6 h-6 rounded-md bg-white border border-stone-200 hover:border-amber-400 text-stone-600 hover:text-amber-700 flex items-center justify-center text-sm font-bold cursor-pointer transition-all"
                      title="Increase booked"
                    >+</button>
                    <button
                      onClick={() => {
                        const updatedPackage = { ...selectedPackage, slots: { ...selectedPackage.slots, booked: 0 } }
                        setPackages(packages.map(p => p.id === selectedPackage.id ? updatedPackage : p))
                        setSelectedPackage(updatedPackage)
                      }}
                      className="ml-1 px-2 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-[9px] font-bold cursor-pointer transition-all"
                      title="Reset slots to 0"
                    >Reset</button>
                  </div>
                </div>
              </div>
              {/* Best Month & CTA Badge */}
              <div className="border-t border-stone-100 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-stone-850 uppercase tracking-wider">Seasonal Promotion</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">Best Month to Visit</label>
                    <select
                      value={selectedPackage.bestMonth || ''}
                      onChange={(e) => {
                        const updatedPackage = { ...selectedPackage, bestMonth: e.target.value }
                        setPackages(packages.map(p => p.id === selectedPackage.id ? updatedPackage : p))
                        setSelectedPackage(updatedPackage)
                      }}
                      className="w-full bg-stone-50 border border-stone-200 focus:border-amber-500 rounded-lg p-2 text-xs text-stone-700 outline-none"
                    >
                      <option value="">— None —</option>
                      <option value="January">January</option>
                      <option value="February">February</option>
                      <option value="March">March</option>
                      <option value="April">April</option>
                      <option value="May">May</option>
                      <option value="June">June</option>
                      <option value="July">July</option>
                      <option value="August">August</option>
                      <option value="September">September</option>
                      <option value="October">October</option>
                      <option value="November">November</option>
                      <option value="December">December</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">CTA Badge</label>
                    <select
                      value={selectedPackage.ctaBadge || ''}
                      onChange={(e) => {
                        const updatedPackage = { ...selectedPackage, ctaBadge: e.target.value }
                        setPackages(packages.map(p => p.id === selectedPackage.id ? updatedPackage : p))
                        setSelectedPackage(updatedPackage)
                      }}
                      className="w-full bg-stone-50 border border-stone-200 focus:border-amber-500 rounded-lg p-2 text-xs text-stone-700 outline-none"
                    >
                      <option value="">— None —</option>
                      <option value="Best Seller">🔥 Best Seller</option>
                      <option value="Best This Month">⭐ Best This Month</option>
                      <option value="Monsoon Special">🌧️ Monsoon Special</option>
                      <option value="Winter Escape">❄️ Winter Escape</option>
                      <option value="Summer Pick">☀️ Summer Pick</option>
                      <option value="Honeymoon Favorite">💕 Honeymoon Favorite</option>
                      <option value="Early Bird Deal">🐦 Early Bird Deal</option>
                      <option value="Limited Time">⏰ Limited Time</option>
                      <option value="Staff Pick">👑 Staff Pick</option>
                      <option value="New Launch">🚀 New Launch</option>
                    </select>
                  </div>
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

              {/* Delete Package Button */}
              <div className="border-t border-stone-100 pt-4">
                <button
                  onClick={() => handleDeletePackage(selectedPackage.id)}
                  className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 hover:border-rose-350 rounded-xl text-xs font-bold shadow-sm active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Vacation Package
                </button>
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
              {/* Package Image Upload */}
              <div className="p-3 bg-stone-50/50 border border-stone-200 rounded-xl">
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Package Image (Cover & Hero)</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 rounded-lg bg-stone-100 p-0.5 border border-stone-200 shrink-0 relative overflow-hidden">
                    <img src={pkgCardImage || pkgHeroImage} alt="Preview" className="w-full h-full object-cover rounded" />
                  </div>
                  <div className="relative overflow-hidden flex-grow">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePackageImageUpload(e, false)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-white border border-stone-250 hover:bg-stone-50 rounded-lg text-xs font-semibold text-stone-650 transition-all cursor-pointer"
                    >
                      Choose Image
                    </button>
                    <p className="text-[9px] text-stone-400 mt-1">This image will be used for both card cover and detail page header.</p>
                  </div>
                </div>
              </div>

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
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Base Price (INR)</label>
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

              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">Package Inclusions Selection</label>
                <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pkgInclusions.hotel}
                      onChange={(e) => setPkgInclusions(prev => ({ ...prev, hotel: e.target.checked }))}
                      className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Hotel</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pkgInclusions.sightseeing}
                      onChange={(e) => setPkgInclusions(prev => ({ ...prev, sightseeing: e.target.checked }))}
                      className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Sightseeing</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pkgInclusions.guide}
                      onChange={(e) => setPkgInclusions(prev => ({ ...prev, guide: e.target.checked }))}
                      className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Guide</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pkgInclusions.airportTransfer}
                      onChange={(e) => setPkgInclusions(prev => ({ ...prev, airportTransfer: e.target.checked }))}
                      className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Airport Transfer</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer col-span-2 mt-1 pt-1.5 border-t border-stone-200/60">
                    <input
                      type="checkbox"
                      checked={pkgInclusions.flight}
                      onChange={(e) => setPkgInclusions(prev => ({ ...prev, flight: e.target.checked }))}
                      className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Flight Included</span>
                  </label>
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

      {/* Edit Package Modal */}
      {showEditPackageForm && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-stone-200 rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">Edit Vacation Package</h3>
              <button 
                onClick={() => setShowEditPackageForm(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 cursor-pointer"
              >
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveEditPackage} className="space-y-4 pt-4">
              {/* Package Image Upload */}
              <div className="p-3 bg-stone-50/50 border border-stone-200 rounded-xl">
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Package Image (Cover & Hero)</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 rounded-lg bg-stone-100 p-0.5 border border-stone-200 shrink-0 relative overflow-hidden">
                    <img src={editPkgCardImage || editPkgHeroImage} alt="Preview" className="w-full h-full object-cover rounded" />
                  </div>
                  <div className="relative overflow-hidden flex-grow">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePackageImageUpload(e, true)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-white border border-stone-250 hover:bg-stone-50 rounded-lg text-xs font-semibold text-stone-655 transition-all cursor-pointer"
                    >
                      Choose Image
                    </button>
                    <p className="text-[9px] text-stone-400 mt-1">This image will be used for both card cover and detail page header.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tuscan Gastronomy Experience"
                  value={editPkgName}
                  onChange={(e) => setEditPkgName(e.target.value)}
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
                    value={editPkgDays}
                    onChange={(e) => setEditPkgDays(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-250 focus:border-amber-500 rounded-lg p-2.5 text-xs text-stone-850 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 35000"
                    value={editPkgPrice}
                    onChange={(e) => setEditPkgPrice(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-250 focus:border-amber-500 rounded-lg p-2.5 text-xs text-stone-850 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Destination Region</label>
                  <select
                    value={editPkgRegion}
                    onChange={(e) => setEditPkgRegion(e.target.value)}
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
                    value={editPkgSlots}
                    onChange={(e) => setEditPkgSlots(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-250 focus:border-amber-500 rounded-lg p-2.5 text-xs text-stone-850 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">Package Inclusions Selection</label>
                <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPkgInclusions.hotel}
                      onChange={(e) => setEditPkgInclusions(prev => ({ ...prev, hotel: e.target.checked }))}
                      className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Hotel</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPkgInclusions.sightseeing}
                      onChange={(e) => setEditPkgInclusions(prev => ({ ...prev, sightseeing: e.target.checked }))}
                      className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Sightseeing</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPkgInclusions.guide}
                      onChange={(e) => setEditPkgInclusions(prev => ({ ...prev, guide: e.target.checked }))}
                      className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Guide</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPkgInclusions.airportTransfer}
                      onChange={(e) => setEditPkgInclusions(prev => ({ ...prev, airportTransfer: e.target.checked }))}
                      className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Airport Transfer</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer col-span-2 mt-1 pt-1.5 border-t border-stone-200/60">
                    <input
                      type="checkbox"
                      checked={editPkgInclusions.flight}
                      onChange={(e) => setEditPkgInclusions(prev => ({ ...prev, flight: e.target.checked }))}
                      className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Flight Included</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditPackageForm(false)}
                  className="px-4 py-2 border border-stone-250 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-50 active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow active:scale-95 transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {packageToDelete && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-stone-200 rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in duration-200">
            <h3 className="text-base font-bold text-stone-900 mb-2">Delete Vacation Package?</h3>
            <p className="text-xs text-stone-500 mb-6 leading-relaxed">
              Are you sure you want to delete this vacation package? This action is permanent and cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPackageToDelete(null)}
                className="px-4 py-2 border border-stone-250 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-50 active:scale-95 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePackage}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow active:scale-95 transition-all cursor-pointer"
              >
                Delete Package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
