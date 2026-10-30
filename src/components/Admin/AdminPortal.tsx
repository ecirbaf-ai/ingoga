import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Settings,
  History,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  Building,
} from 'lucide-react';
import { UserProfile, PlatformFinancials } from '../../types';
import { formatRwf } from '../../utils/calculations';
import { translations, Language } from '../../utils/translations';

interface AdminPortalProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  financials: PlatformFinancials;
  onResetDemo: () => Promise<void>;
  language: Language;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentUser,
  allUsers,
  financials,
  onResetDemo,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'audit'>('users');
  const [commissionRate, setCommissionRate] = useState('4.0');
  const [isSaved, setIsSaved] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const t = translations[language];

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all demo database records?')) {
      setIsResetting(true);
      await onResetDemo();
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
            Platform Administration & Audit
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            System configuration, user role authorization, commission rates, and compliance logs.
          </p>
        </div>

        <button
          onClick={handleReset}
          disabled={isResetting}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 text-white font-semibold text-xs hover:bg-amber-500 transition shadow-xs"
        >
          <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
          <span>Reset Demo Environment</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 space-x-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'users'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          User Roles & Access ({allUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'settings'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Commission & Fee Parameters
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'audit'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Audit Trail
        </button>
      </div>

      {/* Tab 1: Users */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-emerald-950">Authorized Accounts by Role</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="p-3">User ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Organization</th>
                  <th className="p-3">District</th>
                  <th className="p-3">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/50">
                    <td className="p-3 font-mono font-bold text-emerald-950">{u.id}</td>
                    <td className="p-3 font-semibold text-stone-900">{u.name}</td>
                    <td className="p-3 text-stone-500">{u.email}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3">{u.organization || 'Independent'}</td>
                    <td className="p-3">{u.district}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs max-w-xl mx-auto">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-bold text-base text-emerald-950">Marketplace Fee Configuration</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Set transparent commission rates applied on completed farmer transactions.
            </p>
          </div>

          {isSaved && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Commission fee settings updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-800 mb-1">
                Standard Produce Commission Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-stone-300 font-bold text-sm"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Default rate is 4.0% for certified agricultural transactions.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-stone-800 mb-1">
                Default Currency
              </label>
              <input
                type="text"
                value="RWF (Rwandan Franc)"
                disabled
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-500 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-900 text-white font-semibold hover:bg-emerald-800 transition"
            >
              Save Configuration
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xs">
          <h3 className="font-bold text-base text-emerald-950">System Security & Quality Audit Trail</h3>
          <div className="space-y-3">
            {[
              {
                time: '2026-10-26 14:10',
                actor: 'Emmanuel Mugabo (Operator)',
                action: 'QUALITY_GATE_APPROVAL',
                details: 'Batch BS-2026-0001 verified for RAB RS 459 standard compliance and QR generated.',
              },
              {
                time: '2026-10-25 15:30',
                actor: 'David Gasana (Buyer)',
                action: 'MARKETPLACE_ORDER_SETTLED',
                details: 'Order ORD-2026-8812 marked completed; 4% commission of RWF 61,920 recorded.',
              },
              {
                time: '2026-10-24 09:15',
                actor: 'Emmanuel Mugabo (Operator)',
                action: 'CONTAMINATED_WASTE_REJECTION',
                details: 'Feedstock WC-2026-0107 from Rubavu rejected due to chemical residue.',
              },
            ].map((log, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-start justify-between text-xs">
                <div>
                  <div className="font-bold text-stone-900">{log.action}</div>
                  <p className="text-stone-600 mt-0.5">{log.details}</p>
                  <span className="text-[10px] text-emerald-800 font-semibold">{log.actor}</span>
                </div>
                <span className="text-[10px] text-stone-400">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
