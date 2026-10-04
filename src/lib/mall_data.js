import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

// Malls for the Location section. `id` is the slug, so lists saved earlier still match.
export function useMalls() {
  const [malls, setMalls] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data, error } = await supabase
        .from('malls')
        .select('slug, name')
        .order('name');

      if (error) {
        console.log('Error loading malls:', error.message);
        return;
      }
      if (!cancelled) {
        setMalls((data ?? []).map((m) => ({ id: m.slug, name: m.name })));
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return malls;
}

// Items matching `query`, each with the shops that sell it.
// When `mallSlug` is given, only items sold in that mall are returned,
// and `shops` lists only the shops in that mall.
export async function searchItems(query, mallSlug) {
  const q = query.trim();
  if (!q) return [];

  const { data, error } = await supabase
    .from('items')
    .select('id, name, shop_items(shops(name, mall_shops(malls(slug))))')
    .ilike('name', `%${q}%`)
    .limit(12);

  if (error) {
    console.log('Error searching items:', error.message);
    return [];
  }

  return (data ?? [])
    .map((item) => {
      const shops = (item.shop_items ?? [])
        .map((si) => si.shops)
        .filter(Boolean)
        .filter(
          (shop) =>
            !mallSlug || (shop.mall_shops ?? []).some((ms) => ms.malls?.slug === mallSlug)
        )
        .map((shop) => shop.name);

      return { id: item.id, name: item.name, shops };
    })
    .filter((item) => !mallSlug || item.shops.length > 0)
    .slice(0, 6);
}

// For a list of item names, returns the malls that carry them, best first.
// Each result: { slug, name, items, count, total, missing }
export async function getMallRecommendations(itemNames) {
  const names = [...new Set(itemNames.map((n) => n.trim()).filter(Boolean))];
  if (!names.length) return [];

  const { data, error } = await supabase
    .from('items')
    .select('name, shop_items(shops(name, mall_shops(malls(slug, name))))')
    .in('name', names);

  if (error) {
    console.log('Error loading recommendations:', error.message);
    return [];
  }

  const malls = {};
  (data ?? []).forEach((item) => {
    const seen = new Set();
    (item.shop_items ?? []).forEach((si) => {
      (si.shops?.mall_shops ?? []).forEach((ms) => {
        const mall = ms.malls;
        if (!mall || seen.has(mall.slug)) return;
        seen.add(mall.slug);
        if (!malls[mall.slug]) {
          malls[mall.slug] = { slug: mall.slug, name: mall.name, items: [] };
        }
        malls[mall.slug].items.push(item.name);
      });
    });
  });

  return Object.values(malls)
    .map((m) => ({
      ...m,
      count: m.items.length,
      total: names.length,
      missing: names.filter((n) => !m.items.includes(n)),
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}