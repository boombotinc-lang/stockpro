-- ============================================================
-- MIGRATION: RLS + Triggers + Funções
-- Rodar no Supabase SQL Editor ou via supabase/migrations/
-- ============================================================

-- ============================================================
-- 1. TRIGGER: criar profile automaticamente quando usuário
--    se registra no Supabase Auth
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 2. ROW LEVEL SECURITY — habilitar em todas as tabelas
-- ============================================================

ALTER TABLE organizations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members         ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_invites         ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories          ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags                ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_locations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE products            ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags        ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_stock       ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_entries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets   ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 3. HELPER FUNCTION: retorna orgs do usuário autenticado
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_org_ids()
RETURNS uuid[]
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT ARRAY(
    SELECT org_id FROM org_members
    WHERE user_id = auth.uid() AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.has_min_role(
  p_org_id uuid,
  p_min_role member_role
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members
    WHERE org_id = p_org_id
      AND user_id = auth.uid()
      AND is_active = true
      AND (
        CASE p_min_role
          WHEN 'VIEWER'   THEN role IN ('VIEWER','EDITOR','ADMIN','OWNER')
          WHEN 'EDITOR'   THEN role IN ('EDITOR','ADMIN','OWNER')
          WHEN 'ADMIN'    THEN role IN ('ADMIN','OWNER')
          WHEN 'OWNER'    THEN role = 'OWNER'
        END
      )
  );
$$;


-- ============================================================
-- 4. POLICIES — organizations
-- ============================================================

CREATE POLICY "org: member can read"
  ON organizations FOR SELECT
  USING (id = ANY(get_user_org_ids()));

CREATE POLICY "org: owner can update"
  ON organizations FOR UPDATE
  USING (has_min_role(id, 'ADMIN'));


-- ============================================================
-- 5. POLICIES — profiles
-- ============================================================

CREATE POLICY "profile: own read"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profile: org member read"
  ON profiles FOR SELECT
  USING (
    id IN (
      SELECT user_id FROM org_members
      WHERE org_id = ANY(get_user_org_ids())
    )
  );

CREATE POLICY "profile: own update"
  ON profiles FOR UPDATE
  USING (id = auth.uid());


-- ============================================================
-- 6. POLICIES — org_members
-- ============================================================

CREATE POLICY "members: org member can read"
  ON org_members FOR SELECT
  USING (org_id = ANY(get_user_org_ids()));

CREATE POLICY "members: admin can insert"
  ON org_members FOR INSERT
  WITH CHECK (has_min_role(org_id, 'ADMIN'));

CREATE POLICY "members: admin can update"
  ON org_members FOR UPDATE
  USING (has_min_role(org_id, 'ADMIN'));

CREATE POLICY "members: owner can delete"
  ON org_members FOR DELETE
  USING (has_min_role(org_id, 'OWNER') OR user_id = auth.uid());


-- ============================================================
-- 7. POLICIES — products e demais tabelas de negócio
-- ============================================================

CREATE POLICY "products: member can read"
  ON products FOR SELECT
  USING (org_id = ANY(get_user_org_ids()));

CREATE POLICY "products: editor can insert"
  ON products FOR INSERT
  WITH CHECK (has_min_role(org_id, 'EDITOR'));

CREATE POLICY "products: editor can update"
  ON products FOR UPDATE
  USING (has_min_role(org_id, 'EDITOR'));

CREATE POLICY "products: admin can delete"
  ON products FOR DELETE
  USING (has_min_role(org_id, 'ADMIN'));

CREATE POLICY "categories: member read"    ON categories      FOR SELECT USING (org_id = ANY(get_user_org_ids()));
CREATE POLICY "categories: editor insert"  ON categories      FOR INSERT WITH CHECK (has_min_role(org_id, 'EDITOR'));
CREATE POLICY "categories: editor update"  ON categories      FOR UPDATE USING (has_min_role(org_id, 'EDITOR'));
CREATE POLICY "categories: admin delete"   ON categories      FOR DELETE USING (has_min_role(org_id, 'ADMIN'));

CREATE POLICY "tags: member read"          ON tags            FOR SELECT USING (org_id = ANY(get_user_org_ids()));
CREATE POLICY "tags: editor insert"        ON tags            FOR INSERT WITH CHECK (has_min_role(org_id, 'EDITOR'));
CREATE POLICY "tags: editor update"        ON tags            FOR UPDATE USING (has_min_role(org_id, 'EDITOR'));
CREATE POLICY "tags: admin delete"         ON tags            FOR DELETE USING (has_min_role(org_id, 'ADMIN'));

CREATE POLICY "locations: member read"     ON stock_locations FOR SELECT USING (org_id = ANY(get_user_org_ids()));
CREATE POLICY "locations: admin insert"    ON stock_locations FOR INSERT WITH CHECK (has_min_role(org_id, 'ADMIN'));
CREATE POLICY "locations: admin update"    ON stock_locations FOR UPDATE USING (has_min_role(org_id, 'ADMIN'));

CREATE POLICY "movements: member read"     ON stock_movements FOR SELECT USING (org_id = ANY(get_user_org_ids()));
CREATE POLICY "movements: editor insert"   ON stock_movements FOR INSERT WITH CHECK (has_min_role(org_id, 'EDITOR'));

CREATE POLICY "cashflow_cat: member read"  ON cash_flow_categories FOR SELECT USING (org_id = ANY(get_user_org_ids()));
CREATE POLICY "cashflow_cat: editor insert" ON cash_flow_categories FOR INSERT WITH CHECK (has_min_role(org_id, 'EDITOR'));
CREATE POLICY "cashflow_cat: editor update" ON cash_flow_categories FOR UPDATE USING (has_min_role(org_id, 'EDITOR'));

CREATE POLICY "cashflow: member read"      ON cash_flow_entries FOR SELECT USING (org_id = ANY(get_user_org_ids()));
CREATE POLICY "cashflow: editor insert"    ON cash_flow_entries FOR INSERT WITH CHECK (has_min_role(org_id, 'EDITOR'));
CREATE POLICY "cashflow: editor update"    ON cash_flow_entries FOR UPDATE USING (has_min_role(org_id, 'EDITOR'));
CREATE POLICY "cashflow: admin delete"     ON cash_flow_entries FOR DELETE USING (has_min_role(org_id, 'ADMIN'));

CREATE POLICY "audit: member read"         ON audit_logs FOR SELECT USING (org_id = ANY(get_user_org_ids()));

CREATE POLICY "product_stock: member read" ON product_stock FOR SELECT
  USING (
    product_id IN (
      SELECT id FROM products WHERE org_id = ANY(get_user_org_ids())
    )
  );

CREATE POLICY "product_tags: member read"  ON product_tags FOR SELECT
  USING (
    product_id IN (
      SELECT id FROM products WHERE org_id = ANY(get_user_org_ids())
    )
  );

CREATE POLICY "widgets: own read"          ON dashboard_widgets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "widgets: own insert"        ON dashboard_widgets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "widgets: own update"        ON dashboard_widgets FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "widgets: own delete"        ON dashboard_widgets FOR DELETE USING (user_id = auth.uid());


-- ============================================================
-- 8. TRIGGER: atualizar product_stock a cada stock_movement
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_product_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO product_stock (product_id, location_id, quantity)
  VALUES (NEW.product_id, NEW.location_id, NEW.quantity)
  ON CONFLICT (product_id, location_id)
  DO UPDATE SET
    quantity  = product_stock.quantity + EXCLUDED.quantity,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_stock_movement_created
  AFTER INSERT ON stock_movements
  FOR EACH ROW EXECUTE FUNCTION public.update_product_stock();


-- ============================================================
-- 9. TRIGGER: gerar audit_log automaticamente em products
-- ============================================================

CREATE OR REPLACE FUNCTION public.audit_product_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_action audit_action;
  v_before json;
  v_after  json;
  v_diff   json;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'CREATED';
    v_before := NULL;
    v_after  := row_to_json(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'UPDATED';
    v_before := row_to_json(OLD);
    v_after  := row_to_json(NEW);
    SELECT json_object_agg(key, value)
    INTO v_diff
    FROM json_each(row_to_json(NEW))
    WHERE value::text != (row_to_json(OLD)->key)::text;
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'DELETED';
    v_before := row_to_json(OLD);
    v_after  := NULL;
  END IF;

  INSERT INTO audit_logs (
    org_id, user_id, action, entity_type, entity_id,
    before, after, diff
  )
  VALUES (
    COALESCE(NEW.org_id, OLD.org_id),
    auth.uid(),
    v_action,
    'product',
    COALESCE(NEW.id, OLD.id),
    v_before,
    v_after,
    v_diff
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE TRIGGER products_audit
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION public.audit_product_changes();


-- ============================================================
-- 10. ÍNDICES de performance adicionais
-- ============================================================

CREATE INDEX products_name_fts_idx ON products
  USING gin(to_tsvector('portuguese', name || ' ' || COALESCE(description, '') || ' ' || sku));

CREATE INDEX products_low_stock_idx ON products (org_id)
  WHERE is_active = true AND is_archived = false;

CREATE INDEX movements_org_recent_idx ON stock_movements (org_id, created_at DESC);

CREATE INDEX cashflow_org_period_idx ON cash_flow_entries (org_id, occurred_at DESC);

CREATE INDEX audit_entity_idx ON audit_logs (org_id, entity_type, entity_id, created_at DESC);


-- ============================================================
-- 11. VIEW: saldo total de estoque por produto
-- ============================================================

CREATE OR REPLACE VIEW v_product_stock_total AS
SELECT
  p.id          AS product_id,
  p.org_id,
  p.sku,
  p.name,
  p.min_stock,
  p.sale_price,
  p.cost_price,
  COALESCE(SUM(ps.quantity), 0) AS total_quantity,
  COALESCE(SUM(ps.quantity), 0) <= p.min_stock AS is_low_stock,
  COALESCE(SUM(ps.quantity * p.cost_price), 0) AS total_cost_value,
  COALESCE(SUM(ps.quantity * p.sale_price), 0) AS total_sale_value
FROM products p
LEFT JOIN product_stock ps ON p.id = ps.product_id
WHERE p.is_active = true AND p.is_archived = false
GROUP BY p.id, p.org_id, p.sku, p.name, p.min_stock, p.sale_price, p.cost_price;

ALTER VIEW v_product_stock_total SET (security_invoker = true);


-- ============================================================
-- 12. VIEW: resumo de fluxo de caixa mensal
-- ============================================================

CREATE OR REPLACE VIEW v_cashflow_monthly AS
SELECT
  org_id,
  DATE_TRUNC('month', occurred_at) AS month,
  type,
  SUM(amount) AS total,
  COUNT(*)    AS entries_count
FROM cash_flow_entries
GROUP BY org_id, DATE_TRUNC('month', occurred_at), type;

ALTER VIEW v_cashflow_monthly SET (security_invoker = true);
