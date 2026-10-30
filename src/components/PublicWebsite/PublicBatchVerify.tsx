import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Recycle,
  Sprout,
  ArrowLeft,
  ShoppingBag,
} from 'lucide-react';
import { Logo } from '../Logo';
import { apiClient } from '../../api/client';

interface PublicBatchVerifyProps {
  initialBatchId?: string;
  onBack: () => void;
  onOrderProduct?: () => void;
}

export const PublicBatchVerify: React.FC<PublicBatchVerifyProps> = ({
  initialBatchId = 'BS-2026-0001',
  onBack,
  onOrderProduct,
}) => {
  const [batchIdInput, setBatchIdInput] = useState(initialBatchId);
  const [traceability, setTraceability] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBatch = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getBatchTraceability(id);
      setTraceability(data);
    } catch (err: any) {
      setError(err.message || 'Batch certificate not found');
      setTraceability(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialBatchId) {
      fetchBatch(initialBatchId);
    }
  }, [initialBatchId]);

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation & Brand */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-emerald-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to IngogaBridge</span>
          </button>
          <Logo size="sm" />
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-extrabold text-lg text-emerald-950">
                  BioSoil Quality Certificate
                </h1>
                <p className="text-xs text-stone-500">Public QR Verification & Traceability</p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              Verified
            </span>
          </div>

          {/* Search by batch code */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Batch ID (e.g. BS-2026-0001)"
              value={batchIdInput}
              onChange={(e) => setBatchIdInput(e.target.value)}
              className="flex-1 p-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-700"
            />
            <button
              onClick={() => fetchBatch(batchIdInput)}
              className="px-4 py-2.5 bg-emerald-900 text-white font-bold text-xs rounded-xl hover:bg-emerald-800 transition"
            >
              Verify
            </button>
          </div>

          {loading && <p className="text-xs text-stone-500 text-center py-4">Validating certificate...</p>}

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 text-center">
              {error}
            </div>
          )}

          {traceability && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Product & Batch Summary */}
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  Authenticated Batch
                </span>
                <h2 className="text-xl font-black text-emerald-950 mt-0.5">
                  {traceability.productName}
                </h2>
                <div className="text-xs text-stone-600 mt-1 flex flex-wrap gap-4 font-mono font-bold">
                  <span>Batch: {traceability.batchId}</span>
                  <span>Completed: {traceability.completionDate}</span>
                </div>
              </div>

              {/* Feedstock Origin Categories (Private supplier names hidden) */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Feedstock Source Categories (Circular Bio-Inputs)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {traceability.inputMaterialCategories.map((cat: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-stone-100 text-stone-800 text-xs font-semibold capitalize flex items-center gap-1.5"
                    >
                      <Recycle className="w-3.5 h-3.5 text-emerald-700" />
                      {cat.replace('_', ' ')}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-stone-400 italic">
                  *Feedstock sustainably collected from Rwandan agricultural wholesale markets and sorted for zero contamination.
                </p>
              </div>

              {/* Verified Biological Standards */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3 text-xs">
                <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                  Quality Assurance Compliance
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-stone-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Thermophilic Sanitization &gt;55°C</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Curing Maturity Passed</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>100% Weed & Pathogen Free</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Rwanda RS 459 Standard Certified</span>
                  </div>
                </div>

                {traceability.qualityReview?.labNotes && (
                  <div className="p-3 bg-white rounded-xl border border-stone-200 text-[11px] text-stone-600">
                    <strong className="block text-emerald-950 font-semibold mb-0.5">Laboratory Analysis Signoff:</strong>
                    {traceability.qualityReview.labNotes}
                  </div>
                )}
              </div>

              {/* Application Guidance */}
              <div className="space-y-1.5 text-xs text-stone-600">
                <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                  Agronomic Application Instructions
                </h3>
                <p className="leading-relaxed">
                  Incorporate 250g - 500g per planting hill for Irish potatoes, climbing beans, and maize at land preparation or planting. Store bags elevated on wooden pallets in a dry, shaded shelter.
                </p>
              </div>

              {/* Reorder / Contact action */}
              <div className="pt-2">
                <button
                  onClick={onOrderProduct || onBack}
                  className="w-full py-3 rounded-xl bg-emerald-900 text-white font-bold text-xs hover:bg-emerald-800 transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-300" />
                  <span>Order More Certified BioSoil Compost</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
