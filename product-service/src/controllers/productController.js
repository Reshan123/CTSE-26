const ProductModel = require("../models/productModel");

const productController = {
  getAll: (req, res) => {
    const products = ProductModel.findAll(req.query);
    res.json({ products, count: products.length });
  },

  getById: (req, res) => {
    const product = ProductModel.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ product });
  },

  create: (req, res) => {
    const { name, description, price, stock, category } = req.body;
    if (!name || price == null || stock == null || !category)
      return res.status(400).json({ error: "name, price, stock, and category are required" });
    if (price < 0 || stock < 0)
      return res.status(400).json({ error: "price and stock must be non-negative" });
    const product = ProductModel.create({ name, description: description || "", price: parseFloat(price), stock: parseInt(stock), category });
    res.status(201).json({ message: "Product created", product });
  },

  update: (req, res) => {
    const product = ProductModel.update(req.params.id, req.body);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product updated", product });
  },

  delete: (req, res) => {
    if (!ProductModel.delete(req.params.id)) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted" });
  },

  // Internal endpoint called by Order Service
  // checkAndReserveStock: (req, res) => {
  //   const { productId, quantity } = req.body;
  //   if (!productId || !quantity) return res.status(400).json({ error: "productId and quantity required" });
  //   const product = ProductModel.findById(productId);
  //   if (!product) return res.status(404).json({ error: "Product not found" });
  //   if (product.stock < quantity) return res.status(409).json({ error: "Insufficient stock", available: product.stock });
  //   const updated = ProductModel.decrementStock(productId, quantity);
  //   res.json({ success: true, product: updated, reserved: quantity });
  // },

  // // Restore stock if order cancelled
  // restoreStock: (req, res) => {
  //   const { productId, quantity } = req.body;
  //   const product = ProductModel.findById(productId);
  //   if (!product) return res.status(404).json({ error: "Product not found" });
  //   const updated = ProductModel.update(productId, { stock: product.stock + quantity });
  //   res.json({ success: true, product: updated });
  // }
};

module.exports = productController;
