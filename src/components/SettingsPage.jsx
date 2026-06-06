import { useState } from 'react'

export default function SettingsPage({ settings = {}, setSettings, addNotification }) {
  const permissions = settings.permissions || {
    admin: { viewFinancials: true, editPricing: true, supplierCreds: true, clientScans: true },
    manager: { viewFinancials: true, editPricing: true, supplierCreds: false, clientScans: true },
    agent: { viewFinancials: false, editPricing: false, supplierCreds: false, clientScans: true }
  }

  const togglePermission = (role, key) => {
    const updated = {
      ...permissions,
      [role]: {
        ...permissions[role],
        [key]: !permissions[role][key]
      }
    }
    setSettings({
      ...settings,
      permissions: updated
    })
    if (addNotification) {
      addNotification(`Updated permissions for ${role}`, 'info')
    }
  }

  const apis = settings.apis || {
    sabre: { connected: true, endpoint: 'https://api.sabre.com/v2/flights', key: '••••••••••••••••••••' },
    amadeus: { connected: false, endpoint: 'https://api.amadeus.com/v1/booking', key: '' },
    bedbank: { connected: true, endpoint: 'https://api.hotelbeds.com/hotel/v3', key: '••••••••••••••••••••' }
  }

  const toggleApiConnection = (apiName) => {
    const updated = {
      ...apis,
      [apiName]: {
        ...apis[apiName],
        connected: !apis[apiName].connected
      }
    }
    setSettings({
      ...settings,
      apis: updated
    })
    const status = updated[apiName].connected ? 'connected' : 'disconnected'
    if (addNotification) {
      addNotification(`${apiName} API ${status}`, 'info')
    }
  }

  const handleApiKeyChange = (apiName, value) => {
    const updated = {
      ...apis,
      [apiName]: {
        ...apis[apiName],
        key: value
      }
    }
    setSettings({
      ...settings,
      apis: updated
    })
  }

  const defaultMarkup = parseInt(settings.rules?.markup || '18')
  const defaultAgentSplit = parseInt(settings.rules?.agentSplit || '45')

  const setDefaultMarkup = (val) => {
    setSettings({
      ...settings,
      rules: {
        ...settings.rules,
        markup: val.toString()
      }
    })
  }

  const setDefaultAgentSplit = (val) => {
    setSettings({
      ...settings,
      rules: {
        ...settings.rules,
        agentSplit: val.toString()
      }
    })
  }

  const agencyName = settings.agencyName || 'KRAFT YOUR TRIP'
  const agencyAddress = settings.agencyAddress || '456 Sandstone Ave, Suite 100, San Francisco, CA'

  const setAgencyName = (val) => {
    setSettings({
      ...settings,
      agencyName: val
    })
  }

  const setAgencyAddress = (val) => {
    setSettings({
      ...settings,
      agencyAddress: val
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-stone-900 tracking-tight">Agency Operations & Settings</h2>
        <p className="text-xs text-stone-400">Manage permissions, link API credentials, and set global markup standards.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left column (2 cols) */}
        <div className="xl:col-span-2 space-y-6">
          {/* Access Control Matrix */}
          <section className="bg-white border border-stone-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-stone-200/50">
              <h3 className="text-sm font-bold text-stone-900 tracking-tight">Staff Roles & Permissions</h3>
              <p className="text-[11px] text-stone-400">Configure access levels across executive, management, and junior staff roles.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50/50 border-b border-stone-200/50 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                    <th className="py-3 px-6">Operational Capability</th>
                    <th className="py-3 px-6 text-center">Administrator</th>
                    <th className="py-3 px-6 text-center">Senior Manager</th>
                    <th className="py-3 px-6 text-center">Travel Agent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  <tr className="hover:bg-stone-50/10">
                    <td className="py-3 px-6 font-semibold text-stone-800">Access Global Agency Reports</td>
                    {['admin', 'manager', 'agent'].map((role) => (
                      <td key={role} className="py-3 px-6 text-center">
                        <input
                          type="checkbox"
                          checked={permissions[role].viewFinancials}
                          onChange={() => togglePermission(role, 'viewFinancials')}
                          className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-stone-50/10">
                    <td className="py-3 px-6 font-semibold text-stone-800">Override Pricing & Markup Rules</td>
                    {['admin', 'manager', 'agent'].map((role) => (
                      <td key={role} className="py-3 px-6 text-center">
                        <input
                          type="checkbox"
                          checked={permissions[role].editPricing}
                          onChange={() => togglePermission(role, 'editPricing')}
                          className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-stone-50/10">
                    <td className="py-3 px-6 font-semibold text-stone-800">Configure Supplier Credentials</td>
                    {['admin', 'manager', 'agent'].map((role) => (
                      <td key={role} className="py-3 px-6 text-center">
                        <input
                          type="checkbox"
                          checked={permissions[role].supplierCreds}
                          onChange={() => togglePermission(role, 'supplierCreds')}
                          className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-stone-50/10">
                    <td className="py-3 px-6 font-semibold text-stone-800">View Client Documents Locker</td>
                    {['admin', 'manager', 'agent'].map((role) => (
                      <td key={role} className="py-3 px-6 text-center">
                        <input
                          type="checkbox"
                          checked={permissions[role].clientScans}
                          onChange={() => togglePermission(role, 'clientScans')}
                          className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Supplier API Connector Credentials */}
          <section className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 tracking-tight">Supplier API Integration Portal</h3>
              <p className="text-[11px] text-stone-400">Establish direct links with flight aggregators (GDS) and hotel bed banks.</p>
            </div>

            <div className="space-y-4">
              {Object.keys(apis).map((apiName) => {
                const api = apis[apiName]
                return (
                  <div key={apiName} className="p-4 bg-[#FAF9F5]/50 border border-stone-200/40 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900 uppercase">{apiName} API</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                          api.connected ? 'bg-emerald-50 text-emerald-700 border-emerald-250' : 'bg-stone-100 text-stone-400 border-stone-200'
                        }`}>
                          {api.connected ? 'Connected' : 'Offline'}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleApiConnection(apiName)}
                        className={`text-[10px] font-bold px-3 py-1 rounded-lg border transition-all ${
                          api.connected
                            ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                            : 'bg-amber-600 hover:bg-amber-500 border-transparent text-white'
                        }`}
                      >
                        {api.connected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>

                    {api.connected && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">Target Endpoint</label>
                          <input
                            type="text"
                            readOnly
                            value={api.endpoint}
                            className="w-full bg-stone-100 border border-stone-200 rounded-lg p-2 text-stone-500 font-mono outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">Access Token / Key</label>
                          <input
                            type="password"
                            placeholder="Enter Key..."
                            value={api.key}
                            onChange={(e) => handleApiKeyChange(apiName, e.target.value)}
                            className="w-full bg-white border border-stone-250 focus:border-amber-500 rounded-lg p-2 text-stone-850 font-mono outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        {/* Right column (1 col) */}
        <div className="xl:col-span-1 space-y-6">
          {/* Default Rules */}
          <section className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 tracking-tight">Agency Pricing Standards</h3>
              <p className="text-[11px] text-stone-400">Configure global margin defaults for custom itineraries.</p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-800 mb-1">
                  <span>Standard Markup</span>
                  <span className="text-amber-750 font-bold">{defaultMarkup}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={defaultMarkup}
                  onChange={(e) => setDefaultMarkup(parseInt(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-800 mb-1">
                  <span>Agent Commission Share</span>
                  <span className="text-amber-750 font-bold">{defaultAgentSplit}% of net margin</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  value={defaultAgentSplit}
                  onChange={(e) => setDefaultAgentSplit(parseInt(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>
            </div>
          </section>

          {/* Branding Customizer */}
          <section className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 tracking-tight">Invoice & Voucher Branding</h3>
              <p className="text-[11px] text-stone-400">Customize generated client correspondence files.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">Brand Corporate Name</label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-250 focus:border-amber-500 rounded-lg p-2 text-xs text-stone-850 outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">Physical Address</label>
                <textarea
                  rows="2"
                  value={agencyAddress}
                  onChange={(e) => setAgencyAddress(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-250 focus:border-amber-500 rounded-lg p-2 text-xs text-stone-850 outline-none resize-none"
                ></textarea>
              </div>

              <div className="pt-2">
                <span className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">Branded Header Preview</span>
                <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 border-dashed text-center">
                  <h4 className="text-xs font-bold text-stone-900 tracking-tight">{agencyName}</h4>
                  <p className="text-[8px] text-stone-400/80">{agencyAddress}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
