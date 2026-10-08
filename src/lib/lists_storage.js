import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

export const LISTS_CACHE_KEY = '@plan_ed_cached_shopping_lists';

/**
 * Read cached shopping lists from AsyncStorage.
 * Always returns an array (empty on miss or error).
 */
export async function getCachedLists() {
  try {
    const raw = await AsyncStorage.getItem(LISTS_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to read lists from local cache:', e);
    return [];
  }
}

/**
 * Persist shopping lists array to AsyncStorage.
 */
export async function setCachedLists(lists) {
  try {
    const safeLists = Array.isArray(lists) ? lists : [];
    await AsyncStorage.setItem(LISTS_CACHE_KEY, JSON.stringify(safeLists));
    return safeLists;
  } catch (e) {
    console.warn('Failed to save lists to local cache:', e);
    return [];
  }
}

/**
 * Clear cached shopping lists (e.g. on user logout).
 */
export async function clearCachedLists() {
  try {
    await AsyncStorage.removeItem(LISTS_CACHE_KEY);
  } catch (e) {
    console.warn('Failed to clear cached lists:', e);
  }
}

/**
 * Synchronize any local lists that were created, updated, or marked for deletion offline.
 */
export async function syncPendingLists() {
  try {
    const cached = await getCachedLists();
    const pending = cached.filter((item) => item && item._pendingSync);
    if (pending.length === 0) return cached;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) return cached;

    let hasChanges = false;
    let updatedList = [...cached];

    for (const item of pending) {
      try {
        if (item._pendingAction === 'delete') {
          if (!String(item.id).startsWith('local_')) {
            await supabase.from('lists').delete().eq('id', item.id);
          }
          updatedList = updatedList.filter((x) => x.id !== item.id);
          hasChanges = true;
        } else if (item._pendingAction === 'create' || String(item.id).startsWith('local_')) {
          const { data, error } = await supabase
            .from('lists')
            .insert({
              title: item.title,
              details: item.details,
              user_id: session.user.id,
              created_at: item.created_at,
              last_opened_at: item.last_opened_at,
            })
            .select('*')
            .single();

          if (!error && data) {
            // Replace local temporary ID with Supabase row
            updatedList = updatedList.map((x) => (x.id === item.id ? data : x));
            hasChanges = true;
          }
        } else if (item._pendingAction === 'update') {
          const { error } = await supabase
            .from('lists')
            .update({
              title: item.title,
              details: item.details,
              last_opened_at: item.last_opened_at,
            })
            .eq('id', item.id);

          if (!error) {
            updatedList = updatedList.map((x) =>
              x.id === item.id
                ? { ...x, _pendingSync: false, _pendingAction: null }
                : x
            );
            hasChanges = true;
          }
        }
      } catch (itemErr) {
        console.warn('Offline sync attempt error for list:', item.id, itemErr);
      }
    }

    if (hasChanges) {
      await setCachedLists(updatedList);
    }
    return updatedList;
  } catch (err) {
    console.warn('Error during syncPendingLists:', err);
    return await getCachedLists();
  }
}

/**
 * Fetch lists with offline cache support.
 * 1. Syncs any pending offline actions if connected.
 * 2. Fetches fresh lists from Supabase and updates cache.
 * 3. Falls back gracefully to cached data if offline or error occurs.
 */
export async function fetchListsWithCache() {
  await syncPendingLists().catch(() => {});
  const cached = await getCachedLists();

  try {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('fetchListsWithCache error (fallback to cache):', error.message);
      return { data: cached, error, fromCache: true };
    }

    if (Array.isArray(data)) {
      // Preserve any local offline items that haven't synced yet
      const pendingLocal = cached.filter((c) => c && c._pendingSync);
      const merged = [
        ...pendingLocal,
        ...data.filter((d) => !pendingLocal.some((p) => p.id === d.id)),
      ];
      await setCachedLists(merged);
      return { data: merged, error: null, fromCache: false };
    }

    return { data: cached, error: null, fromCache: true };
  } catch (err) {
    console.log('fetchListsWithCache network offline (using cache):', err);
    return { data: cached, error: err, fromCache: true };
  }
}

/**
 * Save (create or update) a shopping list with instant local caching and background Supabase sync.
 */
export async function saveListWithCache({ noteId, title, details, userId }) {
  const cached = await getCachedLists();
  const now = new Date().toISOString();
  const isNew = !noteId;
  const targetId = isNew
    ? `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    : noteId;

  if (isNew) {
    const newEntry = {
      id: targetId,
      title: title.trim(),
      details,
      user_id: userId,
      created_at: now,
      last_opened_at: now,
      _pendingSync: true,
      _pendingAction: 'create',
    };

    // Save to local cache immediately
    const updated = [newEntry, ...cached];
    await setCachedLists(updated);

    // Try Supabase insert
    try {
      const { data, error } = await supabase
        .from('lists')
        .insert({
          title: title.trim(),
          details,
          user_id: userId,
        })
        .select('*')
        .single();

      if (!error && data) {
        const finalLists = updated.map((item) => (item.id === targetId ? data : item));
        await setCachedLists(finalLists);
        return { data, error: null, isOffline: false };
      } else {
        return { data: newEntry, error: null, isOffline: true };
      }
    } catch {
      return { data: newEntry, error: null, isOffline: true };
    }
  } else {
    const existing = cached.find((c) => c.id === targetId) || {};
    const updatedEntry = {
      ...existing,
      id: targetId,
      title: title.trim(),
      details,
      last_opened_at: now,
      _pendingSync: true,
      _pendingAction: 'update',
    };

    const updated = cached.map((item) => (item.id === targetId ? updatedEntry : item));
    if (!cached.some((item) => item.id === targetId)) {
      updated.unshift(updatedEntry);
    }
    await setCachedLists(updated);

    try {
      const { data, error } = await supabase
        .from('lists')
        .update({
          title: title.trim(),
          details,
          last_opened_at: now,
        })
        .eq('id', targetId)
        .select('*')
        .single();

      if (!error && data) {
        const syncedLists = updated.map((item) =>
          item.id === targetId ? { ...data, _pendingSync: false, _pendingAction: null } : item
        );
        await setCachedLists(syncedLists);
        return { data, error: null, isOffline: false };
      } else {
        return { data: updatedEntry, error: null, isOffline: true };
      }
    } catch {
      return { data: updatedEntry, error: null, isOffline: true };
    }
  }
}

/**
 * Update list details in cache immediately and sync to Supabase (ideal for checklist toggling).
 */
export async function updateListDetailsWithCache(noteId, details) {
  if (!noteId) return { error: new Error('Missing list ID') };
  const cached = await getCachedLists();
  const updated = cached.map((item) =>
    item.id === noteId
      ? { ...item, details, _pendingSync: true, _pendingAction: 'update' }
      : item
  );
  await setCachedLists(updated);

  try {
    const { error } = await supabase.from('lists').update({ details }).eq('id', noteId);
    if (!error) {
      const synced = updated.map((item) =>
        item.id === noteId ? { ...item, _pendingSync: false, _pendingAction: null } : item
      );
      await setCachedLists(synced);
      return { error: null, isOffline: false };
    }
    return { error: null, isOffline: true };
  } catch {
    return { error: null, isOffline: true };
  }
}

/**
 * Delete lists from cache immediately and delete from Supabase.
 */
export async function deleteListsWithCache(ids) {
  if (!ids || ids.length === 0) return { error: null };
  const idSet = new Set(ids);
  const cached = await getCachedLists();

  const remaining = cached.filter((item) => !idSet.has(item.id));
  await setCachedLists(remaining);

  try {
    const { error } = await supabase.from('lists').delete().in('id', ids);
    if (error) {
      console.warn('deleteListsWithCache remote error:', error.message);
      return { error, isOffline: true };
    }
    return { error: null, isOffline: false };
  } catch (e) {
    console.warn('deleteListsWithCache network offline:', e);
    return { error: null, isOffline: true };
  }
}

/**
 * Mark a list as opened in cache and update Supabase.
 */
export async function markOpenedWithCache(noteId) {
  if (!noteId) return;
  const now = new Date().toISOString();
  const cached = await getCachedLists();
  const updated = cached.map((item) =>
    item.id === noteId ? { ...item, last_opened_at: now } : item
  );
  await setCachedLists(updated);

  try {
    await supabase.from('lists').update({ last_opened_at: now }).eq('id', noteId);
  } catch {
    // Non-critical background call
  }
}
