import mongoose from 'mongoose';
import axios from 'axios';
import Delivery from '../models/Delivery.js';
import Driver from '../models/Driver.js';
import { getIO } from '../socket.js';

// Order service URL using Docker service name
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://ds-assignment-order-service:5005';

// Create Delivery and Auto-Assign Driver
export const createDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.create(req.body);
    const availableDrivers = await Driver.find({ isAvailable: true });

    if (!availableDrivers.length) {
      return res.status(200).json({ message: 'Delivery created, but no drivers available', delivery });
    }

    const assignedDriver = availableDrivers[0];
    delivery.deliveryPersonId = assignedDriver._id;
    delivery.status = 'assigned';
    await delivery.save();

    assignedDriver.isAvailable = false;
    await assignedDriver.save();

    const io = getIO();
    io.to(`delivery-${delivery._id}`).emit('delivery-status-update', {
      deliveryId: delivery._id,
      status: delivery.status
    });

    res.status(201).json({ message: 'Delivery created and driver assigned', delivery });
  } catch (err) {
    console.error('[DELIVERY ERROR] createDelivery:', err.message);
    res.status(400).json({ message: err.message });
  }
};

// Confirm Checkout and Create Delivery
export const confirmCheckout = async (req, res) => {
  try {
    const { orderId, address, phone, paymentMethod } = req.body;

    if (!orderId || !address || !phone || !paymentMethod) {
      return res.status(400).json({ message: 'Missing required fields (orderId, address, phone, paymentMethod)' });
    }

    // Single axios call with forwarded auth token — no localhost, uses Docker service name
    const orderResponse = await axios.get(
      `${ORDER_SERVICE_URL}/api/orders/${orderId}`,
      { headers: { Authorization: req.headers.authorization } }
    );

    const order = orderResponse.data;

    if (!order || !order.customerId || !order.restaurantId) {
      return res.status(404).json({ message: 'Order not found or invalid data' });
    }

    const hardcodedDriverId = new mongoose.Types.ObjectId("680915643c8f937ea053f597");

    const newDelivery = new Delivery({
      orderId: order._id,
      customerId: order.customerId,
      restaurantId: order.restaurantId,
      address,
      phone,
      paymentMethod,
      status: 'assigned',
      deliveryPersonId: hardcodedDriverId,
    });

    const savedDelivery = await newDelivery.save();

    // Emit to room, not broadcast
    const io = getIO();
    io.to(`delivery-${savedDelivery._id}`).emit('delivery-status-update', {
      deliveryId: savedDelivery._id,
      status: savedDelivery.status
    });

    res.status(201).json({ message: 'Delivery created and driver assigned', delivery: savedDelivery });

  } catch (error) {
    console.error('[DELIVERY ERROR] confirmCheckout:', error?.message);
    console.error('[DELIVERY ERROR] Stack:', error?.stack);
    res.status(500).json({ message: error?.message || 'Internal server error' });
  }
};

// Update Delivery Status
export const updateStatus = async (req, res) => {
  try {
    const deliveryId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = ['pending', 'assigned', 'picked', 'delivered'];

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
    }

    const updateData = {
      status,
      statusUpdatedAt: new Date(),
      ...(status === 'delivered' ? { deliveredAt: new Date() } : {})
    };

    const updatedDelivery = await Delivery.findByIdAndUpdate(deliveryId, updateData, { new: true });

    if (!updatedDelivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    const io = getIO();
    io.to(`delivery-${updatedDelivery._id}`).emit('delivery-status-update', {
      deliveryId: updatedDelivery._id,
      status: updatedDelivery.status,
      timestamp: new Date()
    });

    res.json(updatedDelivery);

  } catch (error) {
    console.error('[DELIVERY ERROR] updateStatus:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// Get Currently Assigned Delivery (For Driver)
// Uses req.user set by authenticate middleware — no need to re-decode JWT
export const getAssignedDelivery = async (req, res) => {
  try {
    const driverId = req.user.id || req.user._id;

    if (!driverId) {
      return res.status(401).json({ message: 'Could not determine driver ID from token' });
    }

    console.log(driverId, "Driver Id");

    const deliveries = await Delivery.find({ deliveryPersonId: driverId });

    if (!deliveries.length) {
      return res.status(404).json({ message: 'No deliveries assigned to this driver.' });
    }

    const activeDelivery = deliveries.find(d => ['assigned', 'picked'].includes(d.status));

    if (activeDelivery) {
      return res.status(200).json(activeDelivery);
    } else {
      return res.status(404).json({ message: 'No active deliveries.' });
    }
  } catch (error) {
    console.error('[DELIVERY ERROR] getAssignedDelivery:', error.message);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get All Deliveries Assigned to Driver
export const getDeliveriesByPerson = async (req, res) => {
  try {
    const hardcodedDriverId = new mongoose.Types.ObjectId("680915643c8f937ea053f597");
    const deliveries = await Delivery.find({ deliveryPersonId: hardcodedDriverId });
    res.status(200).json(deliveries);
  } catch (error) {
    console.error('[DELIVERY ERROR] getDeliveriesByPerson:', error.message);
    res.status(500).json({ message: 'Error fetching deliveries' });
  }
};

// Get Delivery by ID
export const getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.status(200).json(delivery);
  } catch (error) {
    console.error('[DELIVERY ERROR] getDeliveryById:', error.message);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};
