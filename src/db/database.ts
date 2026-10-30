import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import {
  demoUsers,
  demoWasteCollections,
  demoBatches,
  demoProducts,
  demoFarms,
  demoCropCycles,
  demoFarmExpenses,
  demoHarvestRecords,
  demoMarketListings,
  demoOrders,
  demoSubscriptionPlans,
} from './seedData';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Persistent SQLite database file in the workspace
const DB_PATH = path.resolve(process.cwd(), 'ingogabridge.db');
export const db = new DatabaseSync(DB_PATH);

export function initializeDatabase() {
  // Read schema.sql and execute
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // SQLite exec can run multiple statements
  db.exec(schemaSql);

  // Check if profiles are seeded
  const userCount = db.prepare('SELECT COUNT(*) as count FROM profiles').get() as { count: number };
  if (userCount.count === 0) {
    seedAllData();
  }
}

export function seedAllData() {
  const insertProfile = db.prepare(`
    INSERT OR REPLACE INTO profiles (id, name, email, role, phone, organization, district, is_verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const u of demoUsers) {
    insertProfile.run(u.id, u.name, u.email, u.role, u.phone || null, u.organization || null, u.district, u.isVerified ? 1 : 0);
  }

  const insertWaste = db.prepare(`
    INSERT OR REPLACE INTO waste_collections (
      id, collection_ref, supplier_name, supplier_phone, material_category,
      estimated_weight_kg, accepted_weight_kg, collection_date, collection_location,
      collection_cost_rwf, transport_cost_rwf, contamination_observations,
      rejection_reason, status, operator_id, operator_name, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const w of demoWasteCollections) {
    insertWaste.run(
      w.id,
      w.collectionRef,
      w.supplierName,
      w.supplierPhone || null,
      w.materialCategory,
      w.estimatedWeightKg,
      w.acceptedWeightKg,
      w.collectionDate,
      w.collectionLocation,
      w.collectionCostRwf,
      w.transportCostRwf,
      w.contaminationObservations || null,
      w.rejectionReason || null,
      w.status,
      w.operatorId,
      w.operatorName,
      w.createdAt
    );
  }

  const insertBatch = db.prepare(`
    INSERT OR REPLACE INTO production_batches (
      id, batch_id, product_name, input_materials_json, total_input_weight_kg,
      start_date, completion_date, current_stage, processing_cost_rwf, labor_cost_rwf,
      testing_cost_rwf, final_output_weight_kg, status, operator_id, operator_name,
      quality_review_json, qr_code_data, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertLog = db.prepare(`
    INSERT OR REPLACE INTO batch_processing_logs (
      id, batch_id, stage, recorded_at, temperature_celsius, moisture_percent,
      operator_notes, operator_name
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const b of demoBatches) {
    insertBatch.run(
      b.id,
      b.batchId,
      b.productName,
      JSON.stringify(b.inputMaterials),
      b.totalInputWeightKg,
      b.startDate,
      b.completionDate || null,
      b.currentStage,
      b.processingCostRwf,
      b.laborCostRwf,
      b.testingCostRwf,
      b.finalOutputWeightKg || 0,
      b.status,
      b.operatorId,
      b.operatorName,
      b.qualityReview ? JSON.stringify(b.qualityReview) : null,
      b.qrCodeData || null,
      b.createdAt
    );

    for (let i = 0; i < b.temperatureLogs.length; i++) {
      const log = b.temperatureLogs[i];
      insertLog.run(
        `${b.id}-log-${i}`,
        b.id,
        log.stage,
        log.recordedAt,
        log.temperatureCelsius,
        log.moisturePercent,
        log.operatorNotes,
        log.operatorName
      );
    }
  }

  const insertProduct = db.prepare(`
    INSERT OR REPLACE INTO products (
      id, name, description, category, batch_id, package_size, unit_of_measure,
      unit_price_rwf, cost_of_production_rwf, available_stock, storage_instructions,
      application_instructions, quality_status, image_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of demoProducts) {
    insertProduct.run(
      p.id,
      p.name,
      p.description,
      p.category,
      p.batchId,
      p.packageSize,
      p.unitOfMeasure,
      p.unitPriceRwf,
      p.costOfProductionRwf,
      p.availableStock,
      p.storageInstructions,
      p.applicationInstructions,
      p.qualityStatus,
      p.imageUrl
    );
  }

  const insertFarm = db.prepare(`
    INSERT OR REPLACE INTO farms (
      id, farmer_id, farmer_name, farm_name, district, sector, total_area_ha,
      soil_type, irrigation_source
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const f of demoFarms) {
    insertFarm.run(
      f.id,
      f.farmerId,
      f.farmerName,
      f.farmName,
      f.district,
      f.sector,
      f.totalAreaHa,
      f.soilType,
      f.irrigationSource
    );
  }

  const insertCrop = db.prepare(`
    INSERT OR REPLACE INTO crop_cycles (
      id, farm_id, plot_id, plot_name, crop_name, variety, planting_date,
      expected_harvest_date, field_area_ha, seed_quantity_kg, expected_harvest_kg,
      actual_harvest_kg, status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of demoCropCycles) {
    insertCrop.run(
      c.id,
      c.farmId,
      c.plotId,
      c.plotName,
      c.cropName,
      c.variety,
      c.plantingDate,
      c.expectedHarvestDate,
      c.fieldAreaHa,
      c.seedQuantityKg,
      c.expectedHarvestKg,
      c.actualHarvestKg || 0,
      c.status,
      c.notes || null
    );
  }

  const insertExpense = db.prepare(`
    INSERT OR REPLACE INTO farm_expenses (
      id, farm_id, crop_cycle_id, crop_name, date, category, description,
      quantity, unit, amount_rwf
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const e of demoFarmExpenses) {
    insertExpense.run(
      e.id,
      e.farmId,
      e.cropCycleId,
      e.cropName,
      e.date,
      e.category,
      e.description,
      e.quantity,
      e.unit,
      e.amountRwf
    );
  }

  const insertHarvest = db.prepare(`
    INSERT OR REPLACE INTO harvest_records (
      id, farm_id, crop_cycle_id, crop_name, harvest_date, total_harvest_kg,
      quantity_sold_kg, quantity_retained_kg, quantity_loss_kg, average_selling_price_rwf,
      buyer_reference
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const h of demoHarvestRecords) {
    insertHarvest.run(
      h.id,
      h.farmId,
      h.cropCycleId,
      h.cropName,
      h.harvestDate,
      h.totalHarvestKg,
      h.quantitySoldKg,
      h.quantityRetainedKg,
      h.quantityLossKg,
      h.averageSellingPriceRwf,
      h.buyerReference || null
    );
  }

  const insertListing = db.prepare(`
    INSERT OR REPLACE INTO marketplace_listings (
      id, listing_code, seller_id, seller_name, seller_type, organization_name,
      crop_name, variety, quantity_available, unit_of_measure, price_per_unit_rwf,
      district, sector, harvest_date, grade, is_organic_certified, status,
      image_url, coop_member_allocations_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const l of demoMarketListings) {
    insertListing.run(
      l.id,
      l.listingCode,
      l.sellerId,
      l.sellerName,
      l.sellerType,
      l.organizationName || null,
      l.cropName,
      l.variety,
      l.quantityAvailable,
      l.unitOfMeasure,
      l.pricePerUnitRwf,
      l.district,
      l.sector,
      l.harvestDate,
      l.grade,
      l.isOrganicCertified ? 1 : 0,
      l.status,
      l.imageUrl,
      l.coopMemberAllocations ? JSON.stringify(l.coopMemberAllocations) : null,
      l.createdAt
    );
  }

  const insertOrder = db.prepare(`
    INSERT OR REPLACE INTO orders (
      id, order_number, listing_id, crop_name, buyer_id, buyer_name, buyer_phone,
      seller_id, seller_name, quantity, unit_price_rwf, total_produce_value_rwf,
      commission_rate_percent, commission_amount_rwf, delivery_arrangements,
      order_status, payment_status, payment_method, status_history_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const o of demoOrders) {
    insertOrder.run(
      o.id,
      o.orderNumber,
      o.listingId,
      o.cropName,
      o.buyerId,
      o.buyerName,
      o.buyerPhone,
      o.sellerId,
      o.sellerName,
      o.quantity,
      o.unitPriceRwf,
      o.totalProduceValueRwf,
      o.commissionRatePercent,
      o.commissionAmountRwf,
      o.deliveryArrangements,
      o.orderStatus,
      o.paymentStatus,
      o.paymentMethod,
      JSON.stringify(o.statusHistory),
      o.createdAt
    );
  }

  const insertPlan = db.prepare(`
    INSERT OR REPLACE INTO subscription_plans (id, name, tier, monthly_fee_rwf, features_json)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const p of demoSubscriptionPlans) {
    insertPlan.run(p.id, p.name, p.tier, p.monthlyFeeRwf, JSON.stringify(p.features));
  }

  // Seed sample subscription for Tugimbere co-op
  db.exec(`
    INSERT OR REPLACE INTO subscriptions (
      id, subscriber_id, subscriber_name, plan_tier, status, current_period_start,
      current_period_end, monthly_fee_rwf
    ) VALUES (
      'sub-001', 'usr-coop-01', 'Tugimbere Potato Cooperative', 'coop_pro',
      'active', '2026-10-01', '2026-11-01', 100000
    )
  `);

  // Seed business operating expenses
  db.exec(`
    INSERT OR REPLACE INTO business_expenses (id, category, description, amount_rwf, date, recorded_by)
    VALUES
      ('bexp-01', 'Logistics', 'BioSoil regional feedstock collection truck diesel & maintenance', 180000, '2026-10-15', 'Emmanuel Mugabo'),
      ('bexp-02', 'Labor', 'Compost processing plant skilled staff stipend', 250000, '2026-10-25', 'Emmanuel Mugabo'),
      ('bexp-03', 'Operations', 'Quality laboratory testing batch certificates with RAB', 45000, '2026-10-14', 'Dr. Aloys Habineza')
  `);

  // Seed sample notifications
  db.exec(`
    INSERT OR REPLACE INTO notifications (id, user_id, title, message, category, is_read, link)
    VALUES
      ('notif-01', 'usr-farmer-01', 'Order Completed', 'Order ORD-2026-8812 has been delivered and payment of RWF 1,548,000 confirmed.', 'orders', 0, '/market'),
      ('notif-02', 'usr-operator-01', 'Batch Approved', 'Batch BS-2026-0001 passed RAB quality parameters and is approved for sale.', 'biosoil', 0, '/biosoil'),
      ('notif-03', 'usr-admin-01', 'New Cooperative Onboarded', 'Tugimbere Potato Cooperative joined Cooperative Professional tier.', 'admin', 0, '/admin')
  `);
}

export function resetDemoDatabase() {
  db.exec(`
    DELETE FROM waste_collections;
    DELETE FROM production_batches;
    DELETE FROM batch_processing_logs;
    DELETE FROM products;
    DELETE FROM farms;
    DELETE FROM fields;
    DELETE FROM crop_cycles;
    DELETE FROM farm_expenses;
    DELETE FROM harvest_records;
    DELETE FROM marketplace_listings;
    DELETE FROM orders;
    DELETE FROM payments;
    DELETE FROM subscriptions;
    DELETE FROM business_expenses;
    DELETE FROM notifications;
    DELETE FROM audit_logs;
  `);
  seedAllData();
}
