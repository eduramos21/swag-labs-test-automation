export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

export const products: readonly Product[] = [
  {
    id: 4,
    name: "Sauce Labs Backpack",
    price: 29.99,
    description:
      "carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromising style with unequaled laptop and tablet protection.",
  },
  {
    id: 0,
    name: "Sauce Labs Bike Light",
    price: 9.99,
    description:
      "A red light isn't the desired state in testing but it sure helps when riding your bike at night. Water-resistant with 3 lighting modes, 1 AAA battery included.",
  },
  {
    id: 1,
    name: "Sauce Labs Bolt T-Shirt",
    price: 15.99,
    description:
      "Get your testing superhero on with the Sauce Labs bolt T-shirt. From American Apparel, 100% ringspun combed cotton, heather gray with red bolt.",
  },
  {
    id: 5,
    name: "Sauce Labs Fleece Jacket",
    price: 49.99,
    description:
      "It's not every day that you come across a midweight quarter-zip fleece jacket capable of handling everything from a relaxing day outdoors to a busy day at the office.",
  },
  {
    id: 2,
    name: "Sauce Labs Onesie",
    price: 7.99,
    description:
      "Rib snap infant onesie for the junior automation engineer in development. Reinforced 3-snap bottom closure, two-needle hemmed sleeved and bottom won't unravel.",
  },
  {
    id: 3,
    name: "Test.allTheThings() T-Shirt (Red)",
    price: 15.99,
    description:
      "This classic Sauce Labs t-shirt is perfect to wear when cozying up to your keyboard to automate a few tests. Super-soft and comfy ringspun combed cotton.",
  },
];

export const formatPrice = (price: number): string => `$${price.toFixed(2)}`;

export interface SortOption {
  label: string;
  by: "name" | "price";
  descending: boolean;
}

export const sortOptions: readonly SortOption[] = [
  { label: "Name (A to Z)", by: "name", descending: false },
  { label: "Name (Z to A)", by: "name", descending: true },
  { label: "Price (low to high)", by: "price", descending: false },
  { label: "Price (high to low)", by: "price", descending: true },
];

// Two prices tie at $15.99, so price sorts are checked on the price column, not on names.
export function expectedOrder({ by, descending }: SortOption): string[] {
  const sorted = [...products].sort((a, b) =>
    by === "name" ? a.name.localeCompare(b.name) : a.price - b.price,
  );
  if (descending) sorted.reverse();
  return sorted.map((p) => (by === "name" ? p.name : formatPrice(p.price)));
}
