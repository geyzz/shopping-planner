-- item categories --
INSERT INTO public.item_categories (id, name) VALUES
  ('77df59d7-d91b-419e-89b6-84fe69516504', 'Apparel, Shoes & Accessories'),
  ('7a7daa20-4c09-4853-90c5-5e74582f805a', 'Hardware & Home Goods'),
  ('d7110230-f965-40bd-af40-568cde68ee92', 'Food & Beverages'),
  ('e4da1382-4917-4a72-8441-19cbc589426f', 'Books, Pets & Toys'),
  ('ffac2e6d-a904-4640-93c5-e741dacdd706', 'Appliances & Electronics')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name;

-- rls --
ALTER TABLE public.item_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on item_categories" ON public.item_categories;
CREATE POLICY "Allow public read on item_categories" ON public.item_categories FOR SELECT USING (true);
