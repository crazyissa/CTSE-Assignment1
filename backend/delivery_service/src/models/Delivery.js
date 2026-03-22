import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantId: { type: String, required: true },
  deliveryPersonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'picked', 'delivered'],
    default: 'pending'
  },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  paymentMethod: {
    type: String,
    enum: ['Cash on Delivery', 'Card'],
    default: 'Cash on Delivery'
  },
  driverLocation: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  // For tracking — set when restaurant/customer locations are known
  restaurantLocation: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  customerLocation: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  lastLocationUpdate: { type: Date, default: null },
  statusUpdatedAt: { type: Date, default: null },
  deliveredAt: { type: Date, default: null },
  estimatedTime: { type: String },
}, { timestamps: true });

const Delivery = mongoose.model('Delivery', deliverySchema);

export default Delivery;
