import React from 'react';
import { Logo } from './Logo';
import { Leaf, Shield, Award, Phone, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onOpenPrivacyTerms: () => void;
  language: 'en' | 'rw';
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacyTerms, language }) => {
  return (
    <footer className="bg-emerald-950 text-emerald-100/80 border-t border-emerald-900 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-emerald-800/60">
          {/* Col 1: Brand & Slogan */}
          <div className="space-y-4 md:col-span-1">
            <div className="bg-white/10 p-2 rounded-xl inline-block">
              <Logo size="md" className="text-white" />
            </div>
            <p className="text-xs text-emerald-200/90 italic font-medium leading-relaxed">
              &ldquo;{language === 'en' ? 'From Waste to Wealth. From Farms to Markets.' : 'Kuva ku Bisigazwa Kugeza ku Bukire. Kuva ku Murima Kugera ku Isoko.'}&rdquo;
            </p>
            <p className="text-xs text-emerald-300/70 leading-relaxed">
              Integrated circular agritech company connecting organic waste recycling, fortified BioSoil composting, farm enterprise management, and fair marketplace trading across Rwanda.
            </p>
            <div className="flex items-center gap-3 pt-1 text-emerald-300">
              <div className="flex items-center gap-1 text-[11px]">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Waste</span>
              </div>
              <div className="flex items-center gap-1 text-[11px]">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>RAB Standard RS 459</span>
              </div>
            </div>
          </div>

          {/* Col 2: The Three Pillars */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Divisions & Solutions
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="font-semibold text-white">BioSoil Rwanda:</span>
                <p className="text-emerald-300/70">Organic waste collection, batch thermophilic composting & certified soil nutrition.</p>
              </li>
              <li>
                <span className="font-semibold text-white">FarmGrow Enterprise:</span>
                <p className="text-emerald-300/70">Digital plot records, expense budgeting, harvest logging & profit calculators.</p>
              </li>
              <li>
                <span className="font-semibold text-white">IngogaMarket:</span>
                <p className="text-emerald-300/70">Produce marketplace linking farmers and cooperatives with institutional wholesale buyers.</p>
              </li>
            </ul>
          </div>

          {/* Col 3: Operations & Hubs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Rwandan Hubs & Presence
            </h4>
            <ul className="space-y-2.5 text-xs text-emerald-300/80">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Musanze BioSoil Plant:</strong> Muhoza Sector, Northern Province
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Nyabihu Aggregation Hub:</strong> Mukamira Market, Western Province
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Kigali Operations & Market Desk:</strong> Nyarugenge District
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Institutional & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Governance & Support
            </h4>
            <ul className="space-y-2 text-xs text-emerald-300/80">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>support@ingogabridge.rw</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>+250 788 100 201</span>
              </li>
              <li className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>RDB Registered Enterprise</span>
              </li>
              <li className="pt-2">
                <button
                  onClick={onOpenPrivacyTerms}
                  className="text-xs text-amber-300 underline hover:text-white"
                >
                  Privacy Policy & Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-emerald-400/60 gap-3">
          <p>© {new Date().getFullYear()} IngogaBridge Agritech Rwanda. All rights reserved.</p>
          <p>Designed for Rwandan smallholder farmers, cooperatives and circular agribusiness.</p>
        </div>
      </div>
    </footer>
  );
};
