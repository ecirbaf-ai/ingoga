import { sql } from "drizzle-orm";
import { pgTable, text, integer, doublePrecision } from "drizzle-orm/pg-core";

// Mirrors the original IngogaBridge relational schema. Monetary and weight values use
// double precision so RWF amounts and kg measurements keep full precision.
const createdAt = () =>
  text("created_at").default(sql`to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`);

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  phone: text("phone"),
  organization: text("organization"),
  district: text("district").notNull(),
  avatarUrl: text("avatar_url"),
  isVerified: integer("is_verified").default(1),
  createdAt: createdAt(),
});

export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  district: text("district").notNull(),
  contactPerson: text("contact_person").notNull(),
  contactPhone: text("contact_phone").notNull(),
  memberCount: integer("member_count").default(0),
  createdAt: createdAt(),
});

export const wasteCollections = pgTable("waste_collections", {
  id: text("id").primaryKey(),
  collectionRef: text("collection_ref").notNull().unique(),
  supplierName: text("supplier_name").notNull(),
  supplierPhone: text("supplier_phone"),
  materialCategory: text("material_category").notNull(),
  estimatedWeightKg: doublePrecision("estimated_weight_kg").notNull(),
  acceptedWeightKg: doublePrecision("accepted_weight_kg").notNull(),
  collectionDate: text("collection_date").notNull(),
  collectionLocation: text("collection_location").notNull(),
  collectionCostRwf: doublePrecision("collection_cost_rwf").notNull(),
  transportCostRwf: doublePrecision("transport_cost_rwf").notNull(),
  contaminationObservations: text("contamination_observations"),
  rejectionReason: text("rejection_reason"),
  status: text("status").notNull(),
  operatorId: text("operator_id").notNull(),
  operatorName: text("operator_name").notNull(),
  createdAt: createdAt(),
});

export const productionBatches = pgTable("production_batches", {
  id: text("id").primaryKey(),
  batchId: text("batch_id").notNull().unique(),
  productName: text("product_name").notNull(),
  inputMaterialsJson: text("input_materials_json").notNull(),
  totalInputWeightKg: doublePrecision("total_input_weight_kg").notNull(),
  startDate: text("start_date").notNull(),
  completionDate: text("completion_date"),
  currentStage: text("current_stage").notNull(),
  processingCostRwf: doublePrecision("processing_cost_rwf").default(0),
  laborCostRwf: doublePrecision("labor_cost_rwf").default(0),
  testingCostRwf: doublePrecision("testing_cost_rwf").default(0),
  finalOutputWeightKg: doublePrecision("final_output_weight_kg").default(0),
  status: text("status").notNull(),
  operatorId: text("operator_id").notNull(),
  operatorName: text("operator_name").notNull(),
  qualityReviewJson: text("quality_review_json"),
  qrCodeData: text("qr_code_data"),
  createdAt: createdAt(),
});

export const batchProcessingLogs = pgTable("batch_processing_logs", {
  id: text("id").primaryKey(),
  batchId: text("batch_id").notNull(),
  stage: text("stage").notNull(),
  recordedAt: text("recorded_at").notNull(),
  temperatureCelsius: doublePrecision("temperature_celsius").notNull(),
  moisturePercent: doublePrecision("moisture_percent").notNull(),
  operatorNotes: text("operator_notes"),
  operatorName: text("operator_name").notNull(),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  batchId: text("batch_id").notNull(),
  packageSize: text("package_size").notNull(),
  unitOfMeasure: text("unit_of_measure").notNull(),
  unitPriceRwf: doublePrecision("unit_price_rwf").notNull(),
  costOfProductionRwf: doublePrecision("cost_of_production_rwf").notNull(),
  availableStock: integer("available_stock").notNull(),
  storageInstructions: text("storage_instructions"),
  applicationInstructions: text("application_instructions"),
  qualityStatus: text("quality_status").notNull(),
  imageUrl: text("image_url"),
  createdAt: createdAt(),
});

export const farms = pgTable("farms", {
  id: text("id").primaryKey(),
  farmerId: text("farmer_id").notNull(),
  farmerName: text("farmer_name").notNull(),
  farmName: text("farm_name").notNull(),
  district: text("district").notNull(),
  sector: text("sector").notNull(),
  totalAreaHa: doublePrecision("total_area_ha").notNull(),
  soilType: text("soil_type").notNull(),
  irrigationSource: text("irrigation_source").notNull(),
  createdAt: createdAt(),
});

export const fields = pgTable("fields", {
  id: text("id").primaryKey(),
  farmId: text("farm_id").notNull(),
  plotName: text("plot_name").notNull(),
  areaHa: doublePrecision("area_ha").notNull(),
  currentCrop: text("current_crop"),
});

export const cropCycles = pgTable("crop_cycles", {
  id: text("id").primaryKey(),
  farmId: text("farm_id").notNull(),
  plotId: text("plot_id").notNull(),
  plotName: text("plot_name").notNull(),
  cropName: text("crop_name").notNull(),
  variety: text("variety").notNull(),
  plantingDate: text("planting_date").notNull(),
  expectedHarvestDate: text("expected_harvest_date").notNull(),
  fieldAreaHa: doublePrecision("field_area_ha").notNull(),
  seedQuantityKg: doublePrecision("seed_quantity_kg").notNull(),
  expectedHarvestKg: doublePrecision("expected_harvest_kg").notNull(),
  actualHarvestKg: doublePrecision("actual_harvest_kg").default(0),
  status: text("status").notNull(),
  notes: text("notes"),
  createdAt: createdAt(),
});

export const farmExpenses = pgTable("farm_expenses", {
  id: text("id").primaryKey(),
  farmId: text("farm_id").notNull(),
  cropCycleId: text("crop_cycle_id").notNull(),
  cropName: text("crop_name").notNull(),
  date: text("date").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  quantity: doublePrecision("quantity").notNull(),
  unit: text("unit").notNull(),
  amountRwf: doublePrecision("amount_rwf").notNull(),
  createdAt: createdAt(),
});

export const harvestRecords = pgTable("harvest_records", {
  id: text("id").primaryKey(),
  farmId: text("farm_id").notNull(),
  cropCycleId: text("crop_cycle_id").notNull(),
  cropName: text("crop_name").notNull(),
  harvestDate: text("harvest_date").notNull(),
  totalHarvestKg: doublePrecision("total_harvest_kg").notNull(),
  quantitySoldKg: doublePrecision("quantity_sold_kg").notNull(),
  quantityRetainedKg: doublePrecision("quantity_retained_kg").notNull(),
  quantityLossKg: doublePrecision("quantity_loss_kg").notNull(),
  averageSellingPriceRwf: doublePrecision("average_selling_price_rwf").notNull(),
  buyerReference: text("buyer_reference"),
  createdAt: createdAt(),
});

export const marketplaceListings = pgTable("marketplace_listings", {
  id: text("id").primaryKey(),
  listingCode: text("listing_code").notNull().unique(),
  sellerId: text("seller_id").notNull(),
  sellerName: text("seller_name").notNull(),
  sellerType: text("seller_type").notNull(),
  organizationName: text("organization_name"),
  cropName: text("crop_name").notNull(),
  variety: text("variety").notNull(),
  quantityAvailable: doublePrecision("quantity_available").notNull(),
  unitOfMeasure: text("unit_of_measure").notNull(),
  pricePerUnitRwf: doublePrecision("price_per_unit_rwf").notNull(),
  district: text("district").notNull(),
  sector: text("sector").notNull(),
  harvestDate: text("harvest_date").notNull(),
  grade: text("grade").notNull(),
  isOrganicCertified: integer("is_organic_certified").default(0),
  status: text("status").notNull(),
  imageUrl: text("image_url"),
  coopMemberAllocationsJson: text("coop_member_allocations_json"),
  createdAt: createdAt(),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  listingId: text("listing_id").notNull(),
  cropName: text("crop_name").notNull(),
  buyerId: text("buyer_id").notNull(),
  buyerName: text("buyer_name").notNull(),
  buyerPhone: text("buyer_phone").notNull(),
  sellerId: text("seller_id").notNull(),
  sellerName: text("seller_name").notNull(),
  quantity: doublePrecision("quantity").notNull(),
  unitPriceRwf: doublePrecision("unit_price_rwf").notNull(),
  totalProduceValueRwf: doublePrecision("total_produce_value_rwf").notNull(),
  commissionRatePercent: doublePrecision("commission_rate_percent").notNull(),
  commissionAmountRwf: doublePrecision("commission_amount_rwf").notNull(),
  deliveryArrangements: text("delivery_arrangements").notNull(),
  orderStatus: text("order_status").notNull(),
  paymentStatus: text("payment_status").notNull(),
  paymentMethod: text("payment_method").notNull(),
  statusHistoryJson: text("status_history_json").notNull(),
  createdAt: createdAt(),
});

export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  paymentReference: text("payment_reference").notNull().unique(),
  orderId: text("order_id"),
  payerId: text("payer_id").notNull(),
  payerName: text("payer_name").notNull(),
  payeeId: text("payee_id").notNull(),
  payeeName: text("payee_name").notNull(),
  amountRwf: doublePrecision("amount_rwf").notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").notNull(),
  reconciliationStatus: text("reconciliation_status").notNull(),
  createdAt: createdAt(),
});

export const subscriptionPlans = pgTable("subscription_plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  tier: text("tier").notNull(),
  monthlyFeeRwf: doublePrecision("monthly_fee_rwf").notNull(),
  featuresJson: text("features_json").notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  subscriberId: text("subscriber_id").notNull(),
  subscriberName: text("subscriber_name").notNull(),
  planTier: text("plan_tier").notNull(),
  status: text("status").notNull(),
  currentPeriodStart: text("current_period_start").notNull(),
  currentPeriodEnd: text("current_period_end").notNull(),
  monthlyFeeRwf: doublePrecision("monthly_fee_rwf").notNull(),
  createdAt: createdAt(),
});

export const invoices = pgTable("invoices", {
  id: text("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  recipientName: text("recipient_name").notNull(),
  recipientOrg: text("recipient_org"),
  category: text("category").notNull(),
  amountRwf: doublePrecision("amount_rwf").notNull(),
  status: text("status").notNull(),
  dueDate: text("due_date").notNull(),
  createdAt: createdAt(),
});

export const businessExpenses = pgTable("business_expenses", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  amountRwf: doublePrecision("amount_rwf").notNull(),
  date: text("date").notNull(),
  recordedBy: text("recorded_by").notNull(),
});

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  category: text("category").notNull(),
  isRead: integer("is_read").default(0),
  link: text("link"),
  createdAt: createdAt(),
});

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  actorId: text("actor_id").notNull(),
  actorName: text("actor_name").notNull(),
  action: text("action").notNull(),
  targetEntity: text("target_entity").notNull(),
  details: text("details"),
  createdAt: createdAt(),
});
