const axios = require('axios');

// ✅ Use Docker service name instead of localhost
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://ds-assignment-payment-service:5004/api/payments';

// View all transactions
const getAllTransactions = async (req, res) => {
  try {
    const token = req.headers.authorization;

    const response = await axios.get(`${PAYMENT_SERVICE_URL}/admin/transactions`, {
      headers: { Authorization: token }
    });
    res.json(response.data);
  } catch (err) {
    console.error('Get All Transactions Error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ message: 'Error fetching transactions', error: err.message });
  }
};

// Filter transactions by date
const getFilteredTransactions = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const token = req.headers.authorization;

    const response = await axios.get(`${PAYMENT_SERVICE_URL}/admin/transactions/filter`, {
      headers: { Authorization: token },
      params: { startDate, endDate }
    });
    res.json(response.data);
  } catch (err) {
    console.error('Filter Transactions Error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ message: 'Error filtering transactions', error: err.message });
  }
};

module.exports = {
  getAllTransactions,
  getFilteredTransactions
};
