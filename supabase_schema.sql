-- =========================================================================
-- NOVAXCLEAN DATABASE SCHEMA - 4TH NORMAL FORM (4NF) - REVISED WITH RLS POLICIES
-- Optimized for Supabase (PostgreSQL)
-- =========================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. BASE ENTITIES (Independent Tables)
-- =========================================================================

-- Categories (Separates Products and Materials cleanly in BCNF)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('product', 'material')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Suppliers of raw materials
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL UNIQUE,
    warehouse_label VARCHAR(150) NOT NULL,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Normalized Vehicles Table (Separated from Delivery Riders for BCNF/4NF)
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('Moto', 'Automóvil', 'Camioneta', 'Bicicleta', 'Otros')),
    brand VARCHAR(100),
    model VARCHAR(100) NOT NULL,
    color VARCHAR(50) NOT NULL,
    plate VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Normalized Delivery Riders
CREATE TABLE delivery_riders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================================================
-- 2. USER PROFILE & SETTINGS MODULE
-- =========================================================================

-- Main Users Table (Links to Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY, -- Inherits the UUID from auth.users
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'User' CHECK (role IN ('Admin', 'User')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- User Addresses (Includes Latitude/Longitude for direct Map rendering, no Municipalities table)
CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- e.g., 'Mi Casa', 'Oficina'
    location_details TEXT NOT NULL,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- User Preferences (1:1 extension table)
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    newsletter BOOLEAN NOT NULL DEFAULT true,
    promotions BOOLEAN NOT NULL DEFAULT true,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'VES')),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================================================
-- 3. PRODUCTS & REVIEWS
-- =========================================================================

-- Badges Lookup Table (Product labels like 'Nuevo', 'Eco-Friendly')
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Finished Products Catalog (Ratings columns removed for normalized reviews)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL UNIQUE,
    category_id UUID REFERENCES categories(id),
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    minimum_stock INT NOT NULL DEFAULT 5 CHECK (minimum_stock >= 0),
    badge_id UUID REFERENCES badges(id) ON DELETE SET NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Normalized Product Reviews (Calculates rating_avg and rating_count dynamically)
CREATE TABLE product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_product_user_review UNIQUE (product_id, user_id)
);

-- View to compute product ratings on the fly
CREATE OR REPLACE VIEW product_ratings_view AS
SELECT 
    p.id AS product_id,
    COALESCE(AVG(pr.rating), 5.0) AS rating_avg,
    COUNT(pr.rating) AS rating_count
FROM products p
LEFT JOIN product_reviews pr ON p.id = pr.product_id
GROUP BY p.id;

-- =========================================================================
-- 4. RAW MATERIALS & CHEMICAL FORMULAS (PRODUCTION)
-- =========================================================================

-- Raw Materials Inventory
CREATE TABLE raw_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL UNIQUE,
    category_id UUID REFERENCES categories(id),
    stock NUMERIC(12, 3) NOT NULL DEFAULT 0.000 CHECK (stock >= 0.000),
    minimum_stock NUMERIC(12, 3) NOT NULL DEFAULT 10.000 CHECK (minimum_stock >= 0.000),
    unit VARCHAR(20) NOT NULL, -- 'Kg', 'Litros', 'Unidades'
    unit_cost NUMERIC(10, 4) NOT NULL CHECK (unit_cost >= 0),
    supplier_id UUID REFERENCES suppliers(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Master Production Formulas
CREATE TABLE formulas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) NOT NULL UNIQUE,
    product_id UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    yield_label VARCHAR(100) NOT NULL, -- Description of yield, e.g., '1 lote / 100 unidades'
    yield_units INT NOT NULL DEFAULT 1 CHECK (yield_units > 0), -- Numeric representation of yield units for math scaling
    batch_size VARCHAR(50),
    status VARCHAR(30) NOT NULL DEFAULT 'Lista' CHECK (status IN ('Lista', 'En revisión', 'En ajuste')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Formula Ingredients BOM (Bill of Materials) (Pure N:M junction table)
CREATE TABLE formula_ingredients (
    formula_id UUID NOT NULL REFERENCES formulas(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES raw_materials(id),
    quantity NUMERIC(12, 4) NOT NULL CHECK (quantity > 0), -- Quantity of raw material consumed per batch run
    PRIMARY KEY (formula_id, material_id)
);

-- =========================================================================
-- 5. MANUFACTURING/PRODUCTION MODULE (Replenishing Finished Products)
-- =========================================================================

-- Production runs on manufacturing lines to create finished products from raw materials
CREATE TABLE production_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    formula_id UUID NOT NULL REFERENCES formulas(id) ON DELETE RESTRICT,
    quantity_produced INT NOT NULL CHECK (quantity_produced > 0), -- Units of finished product manufactured
    status VARCHAR(30) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- Index for production queries
CREATE INDEX idx_production_runs_formula ON production_runs(formula_id);

-- =========================================================================
-- 6. SALES & TRANSACTIONS MODULE (ORDERS)
-- =========================================================================

-- Purchase Orders (Includes latitude and longitude for GPS-based mapping)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'Recibido' CHECK (status IN ('Recibido', 'Preparando', 'Pago Procesado', 'En camino', 'Entregado')),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    shipping_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (shipping_cost >= 0),
    tax_amount NUMERIC(10, 2) NOT NULL CHECK (tax_amount >= 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    fulfillment_mode VARCHAR(20) NOT NULL CHECK (fulfillment_mode IN ('delivery', 'pickup')),
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('tarjeta', 'transferencia', 'pagomovil')),
    delivery_rider_id UUID REFERENCES delivery_riders(id),
    delivery_latitude NUMERIC(9, 6),
    delivery_longitude NUMERIC(9, 6),
    delivery_address TEXT, -- Text backup of target address at transaction time (historical integrity)
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Order Details (Items purchased)
CREATE TABLE order_items (
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    PRIMARY KEY (order_id, product_id)
);

-- Realtime Order Status Tracking Steps
CREATE TABLE order_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL, -- 'received', 'preparing', 'payment', 'transit', 'arrived'
    details TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Normalized Rider Reviews (computes ratings dynamically rather than cached column)
CREATE TABLE rider_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rider_id UUID NOT NULL REFERENCES delivery_riders(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_rider_order_review UNIQUE (rider_id, order_id)
);

-- View to compute rider ratings dynamically on the fly
CREATE OR REPLACE VIEW rider_ratings_view AS
SELECT 
    dr.id AS rider_id,
    COALESCE(AVG(rr.rating), 5.0) AS rating_avg,
    COUNT(rr.rating) AS rating_count
FROM delivery_riders dr
LEFT JOIN rider_reviews rr ON dr.id = rr.rider_id
GROUP BY dr.id;

-- =========================================================================
-- 7. SUPPLY REPLENISHMENTS MODULE (Raw Materials Only)
-- =========================================================================

-- Replenishment Purchase Order to bring in Raw Materials from Suppliers
CREATE TABLE replenishments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id),
    status VARCHAR(30) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'loading', 'route', 'bay', 'completed')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Items of raw materials requested in the replenishment order
CREATE TABLE replenishment_items (
    replenishment_id UUID NOT NULL REFERENCES replenishments(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES raw_materials(id),
    quantity NUMERIC(12, 3) NOT NULL CHECK (quantity > 0),
    received_quantity NUMERIC(12, 3) NOT NULL DEFAULT 0.000 CHECK (received_quantity >= 0.000),
    PRIMARY KEY (replenishment_id, material_id)
);

-- Indexes for replenishments
CREATE INDEX idx_replenishments_supplier ON replenishments(supplier_id);
CREATE INDEX idx_replenishment_items_mat ON replenishment_items(material_id);

-- =========================================================================
-- 8. AUTOMATIC FUNCTIONS & TRIGGERS (SUPABASE INTEGRATION)
-- =========================================================================

-- A. USER REGISTRATION SYNC FROM AUTH.USERS TO PUBLIC.USERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role, avatar_url)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Usuario'),
    new.email,
    'User',
    new.raw_user_meta_data->>'avatar_url'
  );
  
  -- Create default user preferences
  INSERT INTO public.user_preferences (user_id, newsletter, promotions, currency)
  VALUES (new.id, true, true, 'USD');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- B. RAW MATERIAL STOCK UPDATE ON REPLENISHMENT COMPLETION
CREATE OR REPLACE FUNCTION public.handle_replenishment_completion()
RETURNS trigger AS $$
DECLARE
    v_item RECORD;
BEGIN
    -- If status changes to 'completed', add the received quantities to raw material inventory
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        FOR v_item IN 
            SELECT material_id, received_quantity 
            FROM replenishment_items 
            WHERE replenishment_id = NEW.id
        LOOP
            UPDATE raw_materials
            SET stock = stock + v_item.received_quantity
            WHERE id = v_item.material_id;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_replenishment_completed
  AFTER UPDATE ON replenishments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_replenishment_completion();


-- C. TRANSACTIONAL PRODUCTION MANUFACTURING FUNCTION (MRP/ERP STOCK DEDUCTION)
-- This function executes a production batch, checks raw material stock levels,
-- consumes ingredients proportionally based on yield, and increments finished product stock.
CREATE OR REPLACE FUNCTION execute_production_run(
    p_formula_id UUID,
    p_quantity_to_produce INT
) RETURNS UUID AS $$
DECLARE
    v_product_id UUID;
    v_yield_units INT;
    v_run_id UUID;
    v_ingredient RECORD;
    v_required_qty NUMERIC(12, 4);
BEGIN
    -- Fetch target product and the quantity yielded per formula batch run
    SELECT product_id, yield_units INTO v_product_id, v_yield_units
    FROM formulas
    WHERE id = p_formula_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Formula with ID % not found', p_formula_id;
    END IF;

    -- 1. Inventory validation (ACID check): ensure all ingredients have sufficient stocks
    FOR v_ingredient IN 
        SELECT fi.material_id, fi.quantity, rm.name, rm.stock
        FROM formula_ingredients fi
        JOIN raw_materials rm ON fi.material_id = rm.id
        WHERE fi.formula_id = p_formula_id
    LOOP
        -- Scale formula quantity based on production target units: (target / yield) * ingredient quantity
        v_required_qty := (p_quantity_to_produce::NUMERIC / v_yield_units::NUMERIC) * v_ingredient.quantity;
        
        IF v_ingredient.stock < v_required_qty THEN
            RAISE EXCEPTION 'Insufficient stock for material "%". Required: % units, Available in warehouse: % units', 
                v_ingredient.name, round(v_required_qty, 3), round(v_ingredient.stock, 3);
        END IF;
    END LOOP;

    -- 2. Insert manufacturing audit trail record
    INSERT INTO production_runs (formula_id, quantity_produced, status, completed_at)
    VALUES (p_formula_id, p_quantity_to_produce, 'completed', now())
    RETURNING id INTO v_run_id;

    -- 3. Consume chemical raw materials (deduct from stocks)
    FOR v_ingredient IN 
        SELECT material_id, quantity
        FROM formula_ingredients
        WHERE formula_id = p_formula_id
    LOOP
        v_required_qty := (p_quantity_to_produce::NUMERIC / v_yield_units::NUMERIC) * v_ingredient.quantity;
        
        UPDATE raw_materials
        SET stock = stock - v_required_qty
        WHERE id = v_ingredient.material_id;
    END LOOP;

    -- 4. Replenish target finished product (add manufactured quantity to stock)
    UPDATE products
    SET stock = stock + p_quantity_to_produce
    WHERE id = v_product_id;

    RETURN v_run_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES (SUPABASE PRODUCTION SECURITY)
-- =========================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE formula_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE rider_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE replenishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE replenishment_items ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current user is an Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'Admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9.1 Users table policies
CREATE POLICY "Users can read own profile or Admins can read all"
ON users FOR SELECT
USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update own profile or Admins can update all"
ON users FOR UPDATE
USING (auth.uid() = id OR is_admin());

-- 9.2 User Addresses policies
CREATE POLICY "Users can read own addresses or Admins can read all"
ON user_addresses FOR SELECT
USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can insert own addresses or Admins can write all"
ON user_addresses FOR INSERT
WITH CHECK (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can update/delete own addresses or Admins can write all"
ON user_addresses FOR ALL
USING (auth.uid() = user_id OR is_admin());

-- 9.3 User Preferences policies
CREATE POLICY "Users can manage own preferences or Admins can manage all"
ON user_preferences FOR ALL
USING (auth.uid() = user_id OR is_admin());

-- 9.4 Categories policies (Public read, Admin write)
CREATE POLICY "Anyone can read categories"
ON categories FOR SELECT
USING (true);

CREATE POLICY "Only Admins can write categories"
ON categories FOR ALL
USING (is_admin());

-- 9.4b Badges policies (Public read, Admin write)
CREATE POLICY "Anyone can read badges"
ON badges FOR SELECT
USING (true);

CREATE POLICY "Only Admins can write badges"
ON badges FOR ALL
USING (is_admin());

-- 9.5 Products catalog policies (Public read, Admin write)
CREATE POLICY "Anyone can read products"
ON products FOR SELECT
USING (true);

CREATE POLICY "Only Admins can write products"
ON products FOR ALL
USING (is_admin());

-- 9.6 Product Reviews policies (Public read, Owner/Admin write)
CREATE POLICY "Anyone can read product reviews"
ON product_reviews FOR SELECT
USING (true);

CREATE POLICY "Users can write own reviews or Admins can write all"
ON product_reviews FOR ALL
USING (auth.uid() = user_id OR is_admin());

-- 9.7 Orders policies (Owner read/insert, Admin write/read)
CREATE POLICY "Users can read own orders or Admins can read all"
ON orders FOR SELECT
USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can create their own orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only Admins can update or delete orders"
ON orders FOR ALL
USING (is_admin());

-- 9.8 Order Items policies
CREATE POLICY "Users can read own order items or Admins can read all"
ON order_items FOR SELECT
USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND (orders.user_id = auth.uid() OR is_admin()))
);

CREATE POLICY "Users can insert items into own orders"
ON order_items FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.user_id = auth.uid())
);

CREATE POLICY "Only Admins can update or delete order items"
ON order_items FOR ALL
USING (is_admin());

-- 9.9 Order Tracking policies (Owner read, Admin write)
CREATE POLICY "Users can read tracking of own orders or Admins can read all"
ON order_tracking FOR SELECT
USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND (orders.user_id = auth.uid() OR is_admin()))
);

CREATE POLICY "Only Admins can manage order tracking"
ON order_tracking FOR ALL
USING (is_admin());

-- 9.10 Rider Reviews policies (Owner write, Admin read)
CREATE POLICY "Only Admins can read rider reviews"
ON rider_reviews FOR SELECT
USING (is_admin());

CREATE POLICY "Users can create rider reviews for their orders"
ON rider_reviews FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.user_id = auth.uid())
);

CREATE POLICY "Only Admins can delete or edit rider reviews"
ON rider_reviews FOR ALL
USING (is_admin());

-- 9.11 Admin modules (Only Admins can read or write)
-- Raw Materials
CREATE POLICY "Only Admins can manage raw materials"
ON raw_materials FOR ALL
USING (is_admin());

-- Formulas
CREATE POLICY "Only Admins can manage formulas"
ON formulas FOR ALL
USING (is_admin());

-- Formula Ingredients
CREATE POLICY "Only Admins can manage formula ingredients"
ON formula_ingredients FOR ALL
USING (is_admin());

-- Production Runs
CREATE POLICY "Only Admins can manage production runs"
ON production_runs FOR ALL
USING (is_admin());

-- Suppliers
CREATE POLICY "Only Admins can manage suppliers"
ON suppliers FOR ALL
USING (is_admin());

-- Vehicles
CREATE POLICY "Only Admins can manage vehicles"
ON vehicles FOR ALL
USING (is_admin());

-- Delivery Riders
CREATE POLICY "Only Admins can manage delivery riders"
ON delivery_riders FOR ALL
USING (is_admin());

-- Replenishments
CREATE POLICY "Only Admins can manage replenishments"
ON replenishments FOR ALL
USING (is_admin());

-- Replenishment Items
CREATE POLICY "Only Admins can manage replenishment items"
ON replenishment_items FOR ALL
USING (is_admin());

-- =========================================================================
-- 10. PERFORMANCE INDEXES
-- =========================================================================

-- Users and Profiles
CREATE INDEX idx_user_addresses_user ON user_addresses(user_id);

-- Catalog
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_product_reviews_prod ON product_reviews(product_id);
CREATE INDEX idx_raw_materials_category ON raw_materials(category_id);
CREATE INDEX idx_raw_materials_supplier ON raw_materials(supplier_id);
CREATE INDEX idx_formulas_product ON formulas(product_id);

-- Sales / Orders
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_rider ON orders(delivery_rider_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_order_tracking_order ON order_tracking(order_id);
CREATE INDEX idx_rider_reviews_rider ON rider_reviews(rider_id);
