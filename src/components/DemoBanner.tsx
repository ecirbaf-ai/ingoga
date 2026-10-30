import React, { useState } from 'react';
import { Sparkles, RotateCcw, Compass, CheckCircle2, ChevronRight, X, User } from 'lucide-react';
import { UserProfile } from '../types';

interface DemoBannerProps {
  currentUser: UserProfile;
  demoUsers: UserProfile[];
  onSwitchRole: (userId: string) => void;
  onResetDemo: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: 'en' | 'rw';
}

export const DemoBanner: React.FC<DemoBannerProps> = ({
  currentUser,
  demoUsers,
  onSwitchRole,
  onResetDemo,
  setActiveTab,
  language,
}) => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  const tourSteps = [
    {
      step: 1,
      title: language === 'en' ? '1. Log Incoming Organic Waste' : '1. Kwakira Ibisigazwa',
      tab: 'biosoil',
      description:
        language === 'en'
          ? 'Record organic potato vines, market vegetable trimmings, or dairy manure from Musanze or Nyabihu wholesale markets. Operators verify purity and reject contaminated loads.'
          : 'Andika ibisigazwa by’ibirayi cyangwa imyanda y’isoko rya Mukamira i Nyabihu. Kora isuzuma ryo kwirinda imyanda yangiza.',
    },
    {
      step: 2,
      title: language === 'en' ? '2. BioSoil Composting & QR Traceability' : '2. Gutunganya BioSoil na QR Kode',
      tab: 'biosoil',
      description:
        language === 'en'
          ? 'Track the thermophilic temperature curve (>55°C to eliminate pathogens). Pass the strict Quality Control Gate and generate an authenticated QR code for farmers.'
          : 'Kurikirana ubushyuhe burenze 55°C bwica udukoko. Emeza ubuziranenge (Quality Gate) ubone kode ya QR ifasha umuguzi kumenya ifumbire.',
    },
    {
      step: 3,
      title: language === 'en' ? '3. FarmGrow Crop Economics' : '3. Imicungire y’Umurima n’Inyungu',
      tab: 'farmgrow',
      description:
        language === 'en'
          ? 'Inspect Jean-Pierre’s Kinigi potato farm. Review input expenses (seeds, labor, BioSoil compost) and see exact real-time cost-per-kg and estimated harvest profit margin.'
          : 'Reba umurima w’ibirayi wa Jean-Pierre i Kinigi. Sesengura ibyakoreshejwe n’inyungu nyakuri y’umuhinzi kuri buri kiro cy’ibirayi.',
    },
    {
      step: 4,
      title: language === 'en' ? '4. IngogaMarket Direct Trading' : '4. Kugurisha Ku Isoko rya IngogaMarket',
      tab: 'market',
      description:
        language === 'en'
          ? 'Browse certified Grade A potatoes and cooperative bulk aggregated listings. Place a buyer order with stock anti-oversell protection and simulated Mobile Money payment.'
          : 'Gura umusaruro w’ibirayi byiza byatoranyijwe. Koresha uburyo bwo kwishyura bwa MoMo buhagarariwe.',
    },
    {
      step: 5,
      title: language === 'en' ? '5. Transparent Financials & Cash Flow' : '5. Raporo y’Imari n’Amafaranga Yinjiye',
      tab: 'finance',
      description:
        language === 'en'
          ? 'Review verified financial segregation: Gross Marketplace Volume is distinct from IngogaBridge 4% commissions, BioSoil sales, and co-op subscriptions. Try the 12-month simulator!'
          : 'Sesengura imari: Umusaruro wose w’abahinzi watandukanye n’inyungu ya 4% ya IngogaBridge n’iy’ifumbire ya BioSoil.',
    },
  ];

  const handleNextTourStep = () => {
    if (currentTourStep < tourSteps.length - 1) {
      const nextStep = currentTourStep + 1;
      setCurrentTourStep(nextStep);
      setActiveTab(tourSteps[nextStep].tab);
    } else {
      setIsTourOpen(false);
      setCurrentTourStep(0);
    }
  };

  const handleStartTour = () => {
    setIsTourOpen(true);
    setCurrentTourStep(0);
    setActiveTab(tourSteps[0].tab);
  };

  const handleReset = async () => {
    if (window.confirm('Reset all demo data to default clean competition state?')) {
      setIsResetting(true);
      await onResetDemo();
      setIsResetting(false);
    }
  };

  return (
    <>
      {/* Top Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 px-3 py-2 text-xs md:text-sm font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-amber-600 text-white shadow-xs">
              DEMO MODE
            </span>
            <span className="hidden sm:inline">
              {language === 'en'
                ? 'Illustrative Rwandan agritech competition data — not verified commercial results.'
                : 'Amakuru y’ikitegererezo mu marushanwa y’ubuhinzi — ntabwo ari inyungu zemewe mu bucuruzi.'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick 5-min tour button */}
            <button
              onClick={handleStartTour}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-800 text-white hover:bg-emerald-700 transition font-medium shadow-xs"
              title="Start 5-Minute Competition Walkthrough"
            >
              <Compass className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'en' ? '5-Min Tour' : 'Urugendo rw’Iminota 5'}</span>
            </button>

            {/* Quick Role Switcher */}
            <div className="flex items-center gap-1.5 bg-white/80 border border-amber-300/60 rounded-md px-2 py-1">
              <User className="w-3.5 h-3.5 text-emerald-800" />
              <label htmlFor="role-select" className="sr-only">Select Role</label>
              <select
                id="role-select"
                value={currentUser.id}
                onChange={(e) => onSwitchRole(e.target.value)}
                className="bg-transparent text-emerald-950 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                {demoUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role.replace('_', ' ').toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Demo Data Button */}
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="inline-flex items-center gap-1 text-xs text-amber-900/80 hover:text-amber-950 transition hover:underline"
              title="Restore original seed records"
            >
              <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">
                {language === 'en' ? 'Reset Data' : 'Kugarura Amakuru'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Guided Tour Modal Card */}
      {isTourOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-emerald-900/10 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-emerald-950/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-950 text-base">
                    {language === 'en' ? 'IngogaBridge Competition Tour' : 'Urugendo rw’Ikitegererezo'}
                  </h3>
                  <p className="text-xs text-emerald-700">
                    Step {currentTourStep + 1} of {tourSteps.length}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTourOpen(false)}
                className="p-1 rounded-md text-emerald-900/60 hover:text-emerald-950 hover:bg-emerald-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <h4 className="font-semibold text-lg text-emerald-900">
                {tourSteps[currentTourStep].title}
              </h4>
              <p className="text-sm text-stone-600 leading-relaxed">
                {tourSteps[currentTourStep].description}
              </p>

              {/* Step indicator progress pills */}
              <div className="flex gap-1.5 pt-2">
                {tourSteps.map((s, idx) => (
                  <button
                    key={s.step}
                    onClick={() => {
                      setCurrentTourStep(idx);
                      setActiveTab(s.tab);
                    }}
                    className={`h-2 flex-1 rounded-full transition-all ${
                      idx === currentTourStep
                        ? 'bg-emerald-700'
                        : idx < currentTourStep
                        ? 'bg-emerald-300'
                        : 'bg-stone-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <button
                onClick={() => setIsTourOpen(false)}
                className="text-xs font-medium text-stone-500 hover:text-stone-800"
              >
                {language === 'en' ? 'Skip Walkthrough' : 'Hagarika'}
              </button>
              <button
                onClick={handleNextTourStep}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-800 text-white text-sm font-semibold hover:bg-emerald-700 transition shadow-sm"
              >
                <span>
                  {currentTourStep === tourSteps.length - 1
                    ? language === 'en'
                      ? 'Finish Tour'
                      : 'Komeza Kurangiza'
                    : language === 'en'
                    ? 'Next Step'
                    : 'Intambwe Ikurikira'}
                </span>
                {currentTourStep === tourSteps.length - 1 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
