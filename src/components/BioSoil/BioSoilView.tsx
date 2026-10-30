import React, { useState } from 'react';
import {
  Recycle,
  CheckCircle2,
  XCircle,
  Plus,
  QrCode,
  Thermometer,
  Droplet,
  Clock,
  Printer,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { WasteCollection, ProductionBatch, BioSoilProduct, UserProfile } from '../../types';
import { calculateBatchEconomics, formatRwf } from '../../utils/calculations';
import { translations, Language } from '../../utils/translations';
import { generateQrDataUrl } from '../../utils/qr';

interface BioSoilViewProps {
  currentUser: UserProfile;
  collections: WasteCollection[];
  batches: ProductionBatch[];
  products: BioSoilProduct[];
  onAddCollection: (data: any) => Promise<void>;
  onCreateBatch: (data: any) => Promise<void>;
  onSubmitQualityReview: (batchId: string, review: any) => Promise<void>;
  language: Language;
}

export const BioSoilView: React.FC<BioSoilViewProps> = ({
  currentUser,
  collections,
  batches,
  products,
  onAddCollection,
  onCreateBatch,
  onSubmitQualityReview,
  language,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'collections' | 'batches' | 'quality' | 'products'>('collections');
  const [isLogWasteModalOpen, setIsLogWasteModalOpen] = useState(false);
  const [isNewBatchModalOpen, setIsNewBatchModalOpen] = useState(false);
  const [selectedBatchForReview, setSelectedBatchForReview] = useState<ProductionBatch | null>(null);
  const [qrModalData, setQrModalData] = useState<{ batchId: string; qrUrl: string; productName: string } | null>(null);

  // Form states for Logging Waste
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [materialCategory, setMaterialCategory] = useState<'market_vegetables' | 'crop_residue' | 'livestock_manure' | 'agro_processing'>('market_vegetables');
  const [estimatedWeightKg, setEstimatedWeightKg] = useState('3500');
  const [acceptedWeightKg, setAcceptedWeightKg] = useState('3400');
  const [collectionLocation, setCollectionLocation] = useState('Nyabihu District, Mukamira Market');
  const [collectionCostRwf, setCollectionCostRwf] = useState('40000');
  const [transportCostRwf, setTransportCostRwf] = useState('30000');
  const [contaminationObservations, setContaminationObservations] = useState('');
  const [wasteStatus, setWasteStatus] = useState<'accepted' | 'rejected'>('accepted');
  const [rejectionReason, setRejectionReason] = useState('');

  // Form states for New Batch
  const [batchProductName, setBatchProductName] = useState('BioSoil Fortified Organic Compost');
  const [selectedWasteInput, setSelectedWasteInput] = useState<string[]>(['crop_residue', 'market_vegetables']);
  const [totalInputKg, setTotalInputKg] = useState('10000');

  // Form states for Quality Review
  const [reviewerName, setReviewerName] = useState(currentUser.name || 'Dr. Aloys Habineza');
  const [moistureSatisfactory, setMoistureSatisfactory] = useState(true);
  const [tempCurveVerified, setTempCurveVerified] = useState(true);
  const [curingPassed, setCuringPassed] = useState(true);
  const [weedPathogenFree, setWeedPathogenFree] = useState(true);
  const [labNotes, setLabNotes] = useState('Tested compliant with RS 459 standard. C:N ratio 16:1, Organic matter > 45%.');
  const [decision, setDecision] = useState<'approved' | 'rejected'>('approved');
  const [finalOutputKg, setFinalOutputKg] = useState('5500');
  const [reviewError, setReviewError] = useState<string | null>(null);

  const t = translations[language];

  const handleCreateWaste = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddCollection({
      supplierName,
      supplierPhone,
      materialCategory,
      estimatedWeightKg: Number(estimatedWeightKg),
      acceptedWeightKg: wasteStatus === 'accepted' ? Number(acceptedWeightKg) : 0,
      collectionLocation,
      collectionCostRwf: Number(collectionCostRwf),
      transportCostRwf: Number(transportCostRwf),
      contaminationObservations,
      status: wasteStatus,
      rejectionReason: wasteStatus === 'rejected' ? rejectionReason : undefined,
      operatorName: currentUser.name,
    });
    setIsLogWasteModalOpen(false);
  };

  const handleCreateBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateBatch({
      productName: batchProductName,
      inputMaterials: selectedWasteInput.map((cat) => ({
        category: cat,
        weightKg: Math.round(Number(totalInputKg) / selectedWasteInput.length),
      })),
      totalInputWeightKg: Number(totalInputKg),
      operatorName: currentUser.name,
    });
    setIsNewBatchModalOpen(false);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    if (!selectedBatchForReview) return;

    try {
      await onSubmitQualityReview(selectedBatchForReview.id, {
        reviewerName,
        moistureSatisfactory,
        temperatureCurveVerified: tempCurveVerified,
        curingMaturityPassed: curingPassed,
        weedPathogenFree,
        labTested: true,
        labNotes,
        decision,
        decisionNotes: decision === 'approved' ? 'Meets all biological and moisture parameters.' : 'Batch failed safety check.',
        finalOutputWeightKg: Number(finalOutputKg),
      });
      setSelectedBatchForReview(null);
    } catch (err: any) {
      setReviewError(err.message || 'Quality approval rejected by gate policy');
    }
  };

  const handleOpenQrModal = async (batch: ProductionBatch) => {
    const url = `${window.location.origin}/verify-batch/${batch.batchId}`;
    const qrDataUrl = await generateQrDataUrl(url);
    setQrModalData({
      batchId: batch.batchId,
      productName: batch.productName,
      qrUrl: qrDataUrl,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
            <Recycle className="w-3.5 h-3.5" />
            <span>BioSoil Circular Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
            BioSoil Composting & Quality Assurance
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Tracking organic feedstock collection, thermophilic bioprocessing, laboratory quality gates, and QR-authenticated organic soil products.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsLogWasteModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 text-white font-semibold text-xs hover:bg-amber-500 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t.recordWaste}</span>
          </button>
          <button
            onClick={() => setIsNewBatchModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-900 text-white font-semibold text-xs hover:bg-emerald-800 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t.createBatch}</span>
          </button>
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className="flex border-b border-stone-200 space-x-4">
        {[
          { id: 'collections', label: 'Waste Collections', count: collections.length },
          { id: 'batches', label: 'Processing Batches', count: batches.length },
          { id: 'quality', label: 'Quality Control Gate', count: batches.filter((b) => b.status === 'processing' || b.status === 'quality_review').length },
          { id: 'products', label: 'Packaged Products & QR', count: products.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
              activeSubTab === tab.id
                ? 'border-emerald-800 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-stone-100 text-stone-700">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ================= TAB 1: WASTE COLLECTIONS ================= */}
      {activeSubTab === 'collections' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-stone-200">
              <span className="text-xs text-stone-500 font-medium">Total Feedstock Received</span>
              <div className="text-2xl font-bold text-emerald-950 mt-1">
                {collections.reduce((sum, c) => sum + c.acceptedWeightKg, 0).toLocaleString()} kg
              </div>
              <span className="text-[11px] text-emerald-700">From Musanze, Nyabihu & Kigali markets</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-stone-200">
              <span className="text-xs text-stone-500 font-medium">Total Feedstock Logistics Cost</span>
              <div className="text-2xl font-bold text-stone-900 mt-1">
                {formatRwf(collections.reduce((sum, c) => sum + c.collectionCostRwf + c.transportCostRwf, 0))}
              </div>
              <span className="text-[11px] text-stone-500">Collection fee + truck transport</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-stone-200">
              <span className="text-xs text-stone-500 font-medium">Contamination Rejections</span>
              <div className="text-2xl font-bold text-amber-700 mt-1">
                {collections.filter((c) => c.status === 'rejected').length} Loads Rejected
              </div>
              <span className="text-[11px] text-stone-500">Strict bio-safety screen enforced</span>
            </div>
          </div>

          {/* Collections Table */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-emerald-950">Logged Feedstock Deliveries</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3">Ref ID</th>
                    <th className="p-3">Supplier / Market</th>
                    <th className="p-3">Material Category</th>
                    <th className="p-3">Accepted / Est. Weight</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Cost (RWF)</th>
                    <th className="p-3">Bio-Safety Status</th>
                    <th className="p-3">Operator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {collections.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50/50">
                      <td className="p-3 font-bold text-emerald-950">{c.collectionRef}</td>
                      <td className="p-3">
                        <div className="font-medium text-stone-900">{c.supplierName}</div>
                        <div className="text-[10px] text-stone-400">{c.supplierPhone}</div>
                      </td>
                      <td className="p-3 capitalize">{c.materialCategory.replace('_', ' ')}</td>
                      <td className="p-3">
                        <span className="font-bold text-stone-900">{c.acceptedWeightKg.toLocaleString()} kg</span>
                        <span className="text-stone-400 text-[10px] block">Est: {c.estimatedWeightKg.toLocaleString()} kg</span>
                      </td>
                      <td className="p-3">{c.collectionLocation}</td>
                      <td className="p-3 font-medium">
                        {formatRwf(c.collectionCostRwf + c.transportCostRwf)}
                      </td>
                      <td className="p-3">
                        {c.status === 'accepted' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Accepted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800" title={c.rejectionReason}>
                            <XCircle className="w-3 h-3" />
                            Rejected
                          </span>
                        )}
                        {c.contaminationObservations && (
                          <span className="text-[10px] text-stone-500 block truncate max-w-xs mt-0.5">
                            {c.contaminationObservations}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-stone-600">{c.operatorName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: BATCHES & PROCESSING ================= */}
      {activeSubTab === 'batches' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {batches.map((batch) => {
              const eco = calculateBatchEconomics({
                materialCollectionCostRwf: 65000,
                transportCostRwf: 45000,
                processingCostRwf: batch.processingCostRwf,
                laborCostRwf: batch.laborCostRwf,
                testingCostRwf: batch.testingCostRwf,
                finalOutputWeightKg: batch.finalOutputWeightKg || batch.totalInputWeightKg * 0.45,
              });

              return (
                <div key={batch.id} className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {batch.batchId}
                      </span>
                      <h3 className="font-bold text-base text-emerald-950 mt-1">{batch.productName}</h3>
                      <p className="text-xs text-stone-500">Started: {batch.startDate}</p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      batch.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : batch.status === 'processing'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-stone-100 text-stone-800'
                    }`}>
                      {batch.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Stage Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-semibold text-stone-700">
                      <span>Current Stage: <strong className="text-emerald-900 capitalize">{batch.currentStage.replace('_', ' ')}</strong></span>
                      <span>Output: {batch.finalOutputWeightKg ? `${batch.finalOutputWeightKg.toLocaleString()} kg` : 'In processing'}</span>
                    </div>
                    <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden flex">
                      <div className={`h-full ${batch.status === 'approved' ? 'w-full bg-emerald-700' : 'w-3/5 bg-amber-500 animate-pulse'}`} />
                    </div>
                  </div>

                  {/* Processing Logs / Temperature */}
                  <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 space-y-2">
                    <div className="text-xs font-bold text-stone-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                        Temperature & Moisture Records
                      </span>
                      <span className="text-[10px] text-stone-500">{batch.temperatureLogs.length} logs recorded</span>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {batch.temperatureLogs.map((log, idx) => (
                        <div key={idx} className="text-[11px] bg-white p-2 rounded-lg border border-stone-200/60 flex items-center justify-between">
                          <span className="font-semibold text-stone-900 capitalize">{log.stage.replace('_', ' ')}</span>
                          <span className="text-amber-700 font-bold">{log.temperatureCelsius}°C</span>
                          <span className="text-blue-700 font-medium">{log.moisturePercent}% H2O</span>
                          <span className="text-[10px] text-stone-400">{log.recordedAt.split(' ')[0]}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Batch Economics Breakdown */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-stone-100">
                    <div>
                      <span className="text-stone-400">Total Batch Cost:</span>
                      <div className="font-bold text-stone-900">{formatRwf(eco.totalBatchCostRwf)}</div>
                    </div>
                    <div>
                      <span className="text-stone-400">Cost per kg:</span>
                      <div className="font-bold text-emerald-800">{formatRwf(eco.costPerKgRwf)} / kg</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2">
                    {batch.status === 'approved' ? (
                      <button
                        onClick={() => handleOpenQrModal(batch)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-800 text-emerald-800 text-xs font-semibold hover:bg-emerald-50 transition"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>View Batch QR Code</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedBatchForReview(batch);
                          setActiveSubTab('quality');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                        <span>Enter Quality Control Review</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 3: QUALITY CONTROL REVIEW (APPROVAL GATE) ================= */}
      {activeSubTab === 'quality' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs max-w-3xl mx-auto">
          <div className="border-b border-stone-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Quality Assurance Compliance
            </span>
            <h2 className="text-xl font-extrabold text-emerald-950 mt-1">
              RAB Standard RS 459 Quality Gate
            </h2>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Mandatory verification of thermophilic curve (&gt;55°C for 14 days), moisture, weed seed destruction, and laboratory analysis. An unapproved batch cannot be sold or packaged.
            </p>
          </div>

          {reviewError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{reviewError}</span>
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">Select Batch to Review</label>
              <select
                value={selectedBatchForReview?.id || batches[0]?.id}
                onChange={(e) => {
                  const b = batches.find((item) => item.id === e.target.value);
                  setSelectedBatchForReview(b || null);
                }}
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-emerald-700"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchId} — {b.productName} ({b.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">Reviewing Agronomist / Inspector</label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">Final Refined Output Weight (kg)</label>
                <input
                  type="number"
                  value={finalOutputKg}
                  onChange={(e) => setFinalOutputKg(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs"
                />
              </div>
            </div>

            {/* Checklist items */}
            <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Inspection Criteria Checklist
              </h4>

              <label className="flex items-center gap-3 text-xs text-stone-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempCurveVerified}
                  onChange={(e) => setTempCurveVerified(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700"
                />
                <span>Thermophilic temperature curve documented (&gt;55°C maintained for pathogen pasteurization)</span>
              </label>

              <label className="flex items-center gap-3 text-xs text-stone-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={moistureSatisfactory}
                  onChange={(e) => setMoistureSatisfactory(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700"
                />
                <span>Moisture content between 40% and 55% at final screening</span>
              </label>

              <label className="flex items-center gap-3 text-xs text-stone-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={curingPassed}
                  onChange={(e) => setCuringPassed(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700"
                />
                <span>Curing maturity verified (Solvita index &gt; 7, earthy pleasant smell, no ammonia)</span>
              </label>

              <label className="flex items-center gap-3 text-xs text-stone-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={weedPathogenFree}
                  onChange={(e) => setWeedPathogenFree(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700"
                />
                <span>Germination bioassay test passed (100% free from viable weed seeds)</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">RAB / Affiliate Laboratory Notes</label>
              <textarea
                value={labNotes}
                onChange={(e) => setLabNotes(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs"
              />
            </div>

            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-emerald-900 cursor-pointer">
                <input
                  type="radio"
                  name="decision"
                  checked={decision === 'approved'}
                  onChange={() => setDecision('approved')}
                  className="text-emerald-800 focus:ring-emerald-700"
                />
                <span>Approve for Commercial Packaging & QR Generation</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-red-900 cursor-pointer">
                <input
                  type="radio"
                  name="decision"
                  checked={decision === 'rejected'}
                  onChange={() => setDecision('rejected')}
                  className="text-red-800 focus:ring-red-700"
                />
                <span>Reject / Require Extended Curing</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-900 text-white font-bold text-xs hover:bg-emerald-800 transition shadow-sm flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Submit Quality Gate Decision</span>
            </button>
          </form>
        </div>
      )}

      {/* ================= TAB 4: PACKAGED PRODUCTS & QR ================= */}
      {activeSubTab === 'products' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between">
                <div>
                  <div className="h-44 w-full bg-stone-100 overflow-hidden">
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {p.packageSize}
                      </span>
                      <span className="text-xs font-bold text-emerald-900">
                        {p.availableStock} in stock
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-emerald-950">{p.name}</h4>
                    <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                      {p.description}
                    </p>

                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 text-xs flex justify-between">
                      <div>
                        <span className="text-stone-400 block text-[10px]">Selling Price:</span>
                        <strong className="text-emerald-950">{formatRwf(p.unitPriceRwf)}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-stone-400 block text-[10px]">Production Cost:</span>
                        <strong className="text-stone-600">{formatRwf(p.costOfProductionRwf)}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => {
                      const batch = batches.find((b) => b.batchId === p.batchId) || batches[0];
                      if (batch) handleOpenQrModal(batch);
                    }}
                    className="w-full py-2.5 rounded-xl border border-emerald-800 text-emerald-900 font-semibold text-xs hover:bg-emerald-50 transition flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4 text-emerald-800" />
                    <span>View Public Batch QR</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR Code Inspection Modal */}
      {qrModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-lg text-emerald-950">BioSoil Traceability QR</h3>
            <p className="text-xs text-stone-500">
              Batch: <strong className="text-emerald-800">{qrModalData.batchId}</strong> ({qrModalData.productName})
            </p>

            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center justify-center">
              {qrModalData.qrUrl && (
                <img src={qrModalData.qrUrl} alt="Batch QR Code" className="w-48 h-48" />
              )}
            </div>

            <p className="text-[11px] text-stone-500 leading-relaxed">
              Scan with any mobile camera to view public biological purity, RAB testing notes, and origin provenance.
            </p>

            <div className="flex gap-2">
              <a
                href={`/verify-batch/${qrModalData.batchId}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-emerald-800 text-white font-semibold text-xs hover:bg-emerald-700 transition"
              >
                Open Verification Page
              </a>
              <button
                onClick={() => setQrModalData(null)}
                className="px-4 py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Waste Modal */}
      {isLogWasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-emerald-950">Log Incoming Organic Feedstock</h3>
              <button onClick={() => setIsLogWasteModalOpen(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <form onSubmit={handleCreateWaste} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Supplier / Market Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mukamira Market Vegetable Union"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  required
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Material Category</label>
                  <select
                    value={materialCategory}
                    onChange={(e: any) => setMaterialCategory(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300"
                  >
                    <option value="market_vegetables">Market Vegetables</option>
                    <option value="crop_residue">Dry Crop Residue / Vines</option>
                    <option value="livestock_manure">Livestock Manure</option>
                    <option value="agro_processing">Agro-Processing Waste</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={collectionLocation}
                    onChange={(e) => setCollectionLocation(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Estimated Weight (kg)</label>
                  <input
                    type="number"
                    value={estimatedWeightKg}
                    onChange={(e) => setEstimatedWeightKg(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Accepted Weight (kg)</label>
                  <input
                    type="number"
                    value={acceptedWeightKg}
                    onChange={(e) => setAcceptedWeightKg(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Collection Cost (RWF)</label>
                  <input
                    type="number"
                    value={collectionCostRwf}
                    onChange={(e) => setCollectionCostRwf(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Transport Cost (RWF)</label>
                  <input
                    type="number"
                    value={transportCostRwf}
                    onChange={(e) => setTransportCostRwf(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Inspection Observations</label>
                <input
                  type="text"
                  placeholder="e.g. Free from glass/metal; minor sorting completed."
                  value={contaminationObservations}
                  onChange={(e) => setContaminationObservations(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="wstatus"
                    checked={wasteStatus === 'accepted'}
                    onChange={() => setWasteStatus('accepted')}
                  />
                  <span>Accept Feedstock</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-red-700">
                  <input
                    type="radio"
                    name="wstatus"
                    checked={wasteStatus === 'rejected'}
                    onChange={() => setWasteStatus('rejected')}
                  />
                  <span>Reject (Contaminated)</span>
                </label>
              </div>

              {wasteStatus === 'rejected' && (
                <div>
                  <label className="block font-semibold text-red-700 mb-1">Rejection Reason</label>
                  <input
                    type="text"
                    placeholder="Specify contaminant or chemical residue reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                    className="w-full p-2 rounded-lg border border-red-300 bg-red-50 text-red-900"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsLogWasteModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-800 text-white font-semibold"
                >
                  Save Feedstock Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Batch Modal */}
      {isNewBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-emerald-950">Start New Processing Batch</h3>
              <button onClick={() => setIsNewBatchModalOpen(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <form onSubmit={handleCreateBatchSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Target Product</label>
                <input
                  type="text"
                  value={batchProductName}
                  onChange={(e) => setBatchProductName(e.target.value)}
                  required
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Total Input Weight (kg)</label>
                <input
                  type="number"
                  value={totalInputKg}
                  onChange={(e) => setTotalInputKg(e.target.value)}
                  required
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewBatchModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-800 text-white font-semibold"
                >
                  Initiate Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
