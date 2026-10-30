import React from 'react';
import { X, Shield, Lock, FileText } from 'lucide-react';

interface TermsPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsPrivacyModal: React.FC<TermsPrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto animate-in zoom-in-95 text-xs">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-800" />
            <h2 className="text-lg font-bold text-emerald-950">IngogaBridge Terms & Data Protection</h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-stone-700 leading-relaxed">
          <section className="space-y-1.5">
            <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-700" />
              1. Farmer Data Privacy & Security
            </h3>
            <p>
              IngogaBridge complies with Rwandan Law Nº 058/2021 relating to the protection of personal data and privacy. Personal contact details, farm boundary locations, and internal financial production records are never exposed publicly. On the marketplace, contact coordinates are masked until an order is confirmed.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-700" />
              2. Marketplace Agency & Commission Terms
            </h3>
            <p>
              IngogaBridge operates as a verified agritech facilitator and agent connecting agricultural producers with buyers. The platform applies a transparent, pre-disclosed 4.0% commission exclusively on completed, fulfilled, and paid transactions. IngogaBridge does not take custody of customer funds without appropriate regulatory authorization.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-700" />
              3. BioSoil Quality Assurance Standards
            </h3>
            <p>
              All BioSoil batches must undergo thermophilic temperature validation (&gt;55°C) and curing checks compliant with Rwanda RS 459 standards for organic soil conditioners. Public QR codes display verified quality parameters without exposing proprietary supplier locations or internal costing structures.
            </p>
          </section>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-emerald-900 text-white font-bold hover:bg-emerald-800 transition"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
