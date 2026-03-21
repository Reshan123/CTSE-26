const request = require("supertest");
const app = require("../src/app");

describe("Product Endpoints", () => {
  describe("GET /api/products", () => {
    it("should return product list", async () => {
      const res = await request(app).get("/api/products");
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.products)).toBe(true);
      expect(res.body.products.length).toBeGreaterThan(0);
    });

    it("should filter by category", async () => {
      const res = await request(app).get("/api/products?category=Electronics");
      expect(res.statusCode).toBe(200);
      res.body.products.forEach(p => expect(p.category).toBe("Electronics"));
    });
  });

  describe("GET /api/products/:id", () => {
    it("should return product by ID", async () => {
      const res = await request(app).get("/api/products/1");
      expect(res.statusCode).toBe(200);
      expect(res.body.product).toHaveProperty("id");
    });

    it("should return 404 for non-existent product", async () => {
      const res = await request(app).get("/api/products/9999");
      expect(res.statusCode).toBe(404);
    });
  });

  describe("POST /api/products/internal/check-stock", () => {
    it("should check and reserve stock", async () => {
      const res = await request(app).post("/api/products/internal/check-stock")
        .send({ productId: "1", quantity: 1 });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should reject insufficient stock", async () => {
      const res = await request(app).post("/api/products/internal/check-stock")
        .send({ productId: "1", quantity: 999999 });
      expect(res.statusCode).toBe(409);
    });
  });

  describe("GET /health", () => {
    it("should return healthy", async () => {
      const res = await request(app).get("/health");
      expect(res.statusCode).toBe(200);
      expect(res.body.service).toBe("product-service");
    });
  });
});
