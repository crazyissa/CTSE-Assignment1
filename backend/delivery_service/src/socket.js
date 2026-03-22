import Delivery from './models/Delivery.js';

let io; // Store the instance globally

// Called from app.js with the already-created Socket.IO Server instance
export const setupSocket = (ioInstance) => {
  io = ioInstance;

  io.on('connection', (socket) => {
    console.log('🚀 WebSocket Connected:', socket.id);

    // Clients join specific delivery room
    socket.on('joinDelivery', ({ deliveryId }) => {
      if (deliveryId) {
        socket.join(`delivery-${deliveryId}`);
        console.log(`👥 Client joined delivery room: delivery-${deliveryId}`);
      }
    });

    // Driver sends location updates
    socket.on('driverLocationUpdate', async ({ deliveryId, lat, lng }) => {
      try {
        if (!deliveryId || lat === undefined || lng === undefined) {
          console.warn('⚠️ Missing location update fields');
          return;
        }

        console.log(`📍 Driver location update for ${deliveryId}: ${lat}, ${lng}`);

        await Delivery.findByIdAndUpdate(deliveryId, {
          driverLocation: { lat, lng },
          lastLocationUpdate: new Date()
        });

        // Broadcast only to clients tracking this delivery
        io.to(`delivery-${deliveryId}`).emit('driverLocationUpdate', {
          deliveryId,
          lat,
          lng,
          timestamp: new Date()
        });
      } catch (err) {
        console.error(`❌ Error updating delivery location for ${deliveryId}:`, err.message);
      }
    });

    // Update delivery status via socket
    socket.on('updateDeliveryStatus', async ({ deliveryId, status }) => {
      try {
        if (!deliveryId || !status) {
          console.warn('⚠️ Missing status update fields');
          return;
        }

        console.log(`📝 Status update for ${deliveryId}: ${status}`);

        await Delivery.findByIdAndUpdate(deliveryId, {
          status,
          statusUpdatedAt: new Date(),
          ...(status === 'delivered' ? { deliveredAt: new Date() } : {})
        });

        io.to(`delivery-${deliveryId}`).emit('delivery-status-update', {
          deliveryId,
          status,
          timestamp: new Date()
        });
      } catch (err) {
        console.error(`❌ Error updating delivery status for ${deliveryId}:`, err.message);
      }
    });

    // Client requests delivery data
    socket.on('getDeliveryInfo', async ({ deliveryId }) => {
      try {
        if (!deliveryId) {
          console.warn('⚠️ Missing deliveryId in getDeliveryInfo');
          return;
        }

        const delivery = await Delivery.findById(deliveryId);
        if (delivery) {
          socket.emit('deliveryInfo', {
            deliveryId,
            data: delivery,
            restaurantLocation: delivery.restaurantLocation,
            customerLocation: delivery.customerLocation,
          });
        }
      } catch (err) {
        console.error(`❌ Error fetching delivery info for ${deliveryId}:`, err.message);
      }
    });

    socket.on('reportError', ({ deliveryId, errorType, message }) => {
      console.error(`⚠️ Client error report for ${deliveryId}: ${errorType} - ${message}`);
    });

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });
};

// Safe getter for io — use in controllers
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

export const emitDeliveryUpdate = (deliveryId, event, data) => {
  if (!io) return;
  io.to(`delivery-${deliveryId}`).emit(event, { deliveryId, ...data });
};
