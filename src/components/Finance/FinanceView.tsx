import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Download,
  Sliders,
  CheckCircle2,
  Calendar,
  Layers,
  FileSpreadsheet,
  Building,
} from 'lucide-react';
import { PlatformFinancials, SubscriptionPlan } from '../../types';
import { formatRwf } from '../../utils/calculations';
import { translations, Language } from '../../utils/translations';

interface FinanceViewProps {
  financials: PlatformFinancials;
  subscriptionPlans: SubscriptionPlan[];
  language: Language;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  financials,
  subscriptionPlans,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'simulator' | 'plans'>('overview');

  // Simulator Assumptions
  const [simGmvMonthly, setSimGmvMonthly] = useState(5000000); // 5M RWF monthly produce
  const [simCommissionRate, setSimCommissionRate] = useState(4.0); // 4%
  const [simBioSoilBags, setSimBioSoilBags] = useState(60); // 60 bags of 50kg @ 12,500
  const [simCoopSubs, setSimCoopSubs] = useState(4); // 4 co-ops @ 100k
  const [simOpexMonthly, setSimOpexMonthly] = useState(650000); // 650k staff + transport

  const t = translations[language];

  // 12-Month Projection Engine
  const generate12MonthProjection = () => {
    const months = [
      'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6',
      'Month 7', 'Month 8', 'Month 9', 'Month 10', 'Month 11', 'Month 12',
    ];

    let currentCash = 2500000; // Starting seed cash

    return months.map((m, idx) => {
      // 5% monthly compound growth assumption
      const growthFactor = Math.pow(1.05, idx);
      const monthlyGmv = simGmvMonthly * growthFactor;
      const commissionRev = monthlyGmv * (simCommissionRate / 100);
      const bioSoilSales = simBioSoilBags * 12500 * growthFactor;
      const bioSoilCogs = simBioSoilBags * 6800 * growthFactor;
      const subRev = simCoopSubs * 100000 * Math.min(2.5, 1 + idx * 0.1);
      const totalRev = commissionRev + bioSoilSales + subRev;
      const opex = simOpexMonthly * (1 + idx * 0.02);
      const netOperatingIncome = totalRev - bioSoilCogs - opex;
      currentCash += netOperatingIncome;

      return {
        month: m,
        monthlyGmv: Math.round(monthlyGmv),
        totalRevenue: Math.round(totalRev),
        bioSoilCogs: Math.round(bioSoilCogs),
        opex: Math.round(opex),
        netOperatingIncome: Math.round(netOperatingIncome),
        closingCash: Math.round(currentCash),
      };
    });
  };

  const projections = generate12MonthProjection();

  const handleExportCsv = () => {
    let csv = 'Month,Gross Marketplace Volume (RWF),IngogaBridge Total Revenue (RWF),BioSoil COGS (RWF),Operating Expenses (RWF),Net Operating Income (RWF),Closing Cash (RWF)\n';
    projections.forEach((p) => {
      csv += `${p.month},${p.monthlyGmv},${p.totalRevenue},${p.bioSoilCogs},${p.opex},${p.netOperatingIncome},${p.closingCash}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IngogaBridge_12Month_Financial_Model.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Financial Governance & Accounting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
            Platform Revenue & 12-Month Cash Flow Model
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Strict separation of Gross Marketplace Volume (GMV) from IngogaBridge company revenues.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 font-semibold text-xs transition shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-800" />
            <span>Export Projections CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 space-x-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'overview'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Financial Overview
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'simulator'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          12-Month Cash Flow Simulator
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'plans'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Cooperative Subscriptions
        </button>
      </div>

      {/* ================= TAB 1: FINANCIAL OVERVIEW ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Principle Notice */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="block font-bold">Important Agritech Accounting Principle:</strong>
              The full sale price of produce sold by farmers on IngogaMarket is <strong>Gross Marketplace Volume (GMV)</strong>, NOT IngogaBridge company revenue. IngogaBridge recognizes ONLY its transparent <strong>4.0% agent commission</strong>, plus direct <strong>BioSoil compost product sales</strong> and <strong>cooperative software subscriptions</strong>.
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 font-medium">Gross Marketplace Volume</span>
              <div className="text-2xl font-extrabold text-stone-900 mt-1">
                {formatRwf(financials.grossMarketplaceVolumeRwf)}
              </div>
              <span className="text-[11px] text-stone-400">Total farmer crops traded</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 font-medium">Total IngogaBridge Revenue</span>
              <div className="text-2xl font-extrabold text-emerald-900 mt-1">
                {formatRwf(financials.totalPlatformRevenueRwf)}
              </div>
              <span className="text-[11px] text-emerald-700">Commissions + BioSoil + Subs</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 font-medium">Operating Expenses</span>
              <div className="text-2xl font-extrabold text-stone-900 mt-1">
                {formatRwf(financials.operatingExpensesRwf)}
              </div>
              <span className="text-[11px] text-stone-400">Compost staff, transport, cloud</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 font-medium">Estimated Operating Profit</span>
              <div className="text-2xl font-extrabold text-amber-600 mt-1">
                {formatRwf(financials.operatingProfitRwf)}
              </div>
              <span className="text-[11px] text-stone-500">
                Operating margin: {financials.operatingMarginPercent}%
              </span>
            </div>
          </div>

          {/* Revenue Stream Breakdown Table */}
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-stone-100">
              <h3 className="font-bold text-sm text-emerald-950">Revenue Stream Breakdown</h3>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="p-3">Revenue Stream</th>
                  <th className="p-3">Pricing Mechanism</th>
                  <th className="p-3">Recognized Revenue (RWF)</th>
                  <th className="p-3">Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                <tr>
                  <td className="p-3 font-semibold text-stone-900">BioSoil Compost Product Sales</td>
                  <td className="p-3">Packaged 50kg bags @ RWF 12,500 / 25kg bags</td>
                  <td className="p-3 font-bold text-emerald-950">{formatRwf(financials.bioSoilProductSalesRwf)}</td>
                  <td className="p-3">37.8%</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-stone-900">Marketplace Agent Commissions</td>
                  <td className="p-3">4.0% fee on completed produce transactions</td>
                  <td className="p-3 font-bold text-emerald-950">{formatRwf(financials.commissionRevenueRwf)}</td>
                  <td className="p-3">10.7%</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-stone-900">Cooperative Subscriptions</td>
                  <td className="p-3">Tugimbere Co-op Professional Tier @ RWF 100k/mo</td>
                  <td className="p-3 font-bold text-emerald-950">{formatRwf(financials.subscriptionRevenueRwf)}</td>
                  <td className="p-3">26.1%</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-stone-900">Buyer Sourcing & Traceability Services</td>
                  <td className="p-3">Institutional contract quality verification fees</td>
                  <td className="p-3 font-bold text-emerald-950">{formatRwf(financials.buyerServicesRevenueRwf)}</td>
                  <td className="p-3">25.4%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 2: 12-MONTH CASH FLOW SIMULATOR ================= */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          {/* Controls Panel */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <Sliders className="w-5 h-5 text-emerald-800" />
              <h3 className="font-bold text-base text-emerald-950">
                Interactive Growth Assumptions (Competition Simulator)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Monthly Produce Volume: {formatRwf(simGmvMonthly)}
                </label>
                <input
                  type="range"
                  min="2000000"
                  max="20000000"
                  step="500000"
                  value={simGmvMonthly}
                  onChange={(e) => setSimGmvMonthly(Number(e.target.value))}
                  className="w-full accent-emerald-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  BioSoil 50kg Bags Sold / Month: {simBioSoilBags} bags
                </label>
                <input
                  type="range"
                  min="20"
                  max="300"
                  step="10"
                  value={simBioSoilBags}
                  onChange={(e) => setSimBioSoilBags(Number(e.target.value))}
                  className="w-full accent-emerald-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Cooperative Subscribers: {simCoopSubs} co-ops (@ 100k/mo)
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={simCoopSubs}
                  onChange={(e) => setSimCoopSubs(Number(e.target.value))}
                  className="w-full accent-emerald-800"
                />
              </div>
            </div>
          </div>

          {/* Projection Table */}
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <h4 className="font-bold text-sm text-emerald-950">12-Month Financial Projections (Forecast)</h4>
              <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
                Simulated 5% MoM Agritech Growth
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="p-3">Period</th>
                    <th className="p-3">Marketplace GMV</th>
                    <th className="p-3">Platform Revenue</th>
                    <th className="p-3">BioSoil COGS</th>
                    <th className="p-3">Operating Exp.</th>
                    <th className="p-3">Net Operating Income</th>
                    <th className="p-3 font-bold text-emerald-950">Closing Cash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {projections.map((p) => (
                    <tr key={p.month} className="hover:bg-stone-50/50">
                      <td className="p-3 font-bold text-emerald-950">{p.month}</td>
                      <td className="p-3">{formatRwf(p.monthlyGmv)}</td>
                      <td className="p-3 font-bold text-emerald-900">{formatRwf(p.totalRevenue)}</td>
                      <td className="p-3 text-stone-500">{formatRwf(p.bioSoilCogs)}</td>
                      <td className="p-3 text-stone-500">{formatRwf(p.opex)}</td>
                      <td className="p-3 font-bold text-stone-900">{formatRwf(p.netOperatingIncome)}</td>
                      <td className="p-3 font-extrabold text-emerald-950">{formatRwf(p.closingCash)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: SUBSCRIPTION PLANS ================= */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 border flex flex-col justify-between ${
                plan.isPopular
                  ? 'bg-emerald-950 text-white border-emerald-900 shadow-xl'
                  : 'bg-white text-stone-900 border-stone-200 shadow-xs'
              }`}
            >
              <div className="space-y-4">
                {plan.isPopular && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-stone-950">
                    Recommended for Cooperatives
                  </span>
                )}
                <div>
                  <h4 className="font-extrabold text-base">{plan.name}</h4>
                  <div className="mt-2 text-2xl font-black">
                    {formatRwf(plan.monthlyFeeRwf)}
                    <span className="text-xs font-normal text-stone-400"> / month</span>
                  </div>
                </div>

                <ul className="space-y-2 text-xs pt-2 border-t border-stone-200/40">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${plan.isPopular ? 'text-emerald-400' : 'text-emerald-800'}`} />
                      <span className="leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className={`mt-6 w-full py-2.5 rounded-xl font-bold text-xs transition ${
                  plan.isPopular
                    ? 'bg-amber-400 text-stone-950 hover:bg-amber-300'
                    : 'bg-emerald-900 text-white hover:bg-emerald-800'
                }`}
              >
                {plan.tier === 'farmer_free' ? 'Current Free Tier' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
