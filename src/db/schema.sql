-- IngogaBridge Relational Database Schema
-- Compatible with PostgreSQL & SQLite

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  organization TEXT,
  district TEXT NOT NULL,
  avatar_url TEXT,
  is_verified INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- cooperative, buyer, waste_aggregator, supplier
  district TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  member_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS waste_collections (
  id TEXT PRIMARY KEY,
  collection_ref TEXT UNIQUE NOT NULL,
  supplier_name TEXT NOT NULL,
  supplier_phone TEXT,
  material_category TEXT NOT NULL,
  estimated_weight_kg REAL NOT NULL,
  accepted_weight_kg REAL NOT NULL,
  collection_date TEXT NOT NULL,
  collection_location TEXT NOT NULL,
  collection_cost_rwf REAL NOT NULL,
  transport_cost_rwf REAL NOT NULL,
  contamination_observations TEXT,
  rejection_reason TEXT,
  status TEXT NOT NULL, -- pending, accepted, rejected
  operator_id TEXT NOT NULL,
  operator_name TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_batches (
  id TEXT PRIMARY KEY,
  batch_id TEXT UNIQUE NOT NULL,
  product_name TEXT NOT NULL,
  input_materials_json TEXT NOT NULL,
  total_input_weight_kg REAL NOT NULL,
  start_date TEXT NOT NULL,
  completion_date TEXT,
  current_stage TEXT NOT NULL,
  processing_cost_rwf REAL DEFAULT 0,
  labor_cost_rwf REAL DEFAULT 0,
  testing_cost_rwf REAL DEFAULT 0,
  final_output_weight_kg REAL DEFAULT 0,
  status TEXT NOT NULL, -- created, materials_received, processing, quality_review, approved, rejected, archived
  operator_id TEXT NOT NULL,
  operator_name TEXT NOT NULL,
  quality_review_json TEXT,
  qr_code_data TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS batch_processing_logs (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL,
  stage TEXT NOT NULL,
  recorded_at TEXT NOT NULL,
  temperature_celsius REAL NOT NULL,
  moisture_percent REAL NOT NULL,
  operator_notes TEXT,
  operator_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  batch_id TEXT NOT NULL,
  package_size TEXT NOT NULL,
  unit_of_measure TEXT NOT NULL,
  unit_price_rwf REAL NOT NULL,
  cost_of_production_rwf REAL NOT NULL,
  available_stock INTEGER NOT NULL,
  storage_instructions TEXT,
  application_instructions TEXT,
  quality_status TEXT NOT NULL, -- approved, pending_review
  image_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS farms (
  id TEXT PRIMARY KEY,
  farmer_id TEXT NOT NULL,
  farmer_name TEXT NOT NULL,
  farm_name TEXT NOT NULL,
  district TEXT NOT NULL,
  sector TEXT NOT NULL,
  total_area_ha REAL NOT NULL,
  soil_type TEXT NOT NULL,
  irrigation_source TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fields (
  id TEXT PRIMARY KEY,
  farm_id TEXT NOT NULL,
  plot_name TEXT NOT NULL,
  area_ha REAL NOT NULL,
  current_crop TEXT
);

CREATE TABLE IF NOT EXISTS crop_cycles (
  id TEXT PRIMARY KEY,
  farm_id TEXT NOT NULL,
  plot_id TEXT NOT NULL,
  plot_name TEXT NOT NULL,
  crop_name TEXT NOT NULL,
  variety TEXT NOT NULL,
  planting_date TEXT NOT NULL,
  expected_harvest_date TEXT NOT NULL,
  field_area_ha REAL NOT NULL,
  seed_quantity_kg REAL NOT NULL,
  expected_harvest_kg REAL NOT NULL,
  actual_harvest_kg REAL DEFAULT 0,
  status TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS farm_expenses (
  id TEXT PRIMARY KEY,
  farm_id TEXT NOT NULL,
  crop_cycle_id TEXT NOT NULL,
  crop_name TEXT NOT NULL,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  amount_rwf REAL NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS harvest_records (
  id TEXT PRIMARY KEY,
  farm_id TEXT NOT NULL,
  crop_cycle_id TEXT NOT NULL,
  crop_name TEXT NOT NULL,
  harvest_date TEXT NOT NULL,
  total_harvest_kg REAL NOT NULL,
  quantity_sold_kg REAL NOT NULL,
  quantity_retained_kg REAL NOT NULL,
  quantity_loss_kg REAL NOT NULL,
  average_selling_price_rwf REAL NOT NULL,
  buyer_reference TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS marketplace_listings (
  id TEXT PRIMARY KEY,
  listing_code TEXT UNIQUE NOT NULL,
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  seller_type TEXT NOT NULL,
  organization_name TEXT,
  crop_name TEXT NOT NULL,
  variety TEXT NOT NULL,
  quantity_available REAL NOT NULL,
  unit_of_measure TEXT NOT NULL,
  price_per_unit_rwf REAL NOT NULL,
  district TEXT NOT NULL,
  sector TEXT NOT NULL,
  harvest_date TEXT NOT NULL,
  grade TEXT NOT NULL,
  is_organic_certified INTEGER DEFAULT 0,
  status TEXT NOT NULL, -- available_now, expected_harvest, reserved, sold, expired
  image_url TEXT,
  coop_member_allocations_json TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  listing_id TEXT NOT NULL,
  crop_name TEXT NOT NULL,
  buyer_id TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit_price_rwf REAL NOT NULL,
  total_produce_value_rwf REAL NOT NULL,
  commission_rate_percent REAL NOT NULL,
  commission_amount_rwf REAL NOT NULL,
  delivery_arrangements TEXT NOT NULL,
  order_status TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  status_history_json TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  payment_reference TEXT UNIQUE NOT NULL,
  order_id TEXT,
  payer_id TEXT NOT NULL,
  payer_name TEXT NOT NULL,
  payee_id TEXT NOT NULL,
  payee_name TEXT NOT NULL,
  amount_rwf REAL NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  reconciliation_status TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL,
  monthly_fee_rwf REAL NOT NULL,
  features_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  subscriber_id TEXT NOT NULL,
  subscriber_name TEXT NOT NULL,
  plan_tier TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TEXT NOT NULL,
  current_period_end TEXT NOT NULL,
  monthly_fee_rwf REAL NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_org TEXT,
  category TEXT NOT NULL, -- biosoil_order, subscription, buyer_sourcing, implementation
  amount_rwf REAL NOT NULL,
  status TEXT NOT NULL, -- draft, sent, paid, overdue
  due_date TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS business_expenses (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount_rwf REAL NOT NULL,
  date TEXT NOT NULL,
  recorded_by TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  link TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  action TEXT NOT NULL,
  target_entity TEXT NOT NULL,
  details TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
