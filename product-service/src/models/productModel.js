const products = new Map();
let idCounter = 1;

// Seed data for now
const seedProducts = [
  { name: "Wireless Headphones", description: "Premium audio experience", price: 79.99, stock: 50, category: "Electronics" },
  { name: "Running Shoes", description: "Lightweight and durable", price: 59.99, stock: 100, category: "Sports" },
  { name: "Coffee Mug", description: "Large capacity ceramic mug", price: 12.99, stock: 200, category: "Kitchen" }
];

seedProducts.forEach(p => {
  const id = String(idCounter++);
  products.set(id, { id, ...p, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
});

const ProductModel = {
  create: (data) => {
    const id = String(idCounter++);
    const product = { id, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    products.set(id, product);
    return product;
  },
  findById: (id) => products.get(String(id)) || null,
  findAll: (filters = {}) => {
    let list = Array.from(products.values());
    if (filters.category) list = list.filter(p => p.category === filters.category);
    if (filters.minPrice) list = list.filter(p => p.price >= parseFloat(filters.minPrice));
    if (filters.maxPrice) list = list.filter(p => p.price <= parseFloat(filters.maxPrice));
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
    }
    return list;
  },
  update: (id, updates) => {
    const p = products.get(String(id));
    if (!p) return null;
    const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
    products.set(String(id), updated);
    return updated;
  },
  delete: (id) => products.delete(String(id)),
  // decrementStock: (id, qty) => {
  //   const p = products.get(String(id));
  //   if (!p || p.stock < qty) return null;
  //   p.stock -= qty;
  //   p.updatedAt = new Date().toISOString();
  //   products.set(String(id), p);
  //   return p;
  // },
  // checkStock: (id, qty) => {
  //   const p = products.get(String(id));
  //   return p && p.stock >= qty;
  // }
};

module.exports = ProductModel;
