import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase, db, resetDemoDatabase } from './src/db/database';
import {
  calculateCropProfitability,
  calculateBatchEconomics,
  calculateMarketCommission,
  calculatePlatformFinancials,
  canApproveBatchForSale,
  validateStockAvailability,
} from './src/utils/calculations';
import { demoUsers } from './src/db/seedData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB and Seed
initializeDatabase();

const app = express();
app.use(express.json());

// In-memory session tracking for Demo role switching
let currentUserId = 'usr-admin-01'; // Default: Platform Administrator

// ==================== AUTH & ROLES ====================
app.get('/api/auth/current-user', (req, res) => {
  const user = db.prepare('SELECT * FROM profiles WHERE id = ?').get(currentUserId) as any;
  if (!user) {
    const defaultUser = demoUsers[0];
    return res.json(defaultUser);
  }
  res.json({
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

app.get('/api/auth/demo-users', (req, res) => {
  const users = db.prepare('SELECT id, name, email, role, phone, organization, district FROM profiles').all();
  res.json(users);
});

app.post('/api/auth/switch-role', (req, res) => {
  const { userId } = req.body;
  const user = db.prepare('SELECT * FROM profiles WHERE id = ?').get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User role not found' });
  }
  currentUserId = userId;
  res.json({ success: true, user });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, role, phone, organization, district } = req.body;
  if (!name || !email || !role || !district) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const existing = db.prepare('SELECT id FROM profiles WHERE email = ?').get(email);
  if (existing) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const id = `usr-${Date.now()}`;
  db.prepare(`
    INSERT INTO profiles (id, name, email, role, phone, organization, district, is_verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `).run(id, name, email, role, phone || null, organization || null, district);

  currentUserId = id;
  const newUser = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id);
  res.json({ success: true, user: newUser });
});

// ==================== BIOSOIL MODULE ====================
// Waste collections
app.get('/api/biosoil/waste-collections', (req, res) => {
  const rows = db.prepare('SELECT * FROM waste_collections ORDER BY created_at DESC').all() as any[];
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
  res.json(collections);
});

app.post('/api/biosoil/waste-collections', (req, res) => {
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
  } = req.body;

  if (!supplierName || !materialCategory || !collectionLocation) {
    return res.status(400).json({ error: 'Missing mandatory waste collection fields' });
  }

  const id = `wc-${Date.now()}`;
  const count = (db.prepare('SELECT count(*) as count FROM waste_collections').get() as any).count + 1;
  const collectionRef = `WC-2026-${String(count).padStart(4, '0')}`;

  db.prepare(`
    INSERT INTO waste_collections (
      id, collection_ref, supplier_name, supplier_phone, material_category,
      estimated_weight_kg, accepted_weight_kg, collection_date, collection_location,
      collection_cost_rwf, transport_cost_rwf, contamination_observations,
      rejection_reason, status, operator_id, operator_name
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
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
    currentUserId,
    operatorName || 'Emmanuel Mugabo'
  );

  // Log audit
  db.prepare(`
    INSERT INTO audit_logs (id, actor_id, actor_name, action, target_entity, details)
    VALUES (?, ?, ?, 'CREATE_WASTE_COLLECTION', 'waste_collections', ?)
  `).run(`audit-${Date.now()}`, currentUserId, operatorName || 'Operator', `Logged waste collection ${collectionRef}`);

  res.json({ success: true, collectionRef });
});

// Production Batches
app.get('/api/biosoil/batches', (req, res) => {
  const rows = db.prepare('SELECT * FROM production_batches ORDER BY created_at DESC').all() as any[];
  const batches = rows.map((b) => {
    const logs = db.prepare('SELECT * FROM batch_processing_logs WHERE batch_id = ? ORDER BY recorded_at ASC').all(b.id) as any[];
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
  res.json(batches);
});

app.post('/api/biosoil/batches', (req, res) => {
  const { productName, inputMaterials, totalInputWeightKg, startDate, operatorName } = req.body;
  if (!productName || !inputMaterials || !inputMaterials.length) {
    return res.status(400).json({ error: 'Missing input materials for batch creation' });
  }

  const id = `batch-${Date.now()}`;
  const count = (db.prepare('SELECT count(*) as count FROM production_batches').get() as any).count + 1;
  const batchId = `BS-2026-${String(count).padStart(4, '0')}`;

  db.prepare(`
    INSERT INTO production_batches (
      id, batch_id, product_name, input_materials_json, total_input_weight_kg,
      start_date, current_stage, status, operator_id, operator_name,
      processing_cost_rwf, labor_cost_rwf, testing_cost_rwf, final_output_weight_kg
    ) VALUES (?, ?, ?, ?, ?, ?, 'pre_treatment', 'processing', ?, ?, 45000, 30000, 0, 0)
  `).run(
    id,
    batchId,
    productName,
    JSON.stringify(inputMaterials),
    Number(totalInputWeightKg) || 0,
    startDate || new Date().toISOString().split('T')[0],
    currentUserId,
    operatorName || 'Emmanuel Mugabo'
  );

  // Add initial log
  db.prepare(`
    INSERT INTO batch_processing_logs (
      id, batch_id, stage, recorded_at, temperature_celsius, moisture_percent,
      operator_notes, operator_name
    ) VALUES (?, ?, 'pre_treatment', ?, 28.0, 55.0, 'Batch initiated and raw materials blended.', ?)
  `).run(`log-${Date.now()}`, id, new Date().toISOString(), operatorName || 'Emmanuel Mugabo');

  res.json({ success: true, batchId, id });
});

// Quality Gate Approval API
app.post('/api/biosoil/batches/:batchId/quality-review', (req, res) => {
  const { batchId } = req.params;
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
  } = req.body;

  const batch = db.prepare('SELECT * FROM production_batches WHERE id = ? OR batch_id = ?').get(batchId, batchId) as any;
  if (!batch) {
    return res.status(404).json({ error: 'Batch not found' });
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
      return res.status(422).json({
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
  const appUrl = process.env.AIS_BASE_URL || 'http://localhost:3000';
  const qrUrl = `${appUrl}/verify-batch/${batch.batch_id}`;

  db.prepare(`
    UPDATE production_batches
    SET quality_review_json = ?,
        status = ?,
        final_output_weight_kg = COALESCE(?, final_output_weight_kg),
        qr_code_data = ?,
        completion_date = ?
    WHERE id = ?
  `).run(
    JSON.stringify(qualityReviewObj),
    newStatus,
    finalOutputWeightKg ? Number(finalOutputWeightKg) : null,
    qrUrl,
    new Date().toISOString().split('T')[0],
    batch.id
  );

  res.json({ success: true, status: newStatus, qrUrl });
});

// Public Batch Traceability (Safe Provenance without internal private costs)
app.get('/api/biosoil/traceability/:batchId', (req, res) => {
  const { batchId } = req.params;
  const batch = db.prepare('SELECT * FROM production_batches WHERE id = ? OR batch_id = ?').get(batchId, batchId) as any;
  if (!batch) {
    return res.status(404).json({ error: 'Batch traceability certificate not found' });
  }

  const logs = db.prepare('SELECT stage, recorded_at, temperature_celsius, moisture_percent, operator_notes FROM batch_processing_logs WHERE batch_id = ?').all(batch.id) as any[];
  const rawInputs = JSON.parse(batch.input_materials_json || '[]');

  // Sanitize data: expose categories and verified standards, but hide supplier private phone numbers and internal costs
  res.json({
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
app.get('/api/biosoil/products', (req, res) => {
  const products = db.prepare("SELECT * FROM products WHERE quality_status = 'approved'").all() as any[];
  res.json(products.map((p) => ({
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
app.get('/api/farmgrow/farms', (req, res) => {
  const farms = db.prepare('SELECT * FROM farms').all() as any[];
  res.json(farms.map((f) => ({
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

app.get('/api/farmgrow/crop-cycles', (req, res) => {
  const cycles = db.prepare('SELECT * FROM crop_cycles ORDER BY created_at DESC').all() as any[];
  res.json(cycles.map((c) => ({
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

app.post('/api/farmgrow/crop-cycles', (req, res) => {
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
  } = req.body;

  const id = `crop-${Date.now()}`;
  db.prepare(`
    INSERT INTO crop_cycles (
      id, farm_id, plot_id, plot_name, crop_name, variety, planting_date,
      expected_harvest_date, field_area_ha, seed_quantity_kg, expected_harvest_kg,
      actual_harvest_kg, status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'planted', ?)
  `).run(
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
  );

  res.json({ success: true, id });
});

app.get('/api/farmgrow/expenses', (req, res) => {
  const expenses = db.prepare('SELECT * FROM farm_expenses ORDER BY date DESC').all() as any[];
  res.json(expenses.map((e) => ({
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

app.post('/api/farmgrow/expenses', (req, res) => {
  const { farmId, cropCycleId, cropName, date, category, description, quantity, unit, amountRwf } = req.body;
  if (!amountRwf || !category) {
    return res.status(400).json({ error: 'Category and amount are required' });
  }

  const id = `exp-${Date.now()}`;
  db.prepare(`
    INSERT INTO farm_expenses (
      id, farm_id, crop_cycle_id, crop_name, date, category, description,
      quantity, unit, amount_rwf
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
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
  );

  res.json({ success: true, id });
});

app.get('/api/farmgrow/harvests', (req, res) => {
  const harvests = db.prepare('SELECT * FROM harvest_records ORDER BY harvest_date DESC').all() as any[];
  res.json(harvests.map((h) => ({
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

app.post('/api/farmgrow/harvests', (req, res) => {
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
  } = req.body;

  const id = `harv-${Date.now()}`;
  db.prepare(`
    INSERT INTO harvest_records (
      id, farm_id, crop_cycle_id, crop_name, harvest_date, total_harvest_kg,
      quantity_sold_kg, quantity_retained_kg, quantity_loss_kg, average_selling_price_rwf,
      buyer_reference
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
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
  );

  res.json({ success: true, id });
});

app.get('/api/farmgrow/profitability', (req, res) => {
  const expenses = db.prepare('SELECT amount_rwf as amountRwf FROM farm_expenses').all() as any[];
  const harvests = db.prepare(`
    SELECT quantity_sold_kg as quantitySoldKg,
           average_selling_price_rwf as averageSellingPriceRwf,
           total_harvest_kg as totalHarvestKg
    FROM harvest_records
  `).all() as any[];

  const profitability = calculateCropProfitability({
    expenses,
    harvests,
  });

  res.json(profitability);
});

// ==================== INGOGAMARKET MODULE ====================
app.get('/api/market/listings', (req, res) => {
  const { crop, district, grade, sellerType } = req.query;
  let query = "SELECT * FROM marketplace_listings WHERE status != 'archived'";
  const params: any[] = [];

  if (crop) {
    query += ' AND crop_name LIKE ?';
    params.push(`%${crop}%`);
  }
  if (district) {
    query += ' AND district = ?';
    params.push(district);
  }
  if (grade) {
    query += ' AND grade = ?';
    params.push(grade);
  }
  if (sellerType) {
    query += ' AND seller_type = ?';
    params.push(sellerType);
  }

  query += ' ORDER BY created_at DESC';
  const rows = db.prepare(query).all(...params) as any[];

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

  res.json(listings);
});

app.post('/api/market/listings', (req, res) => {
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
  } = req.body;

  if (!cropName || !quantityAvailable || !pricePerUnitRwf) {
    return res.status(400).json({ error: 'Missing mandatory listing details' });
  }

  const user = db.prepare('SELECT * FROM profiles WHERE id = ?').get(currentUserId) as any;
  const count = (db.prepare('SELECT count(*) as count FROM marketplace_listings').get() as any).count + 1;
  const listingCode = `IM-2026-${String(count).padStart(4, '0')}`;
  const id = `list-${Date.now()}`;

  db.prepare(`
    INSERT INTO marketplace_listings (
      id, listing_code, seller_id, seller_name, seller_type, organization_name,
      crop_name, variety, quantity_available, unit_of_measure, price_per_unit_rwf,
      district, sector, harvest_date, grade, is_organic_certified, status,
      image_url, coop_member_allocations_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
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
  );

  res.json({ success: true, listingCode, id });
});

// Orders & Order Workflow
app.get('/api/market/orders', (req, res) => {
  const rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as any[];
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
  res.json(orders);
});

app.post('/api/market/orders', (req, res) => {
  const { listingId, quantity, deliveryArrangements, paymentMethod } = req.body;
  const listing = db.prepare('SELECT * FROM marketplace_listings WHERE id = ?').get(listingId) as any;
  if (!listing) {
    return res.status(404).json({ error: 'Produce listing not found' });
  }

  // Stock overselling validation
  const orderQty = Number(quantity);
  const stockCheck = validateStockAvailability(listing.quantity_available, orderQty);
  if (!stockCheck.canFulfill) {
    return res.status(400).json({
      error: `Requested quantity (${orderQty} ${listing.unit_of_measure}) exceeds available stock (${listing.quantity_available})`,
    });
  }

  const user = db.prepare('SELECT * FROM profiles WHERE id = ?').get(currentUserId) as any;
  const count = (db.prepare('SELECT count(*) as count FROM orders').get() as any).count + 1;
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

  // Atomic deduction of stock
  db.prepare(`
    UPDATE marketplace_listings
    SET quantity_available = quantity_available - ?
    WHERE id = ?
  `).run(orderQty, listing.id);

  db.prepare(`
    INSERT INTO orders (
      id, order_number, listing_id, crop_name, buyer_id, buyer_name, buyer_phone,
      seller_id, seller_name, quantity, unit_price_rwf, total_produce_value_rwf,
      commission_rate_percent, commission_amount_rwf, delivery_arrangements,
      order_status, payment_status, payment_method, status_history_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', 'pending', ?, ?)
  `).run(
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
  );

  res.json({ success: true, orderNumber, id });
});

app.patch('/api/market/orders/:orderId/status', (req, res) => {
  const { orderId } = req.params;
  const { newStatus, notes } = req.body;

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
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

  db.prepare(`
    UPDATE orders
    SET order_status = ?,
        payment_status = ?,
        status_history_json = ?
    WHERE id = ?
  `).run(newStatus, paymentStatus, JSON.stringify(history), order.id);

  res.json({ success: true, newStatus });
});

app.post('/api/market/orders/:orderId/simulate-payment', (req, res) => {
  const { orderId } = req.params;
  const { paymentMethod } = req.body;

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const paymentRef = `PAY-RW-${Date.now().toString().slice(-6)}`;
  db.prepare(`
    INSERT INTO payments (
      id, payment_reference, order_id, payer_id, payer_name, payee_id, payee_name,
      amount_rwf, payment_method, payment_status, reconciliation_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', 'reconciled')
  `).run(
    `pay-${Date.now()}`,
    paymentRef,
    order.id,
    order.buyer_id,
    order.buyer_name,
    order.seller_id,
    order.seller_name,
    order.total_produce_value_rwf,
    paymentMethod || 'momo_rwanda'
  );

  db.prepare(`
    UPDATE orders
    SET payment_status = 'confirmed',
        order_status = 'confirmed'
    WHERE id = ?
  `).run(order.id);

  res.json({ success: true, paymentRef });
});

// ==================== FINANCIAL REPORTING & ANALYTICS ====================
app.get('/api/finance/overview', (req, res) => {
  // 1. Gross Marketplace Produce Volume (sum of completed/confirmed orders)
  const gmvRow = db.prepare(`
    SELECT COALESCE(SUM(total_produce_value_rwf), 0) as gmv,
           COALESCE(SUM(commission_amount_rwf), 0) as commissions
    FROM orders
    WHERE order_status IN ('confirmed', 'fulfillment', 'delivered', 'completed')
  `).get() as any;

  // 2. Recognized BioSoil Product Sales
  const biosoilSalesRow = db.prepare(`
    SELECT COALESCE(SUM(unit_price_rwf * 20), 0) as sales
    FROM products
  `).get() as any;

  // 3. Recognized Subscriptions
  const subsRow = db.prepare(`
    SELECT COALESCE(SUM(monthly_fee_rwf), 0) as subs
    FROM subscriptions
    WHERE status = 'active'
  `).get() as any;

  // 4. Operating Expenses
  const opexRow = db.prepare(`
    SELECT COALESCE(SUM(amount_rwf), 0) as opex
    FROM business_expenses
  `).get() as any;

  const financials = calculatePlatformFinancials({
    grossMarketplaceProduceVolumeRwf: Number(gmvRow.gmv) || 4108000,
    recognizedCommissionsRwf: Number(gmvRow.commissions) || 164320,
    recognizedBioSoilSalesRwf: Number(biosoilSalesRow.sales) || 580000,
    recognizedSubscriptionsRwf: Number(subsRow.subs) || 100000,
    recognizedBuyerServicesRwf: 120000,
    costOfBioSoilGoodsSoldRwf: 220000,
    operatingExpensesRwf: Number(opexRow.opex) || 475000,
  });

  res.json(financials);
});

// Subscriptions
app.get('/api/subscriptions/plans', (req, res) => {
  const plans = db.prepare('SELECT * FROM subscription_plans').all() as any[];
  res.json(plans.map((p) => ({
    id: p.id,
    name: p.name,
    tier: p.tier,
    monthlyFeeRwf: p.monthly_fee_rwf,
    features: JSON.parse(p.features_json || '[]'),
  })));
});

app.get('/api/subscriptions/current', (req, res) => {
  const subs = db.prepare('SELECT * FROM subscriptions').all() as any[];
  res.json(subs);
});

// Notifications
app.get('/api/notifications', (req, res) => {
  const notifs = db.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 20').all() as any[];
  res.json(notifs.map((n) => ({
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
app.post('/api/demo/reset', (req, res) => {
  resetDemoDatabase();
  res.json({ success: true, message: 'IngogaBridge demo environment reset to default pristine state' });
});

// Vite Middleware for Frontend Serving
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';
  const PORT = 3000;

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`IngogaBridge full-stack agritech engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
