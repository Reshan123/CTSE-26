const mongoose = require("mongoose");
const { Product } = require("../models/productModel");

// Helper functions to build query filters
const buildCategoryFilter = (category) => {
  if (typeof category === "string" && category.trim()) {
    return { category: category.trim() };
  }
  return {};
};

const buildPriceFilter = (minPrice, maxPrice) => {
  if (minPrice === undefined && maxPrice === undefined) {
    return {};
  }

  const filter = {};

  if (minPrice !== undefined) {
    const parsedMin = Number(minPrice);
    if (Number.isNaN(parsedMin)) {
      throw new Error("Invalid minPrice");
    }
    filter.$gte = parsedMin;
  }

  if (maxPrice !== undefined) {
    const parsedMax = Number(maxPrice);
    if (Number.isNaN(parsedMax)) {
      throw new Error("Invalid maxPrice");
    }
    filter.$lte = parsedMax;
  }

  return { price: filter };
};

const buildSearchFilter = (search) => {
  if (typeof search === "string" && search.trim()) {
    return { $text: { $search: search.trim() } };
  }
  return {};
};

const productController = {
  getAll: async (req, res, next) => {
    try {
      const { category, minPrice, maxPrice, search } = req.query;
      
      const filter = {
        ...buildCategoryFilter(category),
        ...buildPriceFilter(minPrice, maxPrice),
        ...buildSearchFilter(search)
      };

      const products = await Product.find(filter);
      res.json({ products, count: products.length });
    } catch (err) { next(err); }
  },

  getById: async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id))
        return res.status(404).json({ error: "Product not found" });
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json({ product });
    } catch (err) { next(err); }
  },

  create: async (req, res, next) => {
    try {
      const { name, description, price, stock, category } = req.body;
      if (!name || price == null || stock == null || !category)
        return res.status(400).json({ error: "name, price, stock, and category are required" });
      const product = await Product.create({
        name, description: description || "",
        price: parseFloat(price), stock: parseInt(stock), category
      });
      res.status(201).json({ message: "Product created", product });
    } catch (err) { next(err); }
  },

  update: async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id))
        return res.status(404).json({ error: "Product not found" });
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json({ message: "Product updated", product });
    } catch (err) { next(err); }
  },

  delete: async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id))
        return res.status(404).json({ error: "Product not found" });
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json({ message: "Product deleted" });
    } catch (err) { next(err); }
  },

  // Called by Order Service — atomically check AND decrement stock
  checkAndReserveStock: async (req, res, next) => {
    try {
      const { productId, quantity } = req.body;

      const quantityNum = parseInt(quantity);

      if (
        !productId ||
        !mongoose.Types.ObjectId.isValid(productId) ||
        Number.isNaN(quantityNum) ||
        quantityNum <= 0
      ) {
        return res.status(400).json({
          error: "Valid productId and positive integer quantity required"
        });
      }

      const safeProductId = new mongoose.Types.ObjectId(productId);

      const product = await Product.findOneAndUpdate(
        {
          _id: safeProductId,
          stock: { $gte: quantityNum }
        },
        {
          $inc: { stock: -quantityNum }
        },
        {
          new: true
        }
      );

      if (!product) {
        return res.status(409).json({
          error: "Insufficient stock or product not found"
        });
      }

      res.json({ success: true, product, reserved: quantityNum });

    } catch (err) {
      next(err);
    }
  },

  restoreStock: async (req, res, next) => {
    try {
      const { productId, quantity } = req.body;
      const quantityNum = parseInt(quantity);
      if (!productId || Number.isNaN(quantityNum) || quantityNum <= 0)
        return res.status(400).json({ error: "productId and positive integer quantity required" });
      const product = await Product.findByIdAndUpdate(
        productId,
        { $inc: { stock: quantityNum } },
        { new: true }
      );
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json({ success: true, product });
    } catch (err) { next(err); }
  }
};

module.exports = productController;
