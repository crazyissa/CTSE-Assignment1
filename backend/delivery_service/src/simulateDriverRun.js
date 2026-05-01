import { io } from "socket.io-client";

// ✅ Connect to Delivery service WebSocket server
const socket = io(process.env.DELIVERY_SERVICE_URL);

socket.on("connect", () => {
  console.log("✅ Connected to Socket.IO server");

  // Starting location - Colombo center
  let lat = 6.9271;
  let lng = 79.8612;

  // ✅ Update location every 2 seconds
  setInterval(() => {
    lat += 0.0003;
    lng += 0.0003;

    socket.emit("driverLocationUpdate", { // ✅ Correct event name
      deliveryId: "your-real-deliveryId-here", // ✅ Not driverId! Use real deliveryId here
      lat,
      lng,
    });

    console.log(`📍 Sent location: ${lat}, ${lng}`);
  }, 2000);
});

socket.on("connect_error", (err) => {
  console.error("❌ Connection error:", err.message);
});
