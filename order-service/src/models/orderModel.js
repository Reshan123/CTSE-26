const orders = new Map();
let idCounter = 1;

const OrderStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled"
};

const OrderModel = {
  create: (data) => {
    const id = `ORD-${String(idCounter++).padStart(5, "0")}`;
    const order = {
      id,
      userId: data.userId,
      items: data.items,
      subtotal: data.subtotal,
      total: data.total,
      status: OrderStatus.PENDING,
      shippingAddress: data.shippingAddress,
      paymentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    orders.set(id, order);
    return order;
  },
  findById: (id) => orders.get(id) || null,
  findByUser: (userId) => Array.from(orders.values()).filter(o => o.userId === userId),
  findAll: () => Array.from(orders.values()),
  update: (id, updates) => {
    const order = orders.get(id);
    if (!order) return null;
    const updated = { ...order, ...updates, updatedAt: new Date().toISOString() };
    orders.set(id, updated);
    return updated;
  },
  updateStatus: (id, status) => {
    const order = orders.get(id);
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    orders.set(id, order);
    return order;
  }
};

module.exports = { OrderModel, OrderStatus };
