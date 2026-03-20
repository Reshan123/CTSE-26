const { PaymentModel, PaymentStatus } = require("../models/paymentModel");
const axios = require("axios");

const ORDER_SERVICE = process.env.ORDER_SERVICE_URL || "http://order-service:3003";

const simulatePaymentGateway = (amount, method) => {
  // Simulate payment gateway (95% success rate)
  return Math.random() > 0.05;
};

const paymentController = {
  initiatePayment: async (req, res, next) => {
    try {
      const { orderId, amount, userId, method = "card" } = req.body;

      if (!orderId || !amount || !userId)
        return res.status(400).json({ error: "orderId, amount, and userId are required" });
      if (amount <= 0)
        return res.status(400).json({ error: "Amount must be positive" });

      const existingPayments = PaymentModel.findByOrder(orderId);
      const successfulPayment = existingPayments.find(p => p.status === PaymentStatus.COMPLETED);
      if (successfulPayment)
        return res.status(409).json({ error: "Order already paid", payment: successfulPayment });

      const payment = PaymentModel.create({ orderId, userId, amount, method });

      // Simulate async payment processing
      setTimeout(async () => {
        const success = simulatePaymentGateway(amount, method);
        if (success) {
          PaymentModel.update(payment.id, { status: PaymentStatus.COMPLETED });
          // Notify Order Service
          try {
            await axios.post(`${ORDER_SERVICE}/api/orders/internal/confirm-payment`, {
              orderId, paymentId: payment.id
            });
          } catch (err) {
            console.error("Failed to notify order service:", err.message);
          }
        } else {
          PaymentModel.update(payment.id, { status: PaymentStatus.FAILED });
        }
      }, 2000);

      PaymentModel.update(payment.id, { status: PaymentStatus.PROCESSING });
      res.status(202).json({
        message: "Payment initiated",
        paymentId: payment.id,
        transactionRef: payment.transactionRef,
        status: PaymentStatus.PROCESSING
      });
    } catch (err) { next(err); }
  },

  getPaymentById: (req, res) => {
    const payment = PaymentModel.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    if (payment.userId !== req.user.userId && req.user.role !== "admin")
      return res.status(403).json({ error: "Access denied" });
    res.json({ payment });
  },

  getPaymentsByOrder: (req, res) => {
    const payments = PaymentModel.findByOrder(req.params.orderId);
    res.json({ payments });
  },

  getMyPayments: (req, res) => {
    const payments = PaymentModel.findByUser(req.user.userId);
    res.json({ payments, count: payments.length });
  },

  getAllPayments: (req, res) => {
    const payments = PaymentModel.findAll();
    res.json({ payments, count: payments.length });
  },

  refundPayment: async (req, res, next) => {
    try {
      const payment = PaymentModel.findById(req.params.id);
      if (!payment) return res.status(404).json({ error: "Payment not found" });
      if (payment.status !== PaymentStatus.COMPLETED)
        return res.status(400).json({ error: `Cannot refund payment with status: ${payment.status}` });

      const refunded = PaymentModel.update(payment.id, { status: PaymentStatus.REFUNDED });
      res.json({ message: "Payment refunded successfully", payment: refunded });
    } catch (err) { next(err); }
  }
};

module.exports = paymentController;
