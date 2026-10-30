import type { Config, Context } from '@netlify/functions';
import { getDatabase } from '@netlify/database';
import { ensureSeeded, resetDemoDatabase, toPg, type Pool } from '../../db/seed.js';
import {
  calculateCropProfitability,
  calculateMarketCommission,
  calculatePlatformFinancials,
  canApproveBatchForSale,
  validateStockAvailability,
} from '../../src/utils/calculations.js';
import { demoUsers } from '../../src/db/seedData.js';

// IngogaBridge REST API — serves every /api/* route used by the frontend,
// backed by Netlify Database (Postgres).

const pool = getDatabase().pool as unknown as Pool;

async function all(text: string, params: unknown[] = []): Promise<any[]> {
  const { rows } = await pool.query(toPg(text), params);
  return rows;
}

async function one(text: string, params: unknown[] = []): Promise<any | undefined> {
  return (await all(text, params))[0];
}

async function exec(text: string, params: unknown[] = []): Promise<number> {
  const { rowCount } = await pool.query(toPg(text), params);
  return rowCount ?? 0;
}

// The active demo role is remembered per browser via a cookie, since serverless
// invocations don't share in-memory state.
const USER_COOKIE = 'ingoga_user';
const DEFAULT_USER_ID = 'usr-admin-01'; // Platform Administrator

interface RouteContext {
  body: any;
  params: Record<string, string>;
  query: Record<string, string>;
  userId: string;
  origin: string;
  setUserId: (id: string) => void;
}

type Handler = (ctx: RouteContext) => Promise<Response>;

const routes: { method: string; pattern: RegExp; keys: string[]; handler: Handler }[] = [];

function route(method: string, path: string, handler: Handler) {
  const keys: string[] = [];
  const pattern = new RegExp(
    '^' + path.replace(/:(\w+)/g, (_, key) => (keys.push(key), '([^/]+)')) + '/?$'
  );
  routes.push({ method, pattern, keys, handler });
}

function json(status: number, data: unknown): Response {
  return Response.json(data, { status });
}

// ==================== AUTH & ROLES ====================
route('GET', '/api/auth/current-user', async (ctx) => {
  const user = await one('SELECT * FROM profiles WHERE id = ?', [ctx.userId]) as any;
  if (!user) {
    const defaultUser = demoUsers[0];
    return json(200, defaultUser);
  }
  return json(200, {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    organization: user.organization,
    district: user.district,
    isVerified: Boolean(user.is_verified),
  });
});

route('GET', '/api/auth/demo-users', async (ctx) => {
  const users = await all('SELECT id, name, email, role, phone, organization, district FROM profiles');
  return json(200, users);
});

route('POST', '/api/auth/switch-role', async (ctx) => {
  const { userId } = ctx.body;
  const user = await one('SELECT * FROM profiles WHERE id = ?', [userId]);
  if (!user) {
    return json(404, { error: 'User role not found' });
  }
  ctx.setUserId(userId);
  return json(200, { success: true, user });
});

route('POST', '/api/auth/register', async (ctx) => {
  const { name, email, role, phone, organization, district } = ctx.body;
  if (!name || !email || !role || !district) {
    return json(400, { error: 'Missing required fields' });
  }

  const existing = await one('SELECT id FROM profiles WHERE email = ?', [email]);
  if (existing) {
    return json(400, { error: 'Email already registered' });
  }

  const id = `usr-${Date.now()}`;
  await exec(`
    INSERT INTO profiles (id, name, email, role, phone, organization, district, is_verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `, [id, name, email, role, phone || null, organization || null, district]);

  ctx.setUserId(id);
  const newUser = await one('SELECT * FROM profiles WHERE id = ?', [id]);
  return json(200, { success: true, user: newUser });
});

// ==================== BIOSOIL MODULE ====================
// Waste collections
route('GET', '/api/biosoil/waste-collections', async (ctx) => {
  const rows = await all('SELECT * FROM waste_collections ORDER BY created_at DESC') as any[];
  const collections = rows.map((r) => ({
    id: r.id,
    collectionRef: r.collection_ref,
    supplierName: r.supplier_name,
    supplierPhone: r.supplier_phone,
    materialCategory: r.material_category,
    estimatedWeightKg: r.estimated_weight_kg,
    acceptedWeightKg: r.accepted_weight_kg,
    collectionDate: r.collection_date,
    collectionLocation: r.collection_location,
    collectionCostRwf: r.collection_cost_rwf,
    transportCostRwf: r.transport_cost_rwf,
    contaminationObservations: r.contamination_observations,
    rejectionReason: r.rejection_reason,
    status: r.status,
    operatorId: r.operator_id,
    operatorName: r.operator_name,
    createdAt: r.created_at,
  }));
  return json(200, collections);
});

route('POST', '/api/biosoil/waste-collections', async (ctx) => {
  const {
    supplierName,
    supplierPhone,
    materialCategory,
    estimatedWeightKg,
    acceptedWeightKg,
    collectionDate,
    collectionLocation,
    collectionCostRwf,
    transportCostRwf,
    contaminationObservations,
    rejectionReason,
    status,
    operatorName,
  } = ctx.body;

  if (!supplierName || !materialCategory || !collectionLocation) {
    return json(400, { error: 'Missing mandatory waste collection fields' });
  }

  const id = `wc-${Date.now()}`;
  const count = Number((await one('SELECT count(*) as count FROM waste_collections'))!.count) + 1;
  const collectionRef = `WC-2026-${String(count).padStart(4, '0')}`;

  await exec(`
    INSERT INTO waste_collections (
      id, collection_ref, supplier_name, supplier_phone, material_category,
      estimated_weight_kg, accepted_weight_kg, collection_date, collection_location,
      collection_cost_rwf, transport_cost_rwf, contamination_observations,
      rejection_reason, status, operator_id, operator_name
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id,
    collectionRef,
    supplierName,
    supplierPhone || null,
    materialCategory,
    Number(estimatedWeightKg) || 0,
    Number(acceptedWeightKg) || 0,
    collectionDate || new Date().toISOString().split('T')[0],
    collectionLocation,
    Number(collectionCostRwf) || 0,
    Number(transportCostRwf) || 0,
    contaminationObservations || null,
    rejectionReason || null,
    status || 'accepted',
    ctx.userId,
    operatorName || 'Emmanuel Mugabo'
  ]);

  // Log audit
  await exec(`
    INSERT INTO audit_logs (id, actor_id, actor_name, action, target_entity, details)
    VALUES (?, ?, ?, 'CREATE_WASTE_COLLECTION', 'waste_collections', ?)
  `, [`audit-${Date.now()}`, ctx.userId, operatorName || 'Operator', `Logged waste collection ${collectionRef}`]);

  return json(200, { success: true, collectionRef });
});

// Production Batches
route('GET', '/api/biosoil/batches', async (ctx) => {
  const rows = await all('SELECT * FROM production_batches ORDER BY created_at DESC') as any[];
  const allLogs = await all('SELECT * FROM batch_processing_logs ORDER BY recorded_at ASC');
  const batches = rows.map((b) => {
    const logs = allLogs.filter((l) => l.batch_id === b.id);
    return {
      id: b.id,
      batchId: b.batch_id,
      productName: b.product_name,
      inputMaterials: JSON.parse(b.input_materials_json || '[]'),
      totalInputWeightKg: b.total_input_weight_kg,
      startDate: b.start_date,
      completionDate: b.completion_date,
      currentStage: b.current_stage,
      processingCostRwf: b.processing_cost_rwf,
      laborCostRwf: b.labor_cost_rwf,
      testingCostRwf: b.testing_cost_rwf,
      finalOutputWeightKg: b.final_output_weight_kg,
      status: b.status,
      operatorId: b.operator_id,
      operatorName: b.operator_name,
      qualityReview: b.quality_review_json ? JSON.parse(b.quality_review_json) : null,
      qrCodeData: b.qr_code_data,
      temperatureLogs: logs.map((l) => ({
        stage: l.stage,
        recordedAt: l.recorded_at,
        temperatureCelsius: l.temperature_celsius,
        moisturePercent: l.moisture_percent,
        operatorNotes: l.operator_notes,
        operatorName: l.operator_name,
      })),
      createdAt: b.created_at,
    };
  });
  return json(200, batches);
});

route('POST', '/api/biosoil/batches', async (ctx) => {
  const { productName, inputMaterials, totalInputWeightKg, startDate, operatorName } = ctx.body;
  if (!productName || !inputMaterials || !inputMaterials.length) {
    return json(400, { error: 'Missing input materials for batch creation' });
  }

  const id = `batch-${Date.now()}`;
  const count = Number((await one('SELECT count(*) as count FROM production_batches'))!.count) + 1;
  const batchId = `BS-2026-${String(count).padStart(4, '0')}`;

  await exec(`
    INSERT INTO production_batches (
      id, batch_id, product_name, input_materials_json, total_input_weight_kg,
      start_date, current_stage, status, operator_id, operator_name,
      processing_cost_rwf, labor_cost_rwf, testing_cost_rwf, final_output_weight_kg
    ) VALUES (?, ?, ?, ?, ?, ?, 'pre_treatment', 'processing', ?, ?, 45000, 30000, 0, 0)
  `, [
    id,
    batchId,
    productName,
    JSON.stringify(inputMaterials),
    Number(totalInputWeightKg) || 0,
    startDate || new Date().toISOString().split('T')[0],
    ctx.userId,
    operatorName || 'Emmanuel Mugabo'
  ]);

  // Add initial log
  await exec(`
    INSERT INTO batch_processing_logs (
      id, batch_id, stage, recorded_at, temperature_celsius, moisture_percent,
      operator_notes, operator_name
    ) VALUES (?, ?, 'pre_treatment', ?, 28.0, 55.0, 'Batch initiated and raw materials blended.', ?)
  `, [`log-${Date.now()}`, id, new Date().toISOString(), operatorName || 'Emmanuel Mugabo']);

  return json(200, { success: true, batchId, id });
});

// Quality Gate Approval API
route('POST', '/api/biosoil/batches/:batchId/quality-review', async (ctx) => {
  const { batchId } = ctx.params;
  const {
    reviewerName,
    moistureSatisfactory,
    temperatureCurveVerified,
    curingMaturityPassed,
    weedPathogenFree,
    labTested,
    labNotes,
    decision,
    decisionNotes,
    finalOutputWeightKg,
  } = ctx.body;

  const batch = await one('SELECT * FROM production_batches WHERE id = ? OR batch_id = ?', [batchId, batchId]) as any;
  if (!batch) {
    return json(404, { error: 'Batch not found' });
  }

  // Validate Quality Gate rule
  if (decision === 'approved') {
    const gateCheck = canApproveBatchForSale({
      moistureSatisfactory: Boolean(moistureSatisfactory),
      temperatureCurveVerified: Boolean(temperatureCurveVerified),
      curingMaturityPassed: Boolean(curingMaturityPassed),
      weedPathogenFree: Boolean(weedPathogenFree),
      authorizedSignoff: Boolean(reviewerName && reviewerName.length > 3),
    });

    if (!gateCheck.approved) {
      return json(422, {
        error: 'Batch quality approval failed gate requirements',
        reasons: gateCheck.reasons,
      });
    }
  }

  const qualityReviewObj = {
    reviewedAt: new Date().toISOString(),
    reviewerName,
    moistureSatisfactory,
    temperatureCurveVerified,
    curingMaturityPassed,
    weedPathogenFree,
    labTested,
    labNotes,
    decision,
    decisionNotes,
  };

  const newStatus = decision === 'approved' ? 'approved' : 'rejected';
  const appUrl = ctx.origin;
  const qrUrl = `${appUrl}/verify-batch/${batch.batch_id}`;

  await exec(`
    UPDATE production_batches
    SET quality_review_json = ?,
        status = ?,
        final_output_weight_kg = COALESCE(?, final_output_weight_kg),
        qr_code_data = ?,
        completion_date = ?
    WHERE id = ?
  `, [
    JSON.stringify(qualityReviewObj),
    newStatus,
    finalOutputWeightKg ? Number(finalOutputWeightKg) : null,
    qrUrl,
    new Date().toISOString().split('T')[0],
    batch.id
  ]);

  return json(200, { success: true, status: newStatus, qrUrl });
});

// Public Batch Traceability (Safe Provenance without internal private costs)
route('GET', '/api/biosoil/traceability/:batchId', async (ctx) => {
  const { batchId } = ctx.params;
  const batch = await one('SELECT * FROM production_batches WHERE id = ? OR batch_id = ?', [batchId, batchId]) as any;
  if (!batch) {
    return json(404, { error: 'Batch traceability certificate not found' });
  }

  const logs = await all('SELECT stage, recorded_at, temperature_celsius, moisture_percent, operator_notes FROM batch_processing_logs WHERE batch_id = ?', [batch.id]) as any[];
  const rawInputs = JSON.parse(batch.input_materials_json || '[]');

  // Sanitize data: expose categories and verified standards, but hide supplier private phone numbers and internal costs
  return json(200, {
    batchId: batch.batch_id,
    productName: batch.product_name,
    startDate: batch.start_date,
    completionDate: batch.completion_date,
    status: batch.status,
    finalOutputWeightKg: batch.final_output_weight_kg,
    inputMaterialCategories: rawInputs.map((i: any) => i.category),
    qualityReview: batch.quality_review_json ? JSON.parse(batch.quality_review_json) : null,
    processingStagesVerified: logs.length,
    qrCodeData: batch.qr_code_data,
    standardCertified: 'Rwanda RS 459: Organic Soil Conditioners Compliance',
  });
});

// Products & Stock
route('GET', '/api/biosoil/products', async (ctx) => {
  const products = await all("SELECT * FROM products WHERE quality_status = 'approved'") as any[];
  return json(200, products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    category: p.category,
    batchId: p.batch_id,
    packageSize: p.package_size,
    unitOfMeasure: p.unit_of_measure,
    unitPriceRwf: p.unit_price_rwf,
    costOfProductionRwf: p.cost_of_production_rwf,
    availableStock: p.available_stock,
    storageInstructions: p.storage_instructions,
    applicationInstructions: p.application_instructions,
    qualityStatus: p.quality_status,
    imageUrl: p.image_url,
  })));
});

// ==================== FARMGROW MODULE ====================
route('GET', '/api/farmgrow/farms', async (ctx) => {
  const farms = await all('SELECT * FROM farms') as any[];
  return json(200, farms.map((f) => ({
    id: f.id,
    farmerId: f.farmer_id,
    farmerName: f.farmer_name,
    farmName: f.farm_name,
    district: f.district,
    sector: f.sector,
    totalAreaHa: f.total_area_ha,
    soilType: f.soil_type,
    irrigationSource: f.irrigation_source,
  })));
});

route('GET', '/api/farmgrow/crop-cycles', async (ctx) => {
  const cycles = await all('SELECT * FROM crop_cycles ORDER BY created_at DESC') as any[];
  return json(200, cycles.map((c) => ({
    id: c.id,
    farmId: c.farm_id,
    plotId: c.plot_id,
    plotName: c.plot_name,
    cropName: c.crop_name,
    variety: c.variety,
    plantingDate: c.planting_date,
    expectedHarvestDate: c.expected_harvest_date,
    fieldAreaHa: c.field_area_ha,
    seedQuantityKg: c.seed_quantity_kg,
    expectedHarvestKg: c.expected_harvest_kg,
    actualHarvestKg: c.actual_harvest_kg,
    status: c.status,
    notes: c.notes,
  })));
});

route('POST', '/api/farmgrow/crop-cycles', async (ctx) => {
  const {
    farmId,
    plotName,
    cropName,
    variety,
    plantingDate,
    expectedHarvestDate,
    fieldAreaHa,
    seedQuantityKg,
    expectedHarvestKg,
    notes,
  } = ctx.body;

  const id = `crop-${Date.now()}`;
  await exec(`
    INSERT INTO crop_cycles (
      id, farm_id, plot_id, plot_name, crop_name, variety, planting_date,
      expected_harvest_date, field_area_ha, seed_quantity_kg, expected_harvest_kg,
      actual_harvest_kg, status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'planted', ?)
  `, [
    id,
    farmId || 'farm-001',
    `plot-${Date.now()}`,
    plotName || 'Kinigi Terrace',
    cropName,
    variety || 'Standard Certified',
    plantingDate || new Date().toISOString().split('T')[0],
    expectedHarvestDate,
    Number(fieldAreaHa) || 1.0,
    Number(seedQuantityKg) || 100,
    Number(expectedHarvestKg) || 1000,
    notes || null
  ]);

  return json(200, { success: true, id });
});

route('GET', '/api/farmgrow/expenses', async (ctx) => {
  const expenses = await all('SELECT * FROM farm_expenses ORDER BY date DESC') as any[];
  return json(200, expenses.map((e) => ({
    id: e.id,
    farmId: e.farm_id,
    cropCycleId: e.crop_cycle_id,
    cropName: e.crop_name,
    date: e.date,
    category: e.category,
    description: e.description,
    quantity: e.quantity,
    unit: e.unit,
    amountRwf: e.amount_rwf,
  })));
});

route('POST', '/api/farmgrow/expenses', async (ctx) => {
  const { farmId, cropCycleId, cropName, date, category, description, quantity, unit, amountRwf } = ctx.body;
  if (!amountRwf || !category) {
    return json(400, { error: 'Category and amount are required' });
  }

  const id = `exp-${Date.now()}`;
  await exec(`
    INSERT INTO farm_expenses (
      id, farm_id, crop_cycle_id, crop_name, date, category, description,
      quantity, unit, amount_rwf
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id,
    farmId || 'farm-001',
    cropCycleId || 'crop-001',
    cropName || 'Irish Potatoes',
    date || new Date().toISOString().split('T')[0],
    category,
    description || 'Farm operational input',
    Number(quantity) || 1,
    unit || 'unit',
    Number(amountRwf) || 0
  ]);

  return json(200, { success: true, id });
});

route('GET', '/api/farmgrow/harvests', async (ctx) => {
  const harvests = await all('SELECT * FROM harvest_records ORDER BY harvest_date DESC') as any[];
  return json(200, harvests.map((h) => ({
    id: h.id,
    farmId: h.farm_id,
    cropCycleId: h.crop_cycle_id,
    cropName: h.crop_name,
    harvestDate: h.harvest_date,
    totalHarvestKg: h.total_harvest_kg,
    quantitySoldKg: h.quantity_sold_kg,
    quantityRetainedKg: h.quantity_retained_kg,
    quantityLossKg: h.quantity_loss_kg,
    averageSellingPriceRwf: h.average_selling_price_rwf,
    buyerReference: h.buyer_reference,
  })));
});

route('POST', '/api/farmgrow/harvests', async (ctx) => {
  const {
    farmId,
    cropCycleId,
    cropName,
    harvestDate,
    totalHarvestKg,
    quantitySoldKg,
    quantityRetainedKg,
    quantityLossKg,
    averageSellingPriceRwf,
    buyerReference,
  } = ctx.body;

  const id = `harv-${Date.now()}`;
  await exec(`
    INSERT INTO harvest_records (
      id, farm_id, crop_cycle_id, crop_name, harvest_date, total_harvest_kg,
      quantity_sold_kg, quantity_retained_kg, quantity_loss_kg, average_selling_price_rwf,
      buyer_reference
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id,
    farmId || 'farm-001',
    cropCycleId || 'crop-001',
    cropName || 'Irish Potatoes',
    harvestDate || new Date().toISOString().split('T')[0],
    Number(totalHarvestKg) || 0,
    Number(quantitySoldKg) || 0,
    Number(quantityRetainedKg) || 0,
    Number(quantityLossKg) || 0,
    Number(averageSellingPriceRwf) || 0,
    buyerReference || null
  ]);

  return json(200, { success: true, id });
});

route('GET', '/api/farmgrow/profitability', async (ctx) => {
  const expenses = await all('SELECT amount_rwf as "amountRwf" FROM farm_expenses') as any[];
  const harvests = await all(`
    SELECT quantity_sold_kg as "quantitySoldKg",
           average_selling_price_rwf as "averageSellingPriceRwf",
           total_harvest_kg as "totalHarvestKg"
    FROM harvest_records
  `) as any[];

  const profitability = calculateCropProfitability({
    expenses,
    harvests,
  });

  return json(200, profitability);
});

// ==================== INGOGAMARKET MODULE ====================
route('GET', '/api/market/listings', async (ctx) => {
  const { crop, district, grade, sellerType } = ctx.query;
  let sqlText = "SELECT * FROM marketplace_listings WHERE status != 'archived'";
  const params: any[] = [];

  if (crop) {
    sqlText += ' AND crop_name ILIKE ?';
    params.push(`%${crop}%`);
  }
  if (district) {
    sqlText += ' AND district = ?';
    params.push(district);
  }
  if (grade) {
    sqlText += ' AND grade = ?';
    params.push(grade);
  }
  if (sellerType) {
    sqlText += ' AND seller_type = ?';
    params.push(sellerType);
  }

  sqlText += ' ORDER BY created_at DESC';
  const rows = await all(sqlText, params) as any[];

  const listings = rows.map((l) => ({
    id: l.id,
    listingCode: l.listing_code,
    sellerId: l.seller_id,
    sellerName: l.seller_name,
    sellerType: l.seller_type,
    organizationName: l.organization_name,
    cropName: l.crop_name,
    variety: l.variety,
    quantityAvailable: l.quantity_available,
    unitOfMeasure: l.unit_of_measure,
    pricePerUnitRwf: l.price_per_unit_rwf,
    district: l.district,
    sector: l.sector,
    harvestDate: l.harvest_date,
    grade: l.grade,
    isOrganicCertified: Boolean(l.is_organic_certified),
    status: l.status,
    imageUrl: l.image_url,
    coopMemberAllocations: l.coop_member_allocations_json ? JSON.parse(l.coop_member_allocations_json) : null,
    createdAt: l.created_at,
  }));

  return json(200, listings);
});

route('POST', '/api/market/listings', async (ctx) => {
  const {
    cropName,
    variety,
    quantityAvailable,
    unitOfMeasure,
    pricePerUnitRwf,
    district,
    sector,
    harvestDate,
    grade,
    isOrganicCertified,
    status,
    imageUrl,
    coopMemberAllocations,
  } = ctx.body;

  if (!cropName || !quantityAvailable || !pricePerUnitRwf) {
    return json(400, { error: 'Missing mandatory listing details' });
  }

  const user = await one('SELECT * FROM profiles WHERE id = ?', [ctx.userId]) as any;
  const count = Number((await one('SELECT count(*) as count FROM marketplace_listings'))!.count) + 1;
  const listingCode = `IM-2026-${String(count).padStart(4, '0')}`;
  const id = `list-${Date.now()}`;

  await exec(`
    INSERT INTO marketplace_listings (
      id, listing_code, seller_id, seller_name, seller_type, organization_name,
      crop_name, variety, quantity_available, unit_of_measure, price_per_unit_rwf,
      district, sector, harvest_date, grade, is_organic_certified, status,
      image_url, coop_member_allocations_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id,
    listingCode,
    user?.id || 'usr-farmer-01',
    user?.name || 'Jean-Pierre Habimana',
    user?.role === 'coop_manager' ? 'cooperative' : 'farmer',
    user?.organization || 'Independent Farmer',
    cropName,
    variety || 'Standard Grade',
    Number(quantityAvailable),
    unitOfMeasure || 'kg',
    Number(pricePerUnitRwf),
    district || user?.district || 'Musanze',
    sector || 'Kinigi',
    harvestDate || new Date().toISOString().split('T')[0],
    grade || 'Grade 1 (Standard Wholesale)',
    isOrganicCertified ? 1 : 0,
    status || 'available_now',
    imageUrl || 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
    coopMemberAllocations ? JSON.stringify(coopMemberAllocations) : null
  ]);

  return json(200, { success: true, listingCode, id });
});

// Orders & Order Workflow
route('GET', '/api/market/orders', async (ctx) => {
  const rows = await all('SELECT * FROM orders ORDER BY created_at DESC') as any[];
  const orders = rows.map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    listingId: o.listing_id,
    cropName: o.crop_name,
    buyerId: o.buyer_id,
    buyerName: o.buyer_name,
    buyerPhone: o.buyer_phone,
    sellerId: o.seller_id,
    sellerName: o.seller_name,
    quantity: o.quantity,
    unitPriceRwf: o.unit_price_rwf,
    totalProduceValueRwf: o.total_produce_value_rwf,
    commissionRatePercent: o.commission_rate_percent,
    commissionAmountRwf: o.commission_amount_rwf,
    deliveryArrangements: o.delivery_arrangements,
    orderStatus: o.order_status,
    paymentStatus: o.payment_status,
    paymentMethod: o.payment_method,
    statusHistory: JSON.parse(o.status_history_json || '[]'),
    createdAt: o.created_at,
  }));
  return json(200, orders);
});

route('POST', '/api/market/orders', async (ctx) => {
  const { listingId, quantity, deliveryArrangements, paymentMethod } = ctx.body;
  const listing = await one('SELECT * FROM marketplace_listings WHERE id = ?', [listingId]) as any;
  if (!listing) {
    return json(404, { error: 'Produce listing not found' });
  }

  // Stock overselling validation
  const orderQty = Number(quantity);
  const stockCheck = validateStockAvailability(listing.quantity_available, orderQty);
  if (!stockCheck.canFulfill) {
    return json(400, {
      error: `Requested quantity (${orderQty} ${listing.unit_of_measure}) exceeds available stock (${listing.quantity_available})`,
    });
  }

  const user = await one('SELECT * FROM profiles WHERE id = ?', [ctx.userId]) as any;
  const count = Number((await one('SELECT count(*) as count FROM orders'))!.count) + 1;
  const orderNumber = `ORD-2026-${String(count).padStart(4, '0')}`;
  const id = `ord-${Date.now()}`;

  const totalProduceValueRwf = orderQty * listing.price_per_unit_rwf;
  const commissionRatePercent = 4.0;
  const commissionAmountRwf = calculateMarketCommission(totalProduceValueRwf, commissionRatePercent);

  const initialHistory = [
    {
      status: 'submitted',
      timestamp: new Date().toISOString(),
      notes: `Order submitted by ${user?.name || 'Buyer'} for ${orderQty} ${listing.unit_of_measure}`,
    },
  ];

  // Atomic deduction of stock (guards against concurrent overselling)
  const deducted = await exec(`
    UPDATE marketplace_listings
    SET quantity_available = quantity_available - ?
    WHERE id = ? AND quantity_available >= ?
  `, [orderQty, listing.id, orderQty]);
  if (deducted === 0) {
    return json(400, { error: 'Requested quantity exceeds available stock' });
  }

  await exec(`
    INSERT INTO orders (
      id, order_number, listing_id, crop_name, buyer_id, buyer_name, buyer_phone,
      seller_id, seller_name, quantity, unit_price_rwf, total_produce_value_rwf,
      commission_rate_percent, commission_amount_rwf, delivery_arrangements,
      order_status, payment_status, payment_method, status_history_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', 'pending', ?, ?)
  `, [
    id,
    orderNumber,
    listing.id,
    listing.crop_name,
    user?.id || 'usr-buyer-01',
    user?.name || 'David Gasana',
    user?.phone || '+250 788 778 899',
    listing.seller_id,
    listing.seller_name,
    orderQty,
    listing.price_per_unit_rwf,
    totalProduceValueRwf,
    commissionRatePercent,
    commissionAmountRwf,
    deliveryArrangements || 'Hub Pickup Musanze',
    paymentMethod || 'momo_rwanda',
    JSON.stringify(initialHistory)
  ]);

  return json(200, { success: true, orderNumber, id });
});

route('PATCH', '/api/market/orders/:orderId/status', async (ctx) => {
  const { orderId } = ctx.params;
  const { newStatus, notes } = ctx.body;

  const order = await one('SELECT * FROM orders WHERE id = ?', [orderId]) as any;
  if (!order) {
    return json(404, { error: 'Order not found' });
  }

  const history = JSON.parse(order.status_history_json || '[]');
  history.push({
    status: newStatus,
    timestamp: new Date().toISOString(),
    notes: notes || `Status updated to ${newStatus}`,
  });

  let paymentStatus = order.payment_status;
  if (newStatus === 'completed') {
    paymentStatus = 'confirmed';
  }

  await exec(`
    UPDATE orders
    SET order_status = ?,
        payment_status = ?,
        status_history_json = ?
    WHERE id = ?
  `, [newStatus, paymentStatus, JSON.stringify(history), order.id]);

  return json(200, { success: true, newStatus });
});

route('POST', '/api/market/orders/:orderId/simulate-payment', async (ctx) => {
  const { orderId } = ctx.params;
  const { paymentMethod } = ctx.body;

  const order = await one('SELECT * FROM orders WHERE id = ?', [orderId]) as any;
  if (!order) {
    return json(404, { error: 'Order not found' });
  }

  const paymentRef = `PAY-RW-${Date.now().toString().slice(-6)}`;
  await exec(`
    INSERT INTO payments (
      id, payment_reference, order_id, payer_id, payer_name, payee_id, payee_name,
      amount_rwf, payment_method, payment_status, reconciliation_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', 'reconciled')
  `, [
    `pay-${Date.now()}`,
    paymentRef,
    order.id,
    order.buyer_id,
    order.buyer_name,
    order.seller_id,
    order.seller_name,
    order.total_produce_value_rwf,
    paymentMethod || 'momo_rwanda'
  ]);

  await exec(`
    UPDATE orders
    SET payment_status = 'confirmed',
        order_status = 'confirmed'
    WHERE id = ?
  `, [order.id]);

  return json(200, { success: true, paymentRef });
});

// ==================== FINANCIAL REPORTING & ANALYTICS ====================
route('GET', '/api/finance/overview', async (ctx) => {
  // 1. Gross Marketplace Produce Volume (sum of completed/confirmed orders)
  const gmvRow = await one(`
    SELECT COALESCE(SUM(total_produce_value_rwf), 0) as gmv,
           COALESCE(SUM(commission_amount_rwf), 0) as commissions
    FROM orders
    WHERE order_status IN ('confirmed', 'fulfillment', 'delivered', 'completed')
  `) as any;

  // 2. Recognized BioSoil Product Sales
  const biosoilSalesRow = await one(`
    SELECT COALESCE(SUM(unit_price_rwf * 20), 0) as sales
    FROM products
  `) as any;

  // 3. Recognized Subscriptions
  const subsRow = await one(`
    SELECT COALESCE(SUM(monthly_fee_rwf), 0) as subs
    FROM subscriptions
    WHERE status = 'active'
  `) as any;

  // 4. Operating Expenses
  const opexRow = await one(`
    SELECT COALESCE(SUM(amount_rwf), 0) as opex
    FROM business_expenses
  `) as any;

  const financials = calculatePlatformFinancials({
    grossMarketplaceProduceVolumeRwf: Number(gmvRow.gmv) || 4108000,
    recognizedCommissionsRwf: Number(gmvRow.commissions) || 164320,
    recognizedBioSoilSalesRwf: Number(biosoilSalesRow.sales) || 580000,
    recognizedSubscriptionsRwf: Number(subsRow.subs) || 100000,
    recognizedBuyerServicesRwf: 120000,
    costOfBioSoilGoodsSoldRwf: 220000,
    operatingExpensesRwf: Number(opexRow.opex) || 475000,
  });

  return json(200, financials);
});

// Subscriptions
route('GET', '/api/subscriptions/plans', async (ctx) => {
  const plans = await all('SELECT * FROM subscription_plans') as any[];
  return json(200, plans.map((p) => ({
    id: p.id,
    name: p.name,
    tier: p.tier,
    monthlyFeeRwf: p.monthly_fee_rwf,
    features: JSON.parse(p.features_json || '[]'),
  })));
});

route('GET', '/api/subscriptions/current', async (ctx) => {
  const subs = await all('SELECT * FROM subscriptions') as any[];
  return json(200, subs);
});

// Notifications
route('GET', '/api/notifications', async (ctx) => {
  const notifs = await all('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 20') as any[];
  return json(200, notifs.map((n) => ({
    id: n.id,
    userId: n.user_id,
    title: n.title,
    message: n.message,
    category: n.category,
    isRead: Boolean(n.is_read),
    link: n.link,
    createdAt: n.created_at,
  })));
});

// Demo Reset Endpoint
route('POST', '/api/demo/reset', async (ctx) => {
  await resetDemoDatabase(pool);
  return json(200, { success: true, message: 'IngogaBridge demo environment reset to default pristine state' });
});


export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const match = routes
    .filter((r) => r.method === req.method)
    .map((r) => ({ r, m: url.pathname.match(r.pattern) }))
    .find(({ m }) => m);

  if (!match) {
    return json(404, { error: 'Not found' });
  }

  let body: any = {};
  if (req.method !== 'GET') {
    body = await req.json().catch(() => ({}));
  }

  let newUserId: string | null = null;
  const params = Object.fromEntries(
    match.r.keys.map((key, i) => [key, decodeURIComponent(match.m![i + 1])])
  );

  try {
    await ensureSeeded(pool);
    const res = await match.r.handler({
      body,
      params,
      query: Object.fromEntries(url.searchParams),
      userId: context.cookies.get(USER_COOKIE) || DEFAULT_USER_ID,
      origin: url.origin,
      setUserId: (id) => {
        newUserId = id;
      },
    });
    if (newUserId) {
      context.cookies.set({
        name: USER_COOKIE,
        value: newUserId,
        path: '/',
        httpOnly: true,
        secure: url.protocol === 'https:',
        sameSite: 'Lax',
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    return res;
  } catch (err) {
    console.error(`API error on ${req.method} ${url.pathname}:`, err);
    return json(500, { error: 'Internal server error' });
  }
};

export const config: Config = {
  path: '/api/*',
};
