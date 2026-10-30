import React, { useState } from 'react';
import {
  Store,
  Search,
  Filter,
  CheckCircle2,
  Users,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  CreditCard,
  FileText,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { MarketplaceListing, MarketplaceOrder, UserProfile } from '../../types';
import { calculateMarketCommission, formatRwf } from '../../utils/calculations';
import { translations, Language } from '../../utils/translations';

interface MarketViewProps {
  currentUser: UserProfile;
  listings: MarketplaceListing[];
  orders: MarketplaceOrder[];
  onPlaceOrder: (data: any) => Promise<void>;
  onCreateListing: (data: any) => Promise<void>;
  onUpdateOrderStatus: (orderId: string, newStatus: string, notes?: string) => Promise<void>;
  onSimulatePayment: (orderId: string, method: string) => Promise<void>;
  language: Language;
}

export const MarketView: React.FC<MarketViewProps> = ({
  currentUser,
  listings,
  orders,
  onPlaceOrder,
  onCreateListing,
  onUpdateOrderStatus,
  onSimulatePayment,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'orders' | 'coop'>('browse');
  const [selectedCropFilter, setSelectedCropFilter] = useState('');
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState('');
  const [selectedSellerType, setSelectedSellerType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Order modal state
  const [selectedListingForOrder, setSelectedListingForOrder] = useState<MarketplaceListing | null>(null);
  const [orderQuantity, setOrderQuantity] = useState('2000');
  const [deliveryArrangements, setDeliveryArrangements] = useState('Depot aggregation collection at Musanze Hub');
  const [paymentMethod, setPaymentMethod] = useState<'momo_rwanda' | 'airtel_money' | 'bank_transfer'>('momo_rwanda');
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Create Listing Modal
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);
  const [newCropName, setNewCropName] = useState('Kinigi Irish Potatoes');
  const [newVariety, setNewVariety] = useState('Kinigi Red Skin');
  const [newQuantity, setNewQuantity] = useState('5000');
  const [newPricePerUnit, setNewPricePerUnit] = useState('360');
  const [newDistrict, setNewDistrict] = useState('Musanze');
  const [newGrade, setNewGrade] = useState<'Grade A (Export/Premium)' | 'Grade 1 (Standard Wholesale)' | 'Grade 2 (Local Processing)'>('Grade A (Export/Premium)');
  const [newIsOrganic, setNewIsOrganic] = useState(true);
  const [newStatus, setNewStatus] = useState<'available_now' | 'expected_harvest'>('available_now');

  const t = translations[language];

  // Filtering
  const filteredListings = listings.filter((l) => {
    if (searchQuery && !l.cropName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCropFilter && !l.cropName.toLowerCase().includes(selectedCropFilter.toLowerCase())) return false;
    if (selectedDistrictFilter && l.district !== selectedDistrictFilter) return false;
    if (selectedSellerType && l.sellerType !== selectedSellerType) return false;
    return true;
  });

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);
    if (!selectedListingForOrder) return;

    const qty = Number(orderQuantity);
    if (qty > selectedListingForOrder.quantityAvailable) {
      setOrderError(`Requested quantity (${qty}) exceeds currently available stock (${selectedListingForOrder.quantityAvailable} ${selectedListingForOrder.unitOfMeasure}).`);
      return;
    }

    try {
      await onPlaceOrder({
        listingId: selectedListingForOrder.id,
        quantity: qty,
        deliveryArrangements,
        paymentMethod,
      });
      setOrderSuccess(`Order submitted successfully! Transparent 4% commission recorded.`);
      setTimeout(() => {
        setOrderSuccess(null);
        setSelectedListingForOrder(null);
        setActiveTab('orders');
      }, 1200);
    } catch (err: any) {
      setOrderError(err.message || 'Failed to place order');
    }
  };

  const handleCreateListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateListing({
      cropName: newCropName,
      variety: newVariety,
      quantityAvailable: Number(newQuantity),
      unitOfMeasure: 'kg',
      pricePerUnitRwf: Number(newPricePerUnit),
      district: newDistrict,
      grade: newGrade,
      isOrganicCertified: newIsOrganic,
      status: newStatus,
    });
    setIsCreateListingOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
            <Store className="w-3.5 h-3.5" />
            <span>IngogaMarket Agricultural Exchange</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
            Rwanda Produce Trading & Fulfillment
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Directly connect smallholder farmers & aggregated cooperatives with wholesale buyers. Transparent 4.0% commission model.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateListingOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-900 text-white font-semibold text-xs hover:bg-emerald-800 transition shadow-xs"
          >
            <Plus className="w-4 h-4 text-emerald-300" />
            <span>{t.createListing}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 space-x-6">
        <button
          onClick={() => setActiveTab('browse')}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'browse'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>{t.activeListings}</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-stone-100 text-stone-700">
            {listings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>{t.orderWorkflow}</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-stone-100 text-stone-700">
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('coop')}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'coop'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>Cooperative Aggregation</span>
        </button>
      </div>

      {/* ================= TAB 1: BROWSE PRODUCE ================= */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search crop, variety (e.g. Kinigi, Climbing Beans, Carrots)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={selectedDistrictFilter}
                onChange={(e) => setSelectedDistrictFilter(e.target.value)}
                className="p-2 rounded-xl border border-stone-300 font-medium"
              >
                <option value="">All Rwandan Districts</option>
                <option value="Musanze">Musanze</option>
                <option value="Nyabihu">Nyabihu</option>
                <option value="Gicumbi">Gicumbi</option>
                <option value="Kigali">Kigali</option>
              </select>

              <select
                value={selectedSellerType}
                onChange={(e) => setSelectedSellerType(e.target.value)}
                className="p-2 rounded-xl border border-stone-300 font-medium"
              >
                <option value="">All Seller Types</option>
                <option value="farmer">Individual Farmer</option>
                <option value="cooperative">Aggregated Cooperative</option>
              </select>
            </div>
          </div>

          {/* Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:border-emerald-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="h-48 w-full bg-stone-100 overflow-hidden relative">
                    <img
                      src={listing.imageUrl}
                      alt={listing.cropName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        listing.status === 'available_now'
                          ? 'bg-emerald-900 text-white'
                          : 'bg-amber-600 text-white'
                      }`}>
                        {listing.status === 'available_now' ? 'Available Now' : 'Expected Harvest'}
                      </span>
                      {listing.isOrganicCertified && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-400 text-stone-950">
                          BioSoil Organic
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span className="font-mono text-emerald-800 font-semibold">{listing.listingCode}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        {listing.district} ({listing.sector})
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-base text-emerald-950">{listing.cropName}</h4>
                      <p className="text-xs text-stone-600">{listing.variety}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Seller:</span>
                        <strong className="text-stone-900">{listing.sellerName}</strong>
                      </div>
                      {listing.organizationName && (
                        <div className="text-[10px] text-emerald-800 font-semibold">
                          {listing.organizationName}
                        </div>
                      )}
                      <div className="flex justify-between pt-1 border-t border-stone-200/60">
                        <span className="text-stone-500">Available Lot:</span>
                        <strong className="text-stone-900">{listing.quantityAvailable.toLocaleString()} {listing.unitOfMeasure}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Price / {listing.unitOfMeasure}:</span>
                        <strong className="text-emerald-950 font-bold text-sm">
                          {formatRwf(listing.pricePerUnitRwf)}
                        </strong>
                      </div>
                    </div>

                    <div className="text-[10px] text-stone-500">
                      Quality Grade: <strong>{listing.grade}</strong>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => {
                      setSelectedListingForOrder(listing);
                      setOrderQuantity(String(Math.min(2000, listing.quantityAvailable)));
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-900 text-white font-semibold text-xs hover:bg-emerald-800 transition shadow-xs flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4 text-emerald-300" />
                    <span>Place Purchase Order</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 2: ORDER WORKFLOW & FULFILLMENT ================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Standard Order Workflow:</strong>
              Submitted → Accepted / Negotiated → Confirmed → Fulfillment → Delivered → Completed.
              Commission (4.0%) is deducted transparently only upon completed delivery.
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-stone-100">
              <h3 className="font-bold text-sm text-emerald-950">Active & Completed Trade Orders</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="p-3">Order Ref</th>
                    <th className="p-3">Crop / Produce</th>
                    <th className="p-3">Buyer & Seller</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Gross Value</th>
                    <th className="p-3">Platform 4% Fee</th>
                    <th className="p-3">Order Status</th>
                    <th className="p-3">Payment</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-stone-50/50">
                      <td className="p-3 font-mono font-bold text-emerald-950">{o.orderNumber}</td>
                      <td className="p-3 font-semibold text-stone-900">{o.cropName}</td>
                      <td className="p-3">
                        <div className="font-medium text-stone-900">Buyer: {o.buyerName}</div>
                        <div className="text-[10px] text-stone-400">Seller: {o.sellerName}</div>
                      </td>
                      <td className="p-3 font-bold">{o.quantity.toLocaleString()} kg</td>
                      <td className="p-3 font-extrabold text-stone-900">
                        {formatRwf(o.totalProduceValueRwf)}
                      </td>
                      <td className="p-3 text-emerald-800 font-bold">
                        {formatRwf(o.commissionAmountRwf)}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          o.orderStatus === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.orderStatus === 'fulfillment'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {o.orderStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        {o.paymentStatus === 'confirmed' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" />
                            Confirmed
                          </span>
                        ) : (
                          <button
                            onClick={() => onSimulatePayment(o.id, 'momo_rwanda')}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-500 text-stone-950 text-[10px] font-bold hover:bg-amber-400"
                          >
                            <CreditCard className="w-3 h-3" />
                            Simulate MoMo Pay
                          </button>
                        )}
                      </td>
                      <td className="p-3">
                        {o.orderStatus !== 'completed' && (
                          <button
                            onClick={() => onUpdateOrderStatus(o.id, 'completed', 'Receipt confirmed by buyer')}
                            className="text-[10px] font-bold text-emerald-800 hover:underline"
                          >
                            Mark Completed
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: COOPERATIVE BULK AGGREGATION ================= */}
      {activeTab === 'coop' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs max-w-4xl mx-auto">
          <div className="border-b border-stone-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Cooperative Aggregation Model
            </span>
            <h2 className="text-xl font-extrabold text-emerald-950 mt-1">
              Tugimbere Potato Cooperative (Mukamira, Nyabihu)
            </h2>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Demonstrates how rural cooperatives aggregate smallholder harvests into large commercial wholesale batches without counting the same produce twice. Each farmer’s allocation is preserved in the database.
            </p>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-800 font-bold uppercase">Aggregated Lot Reference</span>
                <h4 className="font-extrabold text-base text-emerald-950">IM-2026-0043 — Nyabihu Bulk Potatoes</h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-500 block">Total Lot Volume</span>
                <strong className="text-xl font-black text-emerald-900">16,000 kg (16 Tons)</strong>
              </div>
            </div>

            <h5 className="text-xs font-bold text-stone-800 uppercase tracking-wider pt-2">
              Individual Member Allocations (No Double-Counting)
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-stone-200 flex justify-between">
                <span>Marie Mukamana (Mukamira Plot)</span>
                <strong className="text-emerald-900">3,500 kg</strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200 flex justify-between">
                <span>Theogene Bizimana (Kinigi Border)</span>
                <strong className="text-emerald-900">4,200 kg</strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200 flex justify-between">
                <span>Ephrem Ndayisaba (Terrace 4)</span>
                <strong className="text-emerald-900">4,100 kg</strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200 flex justify-between">
                <span>Vestine Uwamahoro (Valley Plot)</span>
                <strong className="text-emerald-900">4,200 kg</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Place Order */}
      {selectedListingForOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Purchase Order</span>
                <h3 className="font-bold text-base text-emerald-950">{selectedListingForOrder.cropName}</h3>
              </div>
              <button onClick={() => setSelectedListingForOrder(null)}>✕</button>
            </div>

            {orderError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{orderError}</span>
              </div>
            )}

            {orderSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{orderSuccess}</span>
              </div>
            )}

            <form onSubmit={handleOrderSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Quantity ({selectedListingForOrder.unitOfMeasure})
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedListingForOrder.quantityAvailable}
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-bold"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Available in lot: {selectedListingForOrder.quantityAvailable.toLocaleString()} {selectedListingForOrder.unitOfMeasure}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Delivery Arrangements</label>
                <input
                  type="text"
                  value={deliveryArrangements}
                  onChange={(e) => setDeliveryArrangements(e.target.value)}
                  required
                  className="w-full p-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Simulated Settlement Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e: any) => setPaymentMethod(e.target.value)}
                  className="w-full p-2 rounded-xl border border-stone-300 text-xs"
                >
                  <option value="momo_rwanda">MTN Mobile Money Rwanda (Simulated)</option>
                  <option value="airtel_money">Airtel Money (Simulated)</option>
                  <option value="bank_transfer">BK / Equity Direct Bank Transfer</option>
                </select>
              </div>

              {/* Commission Calculation Breakdown */}
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Gross Produce Value:</span>
                  <strong className="text-stone-900">
                    {formatRwf(Number(orderQuantity) * selectedListingForOrder.pricePerUnitRwf)}
                  </strong>
                </div>
                <div className="flex justify-between text-emerald-800">
                  <span>Platform Commission (4.0%):</span>
                  <strong>
                    {formatRwf(calculateMarketCommission(Number(orderQuantity) * selectedListingForOrder.pricePerUnitRwf, 4.0))}
                  </strong>
                </div>
                <div className="text-[10px] text-stone-400 pt-1 border-t">
                  *Transparently calculated upon confirmed fulfillment.
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedListingForOrder(null)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-900 text-white font-semibold rounded-xl hover:bg-emerald-800 transition"
                >
                  Confirm & Submit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Listing */}
      {isCreateListingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-emerald-950">Publish Produce Listing</h3>
              <button onClick={() => setIsCreateListingOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateListingSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Crop Name</label>
                <input
                  type="text"
                  value={newCropName}
                  onChange={(e) => setNewCropName(e.target.value)}
                  required
                  className="w-full p-2 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Variety</label>
                  <input
                    type="text"
                    value={newVariety}
                    onChange={(e) => setNewVariety(e.target.value)}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">District</label>
                  <input
                    type="text"
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Quantity (kg)</label>
                  <input
                    type="number"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    required
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Price / kg (RWF)</label>
                  <input
                    type="number"
                    value={newPricePerUnit}
                    onChange={(e) => setNewPricePerUnit(e.target.value)}
                    required
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={newStatus === 'available_now'}
                    onChange={() => setNewStatus('available_now')}
                  />
                  <span>Available Now</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={newStatus === 'expected_harvest'}
                    onChange={() => setNewStatus('expected_harvest')}
                  />
                  <span>Expected Harvest</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateListingOpen(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-900 text-white font-semibold rounded-xl"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
