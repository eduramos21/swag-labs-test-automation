import { products, type Product } from "./products";

export interface Rng {
  seed: number;
  pick(count: number): Product[];
}

// mulberry32: tiny seeded generator, enough for choosing products.
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRng(seed: number): Rng {
  return {
    seed,
    // Every call replays the sequence, so pick(2) is the first two of pick(3).
    pick(count) {
      const next = mulberry32(seed);
      const pool = [...products];
      for (let i = 0; i < count; i++) {
        const j = i + Math.floor(next() * (pool.length - i));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      return pool.slice(0, count);
    },
  };
}
