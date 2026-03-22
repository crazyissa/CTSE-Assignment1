const axios = require('axios');

// ✅ Use Docker service names instead of localhost
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://ds-assignment-auth-service:5001/api/auth';
const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL || 'http://ds-assignment-restaurant-service:5000/api/restaurants';

// Verify a restaurant via REST call
const verifyRestaurant = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const token = req.headers.authorization;

    const response = await axios.put(
      `${RESTAURANT_SERVICE_URL}/verify/${restaurantId}`,
      {},
      {
        headers: { Authorization: token }
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error('Verify Restaurant Error:', err.response?.data || err.message);
    res.status(500).json({ message: err.message });
  }
};

// Get all users via auth_service
const getAllUsers = async (req, res) => {
  try {
    const token = req.headers.authorization;

    const response = await axios.get(`${AUTH_SERVICE_URL}/users`, {
      headers: { Authorization: token }
    });
    res.json(response.data);
  } catch (err) {
    console.error('Get All Users Error:', err.response?.data || err.message);
    res.status(500).json({ message: err.message });
  }
};

// Delete user via auth_service
const deleteUser = async (req, res) => {
  try {
    const token = req.headers.authorization;

    const response = await axios.delete(
      `${AUTH_SERVICE_URL}/users/${req.params.userId}`,
      {
        headers: { Authorization: token }
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error('Delete User Error:', err.response?.data || err.message);
    res.status(500).json({ message: err.message });
  }
};

// Get all restaurants by admin
const getAllRestaurants = async (req, res) => {
  try {
    const token = req.headers.authorization;

    const response = await axios.get(
      `${RESTAURANT_SERVICE_URL}/admin/all`,
      {
        headers: { Authorization: token }
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error('Get All Restaurants Error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ message: err.response?.data?.message || err.message });
  }
};

module.exports = {
  getAllUsers,
  verifyRestaurant,
  deleteUser,
  getAllRestaurants
};
