let counter = 0;

/**
 * Generates an unconditionally unique ID combining prefix, timestamp, sequential counter, and random entropy.
 * Prevents any key collision when multiple items are generated in the exact same millisecond.
 */
export function generateUniqueId(prefix = 'id'): string {
  counter = (counter + 1) % 1000000;
  const time = Date.now();
  const rand = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${time}_${counter}_${rand}`;
}

/**
 * Ensures an array of items with `id` has strictly unique keys.
 * If any duplicate or missing id is found, replaces it with a new unique id.
 */
export function deduplicateArrayIds<T extends { id: string }>(items: T[], prefix = 'item'): T[] {
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  return items.map((item, index) => {
    let cleanId = item.id;
    if (!cleanId || seen.has(cleanId)) {
      cleanId = `${cleanId || prefix}_dup_${index}_${Math.random().toString(36).substring(2, 8)}`;
    }
    seen.add(cleanId);
    return {
      ...item,
      id: cleanId,
    };
  });
}
