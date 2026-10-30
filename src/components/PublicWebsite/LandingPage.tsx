import React from 'react';
import {
  Sprout,
  Store,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Recycle,
  CheckCircle,
  Truck,
  Users,
  Award,
} from 'lucide-react';
import { translations, Language } from '../../utils/translations';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
  language: Language;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, language }) => {
  const t = translations[language];

  return (
    <div className="space-y-16 py-6 pb-20">
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-900 via-emerald-900 to-emerald-950 text-white shadow-xl mx-4 sm:mx-6 lg:mx-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#a7f3d0_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative max-w-5xl mx-auto px-6 py-16 sm:py-24 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-700/60 text-xs font-semibold text-emerald-200 tracking-wide uppercase shadow-xs">
            <Recycle className="w-4 h-4 text-amber-400" />
            <span>Rwanda Circular Agritech Ecosystem</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
            From Waste to Wealth.{' '}
            <span className="text-emerald-400 block sm:inline">From Farms to Markets.</span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-xl text-emerald-100/90 leading-relaxed font-normal">
            A connected agricultural ecosystem transforming suitable organic waste into certified
            BioSoil compost, helping Rwandan smallholders manage farm profitability, and linking
            verified harvests directly to paying buyers.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onNavigate('farmgrow')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-sm hover:bg-amber-400 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Sprout className="w-4 h-4" />
              <span>{t.joinFarmer}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('biosoil')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-800 text-white font-bold text-sm border border-emerald-600 hover:bg-emerald-700 transition shadow-md"
            >
              <Recycle className="w-4 h-4 text-emerald-300" />
              <span>{t.exploreProducts}</span>
            </button>

            <button
              onClick={() => onNavigate('market')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-emerald-950 font-bold text-sm hover:bg-emerald-50 transition shadow-md"
            >
              <Store className="w-4 h-4 text-emerald-700" />
              <span>{t.browseMarket}</span>
            </button>
          </div>

          {/* Trust badges */}
          <div className="pt-6 border-t border-emerald-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-emerald-200/80">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              RAB Standards RS 459 Checked
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Transparent 4% Market Commission
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Smallholder Profit Tracking
            </span>
          </div>
        </div>
      </section>

      {/* ================= CIRCULAR PROCESS DIAGRAM ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
              Circular Value Creation
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-stone-900">
              {t.processHeading}
            </h3>
            <p className="text-sm text-stone-600 mt-2">
              How IngogaBridge links organic waste collection, soil nutrition, farm profitability, and wholesale market access into one continuous loop.
            </p>
          </div>

          {/* Step flow cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 font-bold flex items-center justify-center text-sm mb-3">
                  <Recycle className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-amber-950 mb-1">{t.step1}</h4>
                <p className="text-xs text-stone-600 leading-relaxed">{t.step1Desc}</p>
              </div>
              <span className="mt-4 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                Raw Feedstock
              </span>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-800 font-bold flex items-center justify-center text-sm mb-3">
                  <Sprout className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-emerald-950 mb-1">{t.step2}</h4>
                <p className="text-xs text-stone-600 leading-relaxed">{t.step2Desc}</p>
              </div>
              <span className="mt-4 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                BioSoil Certified
              </span>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-stone-200 text-stone-800 font-bold flex items-center justify-center text-sm mb-3">
                  <TrendingUp className="w-5 h-5 text-emerald-800" />
                </div>
                <h4 className="font-bold text-sm text-stone-900 mb-1">{t.step3}</h4>
                <p className="text-xs text-stone-600 leading-relaxed">{t.step3Desc}</p>
              </div>
              <span className="mt-4 text-[10px] font-bold text-stone-700 uppercase tracking-wider">
                Farm Management
              </span>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-700/20 text-emerald-900 font-bold flex items-center justify-center text-sm mb-3">
                  <Store className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-emerald-950 mb-1">{t.step4}</h4>
                <p className="text-xs text-stone-600 leading-relaxed">{t.step4Desc}</p>
              </div>
              <span className="mt-4 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                Paying Markets
              </span>
            </div>

            {/* Step 5 */}
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-300/80 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-900 font-bold flex items-center justify-center text-sm mb-3">
                  <Recycle className="w-5 h-5 text-emerald-800" />
                </div>
                <h4 className="font-bold text-sm text-amber-950 mb-1">{t.step5}</h4>
                <p className="text-xs text-stone-600 leading-relaxed">{t.step5Desc}</p>
              </div>
              <span className="mt-4 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                Zero-Waste Return
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= THE THREE DIVISIONS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
            Integrated Agritech Platform
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-stone-900">
            Three Divisions, One Unified Engine
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: BioSoil */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs hover:border-emerald-700 transition flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-44 w-full rounded-2xl overflow-hidden bg-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80"
                  alt="BioSoil compost production"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                  Division 1
                </span>
                <h4 className="text-xl font-bold text-emerald-950 mt-1">BioSoil</h4>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  Controlled industrial composting turning potato vines, market waste, and livestock manure into high-fertility soil improvers. Features batch temperature monitoring, quality testing, and public QR traceability.
                </p>
              </div>
              <ul className="space-y-1.5 text-xs text-stone-700 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                  Thermophilic sanitization (&gt;55°C)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                  RAB standards compliance review
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                  Batch QR traceability certificates
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('biosoil')}
              className="mt-6 w-full py-2.5 rounded-xl bg-emerald-900 text-white font-semibold text-xs hover:bg-emerald-800 transition flex items-center justify-center gap-2"
            >
              <span>Explore BioSoil Batches</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: FarmGrow */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs hover:border-emerald-700 transition flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-44 w-full rounded-2xl overflow-hidden bg-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80"
                  alt="Rwandan potato farming"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Division 2
                </span>
                <h4 className="text-xl font-bold text-emerald-950 mt-1">FarmGrow</h4>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  Mobile-friendly farm management designed for Rwandan smallholder farmers and cooperatives. Plan crop seasons, record seed and fertilizer inputs, log harvests, and calculate net profitability per kilogram.
                </p>
              </div>
              <ul className="space-y-1.5 text-xs text-stone-700 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                  Field & crop cycle planning
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                  Real-time profit & cost-per-kg calculation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                  1-Click BioSoil input logging
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('farmgrow')}
              className="mt-6 w-full py-2.5 rounded-xl bg-emerald-900 text-white font-semibold text-xs hover:bg-emerald-800 transition flex items-center justify-center gap-2"
            >
              <span>Manage Farm Records</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: IngogaMarket */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs hover:border-emerald-700 transition flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-44 w-full rounded-2xl overflow-hidden bg-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80"
                  alt="Produce marketplace"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                  Division 3
                </span>
                <h4 className="text-xl font-bold text-emerald-950 mt-1">IngogaMarket</h4>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  B2B produce marketplace connecting farmers and cooperatives with institutional buyers, retail supermarkets, and wholesalers. Features bulk co-op aggregation, stock anti-oversell, and transparent commission accounting.
                </p>
              </div>
              <ul className="space-y-1.5 text-xs text-stone-700 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                  Verified crop listings with grade specs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                  Cooperative member aggregation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                  Simulated MoMo and bank settlement
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('market')}
              className="mt-6 w-full py-2.5 rounded-xl bg-emerald-900 text-white font-semibold text-xs hover:bg-emerald-800 transition flex items-center justify-center gap-2"
            >
              <span>Browse Produce Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ================= IMPACT METRICS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-emerald-900 text-white p-8 sm:p-12 shadow-md">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-400">15.5 Tons</div>
              <div className="text-xs text-emerald-200 mt-1 font-medium">Organic Waste Diverted</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">6,200 kg</div>
              <div className="text-xs text-emerald-200 mt-1 font-medium">BioSoil Compost Produced</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-400">142+</div>
              <div className="text-xs text-emerald-200 mt-1 font-medium">Co-op Farmers Engaged</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">4.1M RWF</div>
              <div className="text-xs text-emerald-200 mt-1 font-medium">Market Produce Traded</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
