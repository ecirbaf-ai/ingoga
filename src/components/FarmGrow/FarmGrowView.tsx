import React, { useState } from 'react';
import {
  Sprout,
  TrendingUp,
  Plus,
  DollarSign,
  Calendar,
  Layers,
  ShoppingBag,
  CheckCircle,
  FileText,
  AlertCircle,
  Package,
} from 'lucide-react';
import { Farm, CropCycle, FarmExpense, HarvestRecord, UserProfile, BioSoilProduct } from '../../types';
import { calculateCropProfitability, formatRwf } from '../../utils/calculations';
import { translations, Language } from '../../utils/translations';

interface FarmGrowViewProps {
  currentUser: UserProfile;
  farms: Farm[];
  cropCycles: CropCycle[];
  expenses: FarmExpense[];
  harvests: HarvestRecord[];
  bioSoilProducts: BioSoilProduct[];
  onAddExpense: (data: any) => Promise<void>;
  onAddHarvest: (data: any) => Promise<void>;
  onAddCropCycle: (data: any) => Promise<void>;
  language: Language;
}

export const FarmGrowView: React.FC<FarmGrowViewProps> = ({
  currentUser,
  farms,
  cropCycles,
  expenses,
  harvests,
  bioSoilProducts,
  onAddExpense,
  onAddHarvest,
  onAddCropCycle,
  language,
}) => {
  const [selectedFarmId, setSelectedFarmId] = useState<string>(farms[0]?.id || 'farm-001');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [isNewCycleModalOpen, setIsNewCycleModalOpen] = useState(false);
  const [isBioSoilOrderModalOpen, setIsBioSoilOrderModalOpen] = useState(false);

  // Expense form
  const [expCategory, setExpCategory] = useState<string>('labor');
  const [expDescription, setExpDescription] = useState('Weeding and furrow maintenance');
  const [expAmountRwf, setExpAmountRwf] = useState('35000');
  const [expQuantity, setExpQuantity] = useState('7');
  const [expUnit, setExpUnit] = useState('person-days');

  // Harvest form
  const [harvTotalKg, setHarvTotalKg] = useState('4500');
  const [harvSoldKg, setHarvSoldKg] = useState('4000');
  const [harvRetainedKg, setHarvRetainedKg] = useState('400');
  const [harvLossKg, setHarvLossKg] = useState('100');
  const [harvPriceRwf, setHarvPriceRwf] = useState('360');

  // Crop cycle form
  const [newCropName, setNewCropName] = useState('Irish Potatoes (Kinigi)');
  const [newVariety, setNewVariety] = useState('Kinigi Certified Red');
  const [newPlotName, setNewPlotName] = useState('Kinigi Volcano Plot');
  const [newAreaHa, setNewAreaHa] = useState('0.8');
  const [newExpectedHarvestKg, setNewExpectedHarvestKg] = useState('9500');
  const [newHarvestDate, setNewHarvestDate] = useState('2026-11-25');

  // BioSoil direct order
  const [selectedBioSoilProduct, setSelectedBioSoilProduct] = useState<string>(bioSoilProducts[0]?.id || 'prod-001');
  const [bioSoilOrderQty, setBioSoilOrderQty] = useState('10');

  const t = translations[language];

  const currentFarm = farms.find((f) => f.id === selectedFarmId) || farms[0];
  const farmExpenses = expenses.filter((e) => e.farmId === selectedFarmId);
  const farmHarvests = harvests.filter((h) => h.farmId === selectedFarmId);

  // Calculate live profitability
  const profitability = calculateCropProfitability({
    expenses: farmExpenses.map((e) => ({ amountRwf: e.amountRwf })),
    harvests: farmHarvests.map((h) => ({
      quantitySoldKg: h.quantitySoldKg,
      averageSellingPriceRwf: h.averageSellingPriceRwf,
      totalHarvestKg: h.totalHarvestKg,
    })),
  });

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddExpense({
      farmId: selectedFarmId,
      cropCycleId: cropCycles[0]?.id || 'crop-001',
      cropName: cropCycles[0]?.cropName || 'Irish Potatoes',
      date: new Date().toISOString().split('T')[0],
      category: expCategory,
      description: expDescription,
      quantity: Number(expQuantity),
      unit: expUnit,
      amountRwf: Number(expAmountRwf),
    });
    setIsExpenseModalOpen(false);
  };

  const handleHarvestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddHarvest({
      farmId: selectedFarmId,
      cropCycleId: cropCycles[0]?.id || 'crop-001',
      cropName: cropCycles[0]?.cropName || 'Irish Potatoes',
      harvestDate: new Date().toISOString().split('T')[0],
      totalHarvestKg: Number(harvTotalKg),
      quantitySoldKg: Number(harvSoldKg),
      quantityRetainedKg: Number(harvRetainedKg),
      quantityLossKg: Number(harvLossKg),
      averageSellingPriceRwf: Number(harvPriceRwf),
      buyerReference: 'Local Aggregation Market',
    });
    setIsHarvestModalOpen(false);
  };

  const handleCropCycleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddCropCycle({
      farmId: selectedFarmId,
      cropName: newCropName,
      variety: newVariety,
      plotName: newPlotName,
      fieldAreaHa: Number(newAreaHa),
      expectedHarvestKg: Number(newExpectedHarvestKg),
      expectedHarvestDate: newHarvestDate,
    });
    setIsNewCycleModalOpen(false);
  };

  const handleBioSoilDirectOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = bioSoilProducts.find((p) => p.id === selectedBioSoilProduct);
    if (!prod) return;

    const totalCost = Number(bioSoilOrderQty) * prod.unitPriceRwf;
    // Log as farm expense
    await onAddExpense({
      farmId: selectedFarmId,
      cropCycleId: cropCycles[0]?.id || 'crop-001',
      cropName: 'Irish Potatoes (Kinigi)',
      date: new Date().toISOString().split('T')[0],
      category: 'biosoil_compost',
      description: `${prod.name} (${bioSoilOrderQty} ${prod.unitOfMeasure}s)`,
      quantity: Number(bioSoilOrderQty),
      unit: prod.unitOfMeasure,
      amountRwf: totalCost,
    });
    setIsBioSoilOrderModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
            <Sprout className="w-3.5 h-3.5" />
            <span>FarmGrow Enterprise</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
            Digital Farm & Profitability Management
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Track Rwandan crop cycles, input investments, harvest yields, and real-time net farmer profit margin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Farm Switcher */}
          <div className="bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs">
            <label htmlFor="farm-select" className="text-stone-400 block text-[10px] font-semibold">Active Farm:</label>
            <select
              id="farm-select"
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              className="font-bold text-emerald-950 bg-transparent focus:outline-hidden"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.farmName} ({f.district})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-900 text-white font-semibold text-xs hover:bg-stone-800 transition shadow-xs"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>{t.addExpense}</span>
          </button>

          <button
            onClick={() => setIsHarvestModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-900 text-white font-semibold text-xs hover:bg-emerald-800 transition shadow-xs"
          >
            <Plus className="w-4 h-4 text-emerald-300" />
            <span>{t.recordHarvest}</span>
          </button>

          <button
            onClick={() => setIsBioSoilOrderModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-600 text-white font-semibold text-xs hover:bg-amber-500 transition shadow-xs"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Order BioSoil for Plot</span>
          </button>
        </div>
      </div>

      {/* Farm Overview Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Farm Profile
          </span>
          <h2 className="text-xl font-bold text-emerald-950">{currentFarm?.farmName}</h2>
          <p className="text-xs text-stone-600">
            Farmer: <strong>{currentFarm?.farmerName}</strong> • {currentFarm?.district} District ({currentFarm?.sector} Sector)
          </p>
          <div className="text-[11px] text-stone-500 pt-1">
            Soil: {currentFarm?.soilType} • Irrigation: {currentFarm?.irrigationSource}
          </div>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-stone-100 pt-4 md:pt-0 md:pl-6 text-xs">
          <div>
            <span className="text-stone-400 block text-[10px]">Total Farm Area</span>
            <span className="text-lg font-bold text-emerald-950">{currentFarm?.totalAreaHa} Hectares</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px]">Active Plots</span>
            <span className="text-lg font-bold text-emerald-950">{cropCycles.length} Crop Plots</span>
          </div>
        </div>
      </div>

      {/* ================= PROFITABILITY SUMMARY DASHBOARD ================= */}
      <div className="bg-gradient-to-br from-emerald-950 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-800/80 pb-4 gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Economic Performance
            </span>
            <h3 className="text-xl font-extrabold text-white mt-0.5">
              Crop Profitability & Production Economics
            </h3>
          </div>
          <div className="text-xs text-emerald-200/80">
            Formulas strictly audited against recorded inputs & verified sales
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-emerald-900/60 p-4 rounded-2xl border border-emerald-700/50">
            <span className="text-xs text-emerald-200 block">Total Production Cost</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {formatRwf(profitability.totalProductionCostRwf)}
            </div>
            <span className="text-[10px] text-emerald-300/70">Sum of all input expenses</span>
          </div>

          <div className="bg-emerald-900/60 p-4 rounded-2xl border border-emerald-700/50">
            <span className="text-xs text-emerald-200 block">Gross Sales Revenue</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {formatRwf(profitability.grossSalesRevenueRwf)}
            </div>
            <span className="text-[10px] text-emerald-300/70">{profitability.totalSoldKg.toLocaleString()} kg sold</span>
          </div>

          <div className="bg-emerald-900/60 p-4 rounded-2xl border border-emerald-700/50">
            <span className="text-xs text-emerald-200 block">Estimated Net Profit</span>
            <div className="text-2xl font-extrabold text-amber-300 mt-1">
              {formatRwf(profitability.estimatedCropProfitRwf)}
            </div>
            <span className="text-[10px] text-emerald-300/70">Revenue − Recorded Costs</span>
          </div>

          <div className="bg-emerald-900/60 p-4 rounded-2xl border border-emerald-700/50">
            <span className="text-xs text-emerald-200 block">Profit Margin</span>
            <div className="text-2xl font-extrabold text-emerald-300 mt-1">
              {profitability.profitMarginPercent}%
            </div>
            <span className="text-[10px] text-emerald-300/70">Margin on harvested sales</span>
          </div>

          <div className="bg-emerald-900/60 p-4 rounded-2xl border border-emerald-700/50">
            <span className="text-xs text-emerald-200 block">Unit Cost (RWF/kg)</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {formatRwf(profitability.costPerUnitRwf)} / kg
            </div>
            <span className="text-[10px] text-emerald-300/70">Total costs ÷ Harvest qty</span>
          </div>
        </div>
      </div>

      {/* ================= CROP CYCLES & EXPENSES GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Active Crop Cycles */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-bold text-base text-emerald-950 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-800" />
              <span>Active Crop Cycles ({cropCycles.length})</span>
            </h3>
            <button
              onClick={() => setIsNewCycleModalOpen(true)}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900"
            >
              + Plan New Crop
            </button>
          </div>

          <div className="space-y-3">
            {cropCycles.map((c) => (
              <div key={c.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-emerald-950">{c.cropName}</h4>
                    <span className="text-xs text-stone-500">{c.plotName} • {c.fieldAreaHa} Ha</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                    {c.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 text-stone-600">
                  <div>
                    <span>Planting:</span> <strong className="text-stone-900">{c.plantingDate}</strong>
                  </div>
                  <div>
                    <span>Exp. Harvest:</span> <strong className="text-stone-900">{c.expectedHarvestDate}</strong>
                  </div>
                  <div>
                    <span>Exp. Yield:</span> <strong className="text-stone-900">{c.expectedHarvestKg.toLocaleString()} kg</strong>
                  </div>
                  <div>
                    <span>Seed Qty:</span> <strong className="text-stone-900">{c.seedQuantityKg} kg</strong>
                  </div>
                </div>
                {c.notes && (
                  <p className="text-[11px] text-stone-500 italic pt-1 border-t border-stone-200/60">
                    &ldquo;{c.notes}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recorded Farm Expenses */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-bold text-base text-emerald-950 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-800" />
              <span>Recorded Farm Expenses</span>
            </h3>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900"
            >
              + Log Expense
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {farmExpenses.map((exp) => (
              <div key={exp.id} className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-stone-900">{exp.description}</div>
                  <span className="text-[10px] text-stone-400 capitalize">
                    {exp.category.replace('_', ' ')} • {exp.date}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-emerald-950">{formatRwf(exp.amountRwf)}</div>
                  <span className="text-[10px] text-stone-500">{exp.quantity} {exp.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Log Farm Expense */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-emerald-950">Log Farm Expense</h3>
              <button onClick={() => setIsExpenseModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleExpenseSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Expense Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300"
                >
                  <option value="seeds">Seeds / Planting Material</option>
                  <option value="biosoil_compost">BioSoil Organic Compost</option>
                  <option value="fertilizer">Other Fertilizers</option>
                  <option value="labor">Hired Labor (Land prep, weeding, harvest)</option>
                  <option value="transport">Produce / Input Transport</option>
                  <option value="irrigation">Irrigation / Water fuel</option>
                  <option value="tools">Equipment & Tools</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  required
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    value={expQuantity}
                    onChange={(e) => setExpQuantity(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Unit</label>
                  <input
                    type="text"
                    value={expUnit}
                    onChange={(e) => setExpUnit(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Total Amount (RWF)</label>
                <input
                  type="number"
                  value={expAmountRwf}
                  onChange={(e) => setExpAmountRwf(e.target.value)}
                  required
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 text-white font-semibold rounded-lg"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Harvest */}
      {isHarvestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-emerald-950">Record Actual Harvest</h3>
              <button onClick={() => setIsHarvestModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleHarvestSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Total Harvested (kg)</label>
                  <input
                    type="number"
                    value={harvTotalKg}
                    onChange={(e) => setHarvTotalKg(e.target.value)}
                    required
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Quantity Sold (kg)</label>
                  <input
                    type="number"
                    value={harvSoldKg}
                    onChange={(e) => setHarvSoldKg(e.target.value)}
                    required
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Retained for Seed / Food (kg)</label>
                  <input
                    type="number"
                    value={harvRetainedKg}
                    onChange={(e) => setHarvRetainedKg(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Average Price / kg (RWF)</label>
                  <input
                    type="number"
                    value={harvPriceRwf}
                    onChange={(e) => setHarvPriceRwf(e.target.value)}
                    required
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsHarvestModalOpen(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 text-white font-semibold rounded-lg"
                >
                  Save Harvest Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Direct BioSoil Order for Plot */}
      {isBioSoilOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-emerald-950">Order BioSoil Compost for Plot</h3>
              <button onClick={() => setIsBioSoilOrderModalOpen(false)}>✕</button>
            </div>
            <p className="text-stone-600">
              Directly purchase BioSoil compost and automatically book it into this farm’s expense ledger.
            </p>
            <form onSubmit={handleBioSoilDirectOrder} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Select Product</label>
                <select
                  value={selectedBioSoilProduct}
                  onChange={(e) => setSelectedBioSoilProduct(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300"
                >
                  {bioSoilProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatRwf(p.unitPriceRwf)} / {p.unitOfMeasure})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={bioSoilOrderQty}
                  onChange={(e) => setBioSoilOrderQty(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex justify-between font-bold text-emerald-950">
                <span>Calculated Total:</span>
                <span>
                  {formatRwf(
                    Number(bioSoilOrderQty) *
                      (bioSoilProducts.find((p) => p.id === selectedBioSoilProduct)?.unitPriceRwf || 12500)
                  )}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsBioSoilOrderModalOpen(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 text-white font-semibold rounded-lg"
                >
                  Confirm Order & Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Plan New Crop */}
      {isNewCycleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-emerald-950">Plan New Crop Cycle</h3>
              <button onClick={() => setIsNewCycleModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCropCycleSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Crop Name</label>
                <input
                  type="text"
                  value={newCropName}
                  onChange={(e) => setNewCropName(e.target.value)}
                  required
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Variety</label>
                  <input
                    type="text"
                    value={newVariety}
                    onChange={(e) => setNewVariety(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Plot Name</label>
                  <input
                    type="text"
                    value={newPlotName}
                    onChange={(e) => setNewPlotName(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Field Area (Ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newAreaHa}
                    onChange={(e) => setNewAreaHa(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Exp. Harvest (kg)</label>
                  <input
                    type="number"
                    value={newExpectedHarvestKg}
                    onChange={(e) => setNewExpectedHarvestKg(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Target Harvest Date</label>
                <input
                  type="date"
                  value={newHarvestDate}
                  onChange={(e) => setNewHarvestDate(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewCycleModalOpen(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 text-white font-semibold rounded-lg"
                >
                  Save Crop Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
