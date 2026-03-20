const payments = new Map();
let idCounter = 1;

const PaymentStatus = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded"
};

const PaymentModel = {
  create: (data) => {
    const id = `PAY-${String(idCounter++).padStart(5, "0")}`;
    const payment = {
      id,
      orderId: data.orderId,
      userId: data.userId,
      amount: data.amount,
      currency: data.currency || "USD",
      method: data.method || "card",
      status: PaymentStatus.PENDING,
      transactionRef: `TXN-${Date.now()}-${Math.random().toString(36).substr(2,6).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    payments.set(id, payment);
    return payment;
  },
  findById: (id) => payments.get(id) || null,
  findByOrder: (orderId) => Array.from(payments.values()).filter(p => p.orderId === orderId),
  findByUser: (userId) => Array.from(payments.values()).filter(p => p.userId === userId),
  findAll: () => Array.from(payments.values()),
  update: (id, updates) => {
    const p = payments.get(id);
    if (!p) return null;
    const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
    payments.set(id, updated);
    return updated;
  }
};

module.exports = { PaymentModel, PaymentStatus };
