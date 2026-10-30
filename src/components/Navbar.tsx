import React, { useState } from 'react';
import {
  Sprout,
  Store,
  DollarSign,
  ShieldCheck,
  QrCode,
  Bell,
  Menu,
  X,
  Globe,
  Home,
  Check,
} from 'lucide-react';
import { Logo } from './Logo';
import { UserProfile } from '../types';
import { translations, Language } from '../utils/translations';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserProfile;
  language: Language;
  setLanguage: (lang: Language) => void;
  notifications: any[];
  onOpenVerifyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  language,
  setLanguage,
  notifications,
  onOpenVerifyModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const t = translations[language];

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const navItems = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'biosoil', label: t.bioSoil, icon: Sprout },
    { id: 'farmgrow', label: t.farmGrow, icon: Sprout },
    { id: 'market', label: t.ingogaMarket, icon: Store },
    { id: 'finance', label: t.financials, icon: DollarSign },
  ];

  if (currentUser.role === 'admin') {
    navItems.push({ id: 'admin', label: t.admin, icon: ShieldCheck });
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <button
            onClick={() => {
              setActiveTab('home');
              setMobileMenuOpen(false);
            }}
            className="flex items-center text-left focus:outline-hidden"
          >
            <Logo size="md" />
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-emerald-900 text-white shadow-xs'
                      : 'text-stone-700 hover:text-emerald-900 hover:bg-emerald-50/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-stone-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {/* Batch QR Verification Quick Action */}
            <button
              onClick={onOpenVerifyModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-emerald-900/20 text-emerald-900 bg-emerald-50 hover:bg-emerald-100 transition shadow-xs"
              title="Verify BioSoil Batch via QR"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Verify Batch QR</span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'rw' : 'en')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 transition"
              title="Toggle Language (English / Kinyarwanda)"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-800" />
              <span className="uppercase">{language}</span>
            </button>

            {/* In-App Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg text-stone-600 hover:text-emerald-900 hover:bg-stone-100 transition"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-stone-200 p-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-2">
                    <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      {t.notifications} ({notifications.length})
                    </span>
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="text-xs text-stone-400 hover:text-stone-700"
                    >
                      {t.close}
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-stone-500 py-4 text-center">No new notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-2.5 rounded-lg bg-stone-50 border border-stone-100 text-xs"
                        >
                          <div className="font-semibold text-emerald-950 flex items-center justify-between">
                            <span>{n.title}</span>
                            <span className="text-[10px] text-stone-400 font-normal">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-stone-600 mt-0.5 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Badge */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-stone-200">
              <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-emerald-950 leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] font-medium text-emerald-700 capitalize">
                  {currentUser.district}
                </span>
              </div>
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-700 hover:bg-stone-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                  isActive
                    ? 'bg-emerald-900 text-white'
                    : 'text-stone-700 hover:bg-emerald-50 hover:text-emerald-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-300' : 'text-stone-400'}`} />
                <span>{item.label}</span>
                {isActive && <Check className="w-4 h-4 ml-auto text-emerald-300" />}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
