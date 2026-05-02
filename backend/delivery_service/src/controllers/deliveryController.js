// Merge the conflicting parts manually
import mongoose from 'mongoose';
import axios from 'axios';
import Delivery from '../models/Delivery.js';
import { getIO } from '../socket.js';
import jwt from 'jsonwebtoken';

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
    io.emit(`delivery-${delivery._id}-status`, { status: delivery.status });

    res.status(201).json({ message: 'Delivery created and driver assigned', delivery });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const confirmCheckout = async (req, res) => {
  try {
    console.log("========== CONFIRM CHECKOUT START ==========");
    console.log("REQ BODY:", req.body);
    console.log("AUTH HEADER:", req.headers.authorization ? "Exists" : "Missing");
    console.log("ORDER_SERVICE_URL:", process.env.ORDER_SERVICE_URL);

    const { orderId, address, phone, paymentMethod } = req.body;

    if (!orderId || !address || !phone || !paymentMethod) {
      console.log("Missing fields:", { orderId, address, phone, paymentMethod });
      return res.status(400).json({
        message: "Missing required fields (orderId, address, phone, paymentMethod)"
      });
    }

    if (!process.env.ORDER_SERVICE_URL) {
      console.log("ERROR: ORDER_SERVICE_URL is not set");
      return res.status(500).json({
        message: "ORDER_SERVICE_URL environment variable is missing"
      });
    }

    const orderServiceURL = `${process.env.ORDER_SERVICE_URL}/${orderId}`;
    console.log("Calling Order Service URL:", orderServiceURL);

    let orderResponse;

    try {
      orderResponse = await axios.get(orderServiceURL, {
        headers: {
          Authorization: req.headers.authorization || ""
        },
        timeout: 10000
      });

      console.log("Order Service Status:", orderResponse.status);
      console.log("Order Service Data:", orderResponse.data);
    } catch (axiosError) {
      console.log("ORDER SERVICE CALL FAILED");
      console.log("Axios message:", axiosError.message);
      console.log("Axios status:", axiosError.response?.status);
      console.log("Axios data:", axiosError.response?.data);
      console.log("Axios URL:", orderServiceURL);

      return res.status(502).json({
        message: "Failed to fetch order from order-service",
        error: axiosError.message,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        url: orderServiceURL
      });
    }

    const order = orderResponse.data;

    console.log("Parsed order:", order);

    if (!order || !order.customerId || !order.restaurantId) {
      console.log("Invalid order data:", order);
      return res.status(404).json({
        message: "Order not found or invalid data",
        order
      });
    }

    const hardcodedDriverId = new mongoose.Types.ObjectId("680915643c8f937ea053f597");

    const newDelivery = new Delivery({
      orderId: order._id,
      customerId: order.customerId,
      restaurantId: order.restaurantId,
      address,
      phone,
      paymentMethod,
      status: "assigned",
      deliveryPersonId: hardcodedDriverId,
    });

    console.log("Saving delivery:", newDelivery);

    const savedDelivery = await newDelivery.save();

    console.log("Delivery saved:", savedDelivery._id);

    try {
      const io = getIO();
      io.emit(`delivery-${savedDelivery._id}-status`, {
        status: savedDelivery.status
      });
      console.log("Socket event emitted");
    } catch (socketError) {
      console.log("Socket emit failed:", socketError.message);
    }

    console.log("========== CONFIRM CHECKOUT SUCCESS ==========");

    res.status(201).json({
      message: "Delivery created and driver assigned",
      delivery: savedDelivery
    });

  } catch (error) {
    console.log("========== CONFIRM CHECKOUT MAIN ERROR ==========");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

// ✅ Update Delivery Status (Picked → Delivered)
export const updateStatus = async (req, res) => {
  try {
    const deliveryId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const updatedDelivery = await Delivery.findByIdAndUpdate(
      deliveryId,
      { status },
      { new: true }
    );

    if (!updatedDelivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // Emit socket for real-time status update
    const io = getIO();
    io.emit(`delivery-${updatedDelivery._id}-status`, { status: updatedDelivery.status });

    res.json(updatedDelivery);

  } catch (error) {
    console.error('[DELIVERY ERROR] updateStatus:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// ✅ Get Currently Assigned Delivery (For Driver)
export const getAssignedDelivery = async (req, res) => {
  try {
    // Get token from the authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    // Decode the token to get user data
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const driverId = decoded.id || decoded._id; // Depending on how you structured your token

    console.log(driverId, "Driver Id");

    // Find deliveries assigned to this driver
    const deliveries = await Delivery.find({ deliveryPersonId: driverId });
    
    if (!deliveries.length) {
      return res.status(404).json({ message: 'No deliveries assigned to this driver.' });
    }
    
    // Get delivery which is still active
    const activeDelivery = deliveries.find(d => ['assigned', 'picked'].includes(d.status));
    
    if (activeDelivery) {
      return res.status(200).json(activeDelivery);
    } else {
      return res.status(404).json({ message: 'No active deliveries.' });
    }
  } catch (error) {
    console.error('[DELIVERY ERROR] getAssignedDelivery:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// ✅ Get All Deliveries Assigned to Driver
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

// ✅ Get Delivery by ID (For tracking page / customer side)
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
