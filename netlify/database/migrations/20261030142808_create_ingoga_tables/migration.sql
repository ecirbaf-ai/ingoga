CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY,
	"actor_id" text NOT NULL,
	"actor_name" text NOT NULL,
	"action" text NOT NULL,
	"target_entity" text NOT NULL,
	"details" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);
--> statement-breakpoint
CREATE TABLE "batch_processing_logs" (
	"id" text PRIMARY KEY,
	"batch_id" text NOT NULL,
	"stage" text NOT NULL,
	"recorded_at" text NOT NULL,
	"temperature_celsius" double precision NOT NULL,
	"moisture_percent" double precision NOT NULL,
	"operator_notes" text,
	"operator_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_expenses" (
	"id" text PRIMARY KEY,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"amount_rwf" double precision NOT NULL,
	"date" text NOT NULL,
	"recorded_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crop_cycles" (
	"id" text PRIMARY KEY,
	"farm_id" text NOT NULL,
	"plot_id" text NOT NULL,
	"plot_name" text NOT NULL,
	"crop_name" text NOT NULL,
	"variety" text NOT NULL,
	"planting_date" text NOT NULL,
	"expected_harvest_date" text NOT NULL,
	"field_area_ha" double precision NOT NULL,
	"seed_quantity_kg" double precision NOT NULL,
	"expected_harvest_kg" double precision NOT NULL,
	"actual_harvest_kg" double precision DEFAULT 0,
	"status" text NOT NULL,
	"notes" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);
--> statement-breakpoint
CREATE TABLE "farm_expenses" (
	"id" text PRIMARY KEY,
	"farm_id" text NOT NULL,
	"crop_cycle_id" text NOT NULL,
	"crop_name" text NOT NULL,
	"date" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"quantity" double precision NOT NULL,
	"unit" text NOT NULL,
	"amount_rwf" double precision NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);
--> statement-breakpoint
CREATE TABLE "farms" (
	"id" text PRIMARY KEY,
	"farmer_id" text NOT NULL,
	"farmer_name" text NOT NULL,
	"farm_name" text NOT NULL,
	"district" text NOT NULL,
	"sector" text NOT NULL,
	"total_area_ha" double precision NOT NULL,
	"soil_type" text NOT NULL,
	"irrigation_source" text NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);
--> statement-breakpoint
CREATE TABLE "fields" (
	"id" text PRIMARY KEY,
	"farm_id" text NOT NULL,
	"plot_name" text NOT NULL,
	"area_ha" double precision NOT NULL,
	"current_crop" text
);
--> statement-breakpoint
CREATE TABLE "harvest_records" (
	"id" text PRIMARY KEY,
	"farm_id" text NOT NULL,
	"crop_cycle_id" text NOT NULL,
	"crop_name" text NOT NULL,
	"harvest_date" text NOT NULL,
	"total_harvest_kg" double precision NOT NULL,
	"quantity_sold_kg" double precision NOT NULL,
	"quantity_retained_kg" double precision NOT NULL,
	"quantity_loss_kg" double precision NOT NULL,
	"average_selling_price_rwf" double precision NOT NULL,
	"buyer_reference" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" text PRIMARY KEY,
	"invoice_number" text NOT NULL UNIQUE,
	"recipient_name" text NOT NULL,
	"recipient_org" text,
	"category" text NOT NULL,
	"amount_rwf" double precision NOT NULL,
	"status" text NOT NULL,
	"due_date" text NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);
--> statement-breakpoint
CREATE TABLE "marketplace_listings" (
	"id" text PRIMARY KEY,
	"listing_code" text NOT NULL UNIQUE,
	"seller_id" text NOT NULL,
	"seller_name" text NOT NULL,
	"seller_type" text NOT NULL,
	"organization_name" text,
	"crop_name" text NOT NULL,
	"variety" text NOT NULL,
	"quantity_available" double precision NOT NULL,
	"unit_of_measure" text NOT NULL,
	"price_per_unit_rwf" double precision NOT NULL,
	"district" text NOT NULL,
	"sector" text NOT NULL,
	"harvest_date" text NOT NULL,
	"grade" text NOT NULL,
	"is_organic_certified" integer DEFAULT 0,
	"status" text NOT NULL,
	"image_url" text,
	"coop_member_allocations_json" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"category" text NOT NULL,
	"is_read" integer DEFAULT 0,
	"link" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY,
	"order_number" text NOT NULL UNIQUE,
	"listing_id" text NOT NULL,
	"crop_name" text NOT NULL,
	"buyer_id" text NOT NULL,
	"buyer_name" text NOT NULL,
	"buyer_phone" text NOT NULL,
	"seller_id" text NOT NULL,
	"seller_name" text NOT NULL,
	"quantity" double precision NOT NULL,
	"unit_price_rwf" double precision NOT NULL,
	"total_produce_value_rwf" double precision NOT NULL,
	"commission_rate_percent" double precision NOT NULL,
	"commission_amount_rwf" double precision NOT NULL,
	"delivery_arrangements" text NOT NULL,
	"order_status" text NOT NULL,
	"payment_status" text NOT NULL,
	"payment_method" text NOT NULL,
	"status_history_json" text NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"district" text NOT NULL,
	"contact_person" text NOT NULL,
	"contact_phone" text NOT NULL,
	"member_count" integer DEFAULT 0,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY,
	"payment_reference" text NOT NULL UNIQUE,
	"order_id" text,
	"payer_id" text NOT NULL,
	"payer_name" text NOT NULL,
	"payee_id" text NOT NULL,
	"payee_name" text NOT NULL,
	"amount_rwf" double precision NOT NULL,
	"payment_method" text NOT NULL,
	"payment_status" text NOT NULL,
	"reconciliation_status" text NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);
--> statement-breakpoint
CREATE TABLE "production_batches" (
	"id" text PRIMARY KEY,
	"batch_id" text NOT NULL UNIQUE,
	"product_name" text NOT NULL,
	"input_materials_json" text NOT NULL,
	"total_input_weight_kg" double precision NOT NULL,
	"start_date" text NOT NULL,
	"completion_date" text,
	"current_stage" text NOT NULL,
	"processing_cost_rwf" double precision DEFAULT 0,
	"labor_cost_rwf" double precision DEFAULT 0,
	"testing_cost_rwf" double precision DEFAULT 0,
	"final_output_weight_kg" double precision DEFAULT 0,
	"status" text NOT NULL,
	"operator_id" text NOT NULL,
	"operator_name" text NOT NULL,
	"quality_review_json" text,
	"qr_code_data" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"batch_id" text NOT NULL,
	"package_size" text NOT NULL,
	"unit_of_measure" text NOT NULL,
	"unit_price_rwf" double precision NOT NULL,
	"cost_of_production_rwf" double precision NOT NULL,
	"available_stock" integer NOT NULL,
	"storage_instructions" text,
	"application_instructions" text,
	"quality_status" text NOT NULL,
	"image_url" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"role" text NOT NULL,
	"phone" text,
	"organization" text,
	"district" text NOT NULL,
	"avatar_url" text,
	"is_verified" integer DEFAULT 1,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"tier" text NOT NULL,
	"monthly_fee_rwf" double precision NOT NULL,
	"features_json" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY,
	"subscriber_id" text NOT NULL,
	"subscriber_name" text NOT NULL,
	"plan_tier" text NOT NULL,
	"status" text NOT NULL,
	"current_period_start" text NOT NULL,
	"current_period_end" text NOT NULL,
	"monthly_fee_rwf" double precision NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);
--> statement-breakpoint
CREATE TABLE "waste_collections" (
	"id" text PRIMARY KEY,
	"collection_ref" text NOT NULL UNIQUE,
	"supplier_name" text NOT NULL,
	"supplier_phone" text,
	"material_category" text NOT NULL,
	"estimated_weight_kg" double precision NOT NULL,
	"accepted_weight_kg" double precision NOT NULL,
	"collection_date" text NOT NULL,
	"collection_location" text NOT NULL,
	"collection_cost_rwf" double precision NOT NULL,
	"transport_cost_rwf" double precision NOT NULL,
	"contamination_observations" text,
	"rejection_reason" text,
	"status" text NOT NULL,
	"operator_id" text NOT NULL,
	"operator_name" text NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);
