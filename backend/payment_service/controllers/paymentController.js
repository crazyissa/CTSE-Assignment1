const stripe = require('../config/stripe');
const Payment = require('../models/Payment');

// Checkout - creates Stripe session
exports.testCheckout = async (req, res) => {
  const { amount = 1500, orderId = "test-order", userId = "test-user", deliveryId } = req.body;

  console.log('[PAYMENT] testCheckout received:', { orderId, userId, amount, deliveryId });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'lkr',
          product_data: {
            name: `Order ${orderId}`,
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/payment-cancelled`,
      metadata: {
        orderId: orderId || '',
        userId: userId || '',
        deliveryId: deliveryId || '',
      }
    });

    console.log('[PAYMENT] Stripe session created, metadata:', session.metadata);
    res.json({ url: session.url });
  } catch (err) {
    console.error('[PAYMENT] testCheckout error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Create Payment Intent
exports.createPaymentIntent = async (req, res) => {
  const { amount, orderId, userId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'usd',
      metadata: { orderId, userId }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Confirm Payment - called from PaymentSuccess page
exports.confirmPayment = async (req, res) => {
  const { sessionId } = req.body;

  console.log('[PAYMENT] confirmPayment called with sessionId:', sessionId);

  try {
    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('[PAYMENT] Session metadata:', session.metadata);

    // ✅ Read metadata from SESSION, not from paymentIntent
    // Stripe does not copy session metadata to the payment intent automatically
    const { orderId, userId, deliveryId } = session.metadata;

    console.log('[PAYMENT] Extracted deliveryId:', deliveryId);

    // Retrieve payment intent just for amount and status
    const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);

    // Avoid duplicate payment records
    const existing = await Payment.findOne({ stripePaymentId: paymentIntent.id });
    if (existing) {
      console.log('[PAYMENT] Returning existing payment record');
      return res.status(200).json({
        ...existing.toObject(),
        deliveryId: deliveryId || null,
        orderId: orderId || null,
      });
    }

    const payment = new Payment({
      orderId,
      userId,
      amount: paymentIntent.amount_received / 100,
      currency: 'lkr',
      paymentStatus: paymentIntent.status,
      stripePaymentId: paymentIntent.id,
    });

    await payment.save();
    console.log('[PAYMENT] Payment saved to DB:', payment._id);

    // ✅ Return deliveryId so frontend can navigate to tracking page
    res.status(201).json({
      ...payment.toObject(),
      deliveryId: deliveryId || null,
      orderId: orderId || null,
    });
  } catch (err) {
    console.error('[PAYMENT] confirmPayment error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// View All Transactions (Admin Only)
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Payment.find(
      {},
      '_id amount currency paymentStatus stripePaymentId createdAt'
    );
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching transactions', error: err.message });
  }
};

// Filter Transactions by date
exports.getFilteredTransactions = async (req, res) => {
  const { startDate, endDate } = req.query;
  const query = {};

  if (startDate && endDate) {
    query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  try {
    const transactions = await Payment.find(
      query,
      '_id amount currency paymentStatus stripePaymentId createdAt'
    );
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Error filtering transactions', error: err.message });
  }
};
