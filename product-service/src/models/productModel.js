const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price:       { type: Number, required: true, min: 0 },
    stock:       { type: Number, required: true, min: 0, default: 0 },
    category:    { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// Text index for search
productSchema.index({ name: "text", description: "text" });
// Regular indexes for common filters
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

productSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Product = mongoose.model("Product", productSchema);

/*
// Seed initial products if collection is empty
const seed = async () => {
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany([
      { name: "Wireless Headphones", description: "Premium audio experience", price: 79.99, stock: 50, category: "Electronics" },
      { name: "Running Shoes",       description: "Lightweight and durable",  price: 59.99, stock: 100, category: "Sports" },
      { name: "Coffee Mug",          description: "Large capacity ceramic mug", price: 12.99, stock: 200, category: "Kitchen" },
    ]);
    console.log("[product-service] Seed data inserted");
  }
};
*/

module.exports = { Product };
