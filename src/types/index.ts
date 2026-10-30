export type UserRole =
  | 'admin'
  | 'biosoil_operator'
  | 'farmer'
  | 'waste_supplier'
  | 'coop_manager'
  | 'produce_buyer'
  | 'agri_supplier';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  organization?: string;
  district: string;
  avatarUrl?: string;
  isVerified: boolean;
}

export type WasteCategory =
  | 'crop_residue'
  | 'market_vegetables'
  | 'livestock_manure'
  | 'agro_processing'
  | 'brewery_grain';

export type WasteCollectionStatus = 'pending' | 'accepted' | 'rejected';

export interface WasteCollection {
  id: string;
  collectionRef: string;
  supplierName: string;
  supplierPhone?: string;
  materialCategory: WasteCategory;
  estimatedWeightKg: number;
  acceptedWeightKg: number;
  collectionDate: string;
  collectionLocation: string; // District/Market
  collectionCostRwf: number;
  transportCostRwf: number;
  contaminationObservations?: string;
  rejectionReason?: string;
  status: WasteCollectionStatus;
  operatorId: string;
  operatorName: string;
  createdAt: string;
}

export type BatchStatus =
  | 'created'
  | 'materials_received'
  | 'processing'
  | 'quality_review'
  | 'approved'
  | 'rejected'
  | 'archived';

export interface BatchProcessingLog {
  stage: 'pre_treatment' | 'thermophilic' | 'curing' | 'screening' | 'packaging';
  recordedAt: string;
  temperatureCelsius: number;
  moisturePercent: number;
  operatorNotes: string;
  operatorName: string;
}

export interface ProductionBatch {
  id: string;
  batchId: string; // e.g. BS-2026-0001
  productName: string;
  inputMaterials: { category: WasteCategory; weightKg: number; sourceRef?: string }[];
  totalInputWeightKg: number;
  startDate: string;
  completionDate?: string;
  currentStage: 'pre_treatment' | 'thermophilic' | 'curing' | 'screening' | 'packaging';
  temperatureLogs: BatchProcessingLog[];
  processingCostRwf: number;
  laborCostRwf: number;
  testingCostRwf: number;
  finalOutputWeightKg?: number;
  status: BatchStatus;
  operatorId: string;
  operatorName: string;
  qualityReview?: {
    reviewedAt: string;
    reviewerName: string;
    moistureSatisfactory: boolean;
    temperatureCurveVerified: boolean;
    curingMaturityPassed: boolean;
    weedPathogenFree: boolean;
    labTested: boolean;
    labNotes?: string;
    decision: 'approved' | 'rejected';
    decisionNotes: string;
  };
  qrCodeData?: string;
  createdAt: string;
}

export interface BioSoilProduct {
  id: string;
  name: string;
  description: string;
  category: 'fortified_compost' | 'liquid_biofertilizer' | 'soil_conditioner' | 'seedling_mix';
  batchId: string;
  packageSize: string; // e.g. "25kg", "50kg", "5 Litres"
  unitOfMeasure: 'bag' | 'litre' | 'ton';
  unitPriceRwf: number;
  costOfProductionRwf: number;
  availableStock: number;
  storageInstructions: string;
  applicationInstructions: string;
  qualityStatus: 'approved' | 'pending_review';
  imageUrl: string;
}

export interface Farm {
  id: string;
  farmerId: string;
  farmerName: string;
  farmName: string;
  district: string;
  sector: string;
  totalAreaHa: number;
  soilType: string;
  irrigationSource: string;
}

export interface FieldPlot {
  id: string;
  farmId: string;
  plotName: string;
  areaHa: number;
  currentCrop?: string;
}

export interface CropCycle {
  id: string;
  farmId: string;
  plotId: string;
  plotName: string;
  cropName: string;
  variety: string;
  plantingDate: string;
  expectedHarvestDate: string;
  fieldAreaHa: number;
  seedQuantityKg: number;
  expectedHarvestKg: number;
  actualHarvestKg?: number;
  status: 'planned' | 'planted' | 'growing' | 'harvested';
  notes?: string;
}

export type ExpenseCategory =
  | 'seeds'
  | 'biosoil_compost'
  | 'fertilizer'
  | 'labor'
  | 'irrigation'
  | 'transport'
  | 'equipment'
  | 'tools'
  | 'other';

export interface FarmExpense {
  id: string;
  farmId: string;
  cropCycleId: string;
  cropName: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  quantity: number;
  unit: string;
  amountRwf: number;
}

export interface HarvestRecord {
  id: string;
  farmId: string;
  cropCycleId: string;
  cropName: string;
  harvestDate: string;
  totalHarvestKg: number;
  quantitySoldKg: number;
  quantityRetainedKg: number;
  quantityLossKg: number;
  averageSellingPriceRwf: number;
  buyerReference?: string;
}

export type ListingStatus =
  | 'available_now'
  | 'expected_harvest'
  | 'reserved'
  | 'sold'
  | 'expired';

export interface MarketplaceListing {
  id: string;
  listingCode: string; // e.g. IM-2026-0042
  sellerId: string;
  sellerName: string;
  sellerType: 'farmer' | 'cooperative';
  organizationName?: string;
  cropName: string;
  variety: string;
  quantityAvailable: number;
  unitOfMeasure: 'kg' | 'bags_50kg' | 'crates' | 'metric_ton';
  pricePerUnitRwf: number;
  district: string;
  sector: string;
  harvestDate: string;
  grade: 'Grade A (Export/Premium)' | 'Grade 1 (Standard Wholesale)' | 'Grade 2 (Local Processing)';
  isOrganicCertified: boolean;
  status: ListingStatus;
  imageUrl: string;
  coopMemberAllocations?: { memberName: string; quantity: number }[];
  createdAt: string;
}

export type OrderStatus =
  | 'draft'
  | 'submitted'
  | 'accepted'
  | 'confirmed'
  | 'fulfillment'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export interface MarketplaceOrder {
  id: string;
  orderNumber: string; // e.g. ORD-2026-8812
  listingId: string;
  cropName: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  sellerId: string;
  sellerName: string;
  quantity: number;
  unitPriceRwf: number;
  totalProduceValueRwf: number;
  commissionRatePercent: number; // e.g. 4.0%
  commissionAmountRwf: number;
  deliveryArrangements: string;
  orderStatus: OrderStatus;
  paymentStatus: 'pending' | 'initiated' | 'confirmed' | 'failed' | 'refunded';
  paymentMethod: 'momo_rwanda' | 'airtel_money' | 'bank_transfer' | 'demo_simulation';
  statusHistory: { status: OrderStatus; timestamp: string; notes?: string }[];
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'farmer_free' | 'coop_basic' | 'coop_pro' | 'buyer_business';
  monthlyFeeRwf: number;
  features: string[];
  isPopular?: boolean;
}

export interface PlatformFinancials {
  grossMarketplaceVolumeRwf: number;
  commissionRevenueRwf: number;
  bioSoilProductSalesRwf: number;
  subscriptionRevenueRwf: number;
  buyerServicesRevenueRwf: number;
  totalPlatformRevenueRwf: number;
  costOfBioSoilGoodsSoldRwf: number;
  grossProfitRwf: number;
  operatingExpensesRwf: number;
  operatingProfitRwf: number;
  operatingMarginPercent: number;
  closingCashRwf: number;
}
