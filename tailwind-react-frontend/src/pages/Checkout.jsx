// import { useLocation, useNavigate } from 'react-router-dom';
// import { useState, useEffect } from 'react';
// import { confirmCheckout, fetchOrderDetails } from '../services/api';
// import { jwtDecode as jwt_decode } from 'jwt-decode';

// // Function to extract user ID from JWT token
// const getUserIdFromToken = async () => {
//   const token = localStorage.getItem('token');  // Retrieve token from localStorage
//   if (token) {
//     const { default: jwt_decode } = await import('jwt-decode');  // Dynamically import jwt-decode
//     const decoded = jwt_decode(token);  // Decode the token to get the payload
//     return decoded.userId;  // Extract userId from decoded token
//   }
//   return null;  // Return null if no token is found
// };

// export default function Checkout() {
//   const { state } = useLocation();
//   const navigate = useNavigate();
//   const orderId = state?.orderId || '';

//   const [address, setAddress] = useState('');
//   const [phone, setPhone] = useState('');
//   const [city, setCity] = useState('');
//   const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
//   const [orderPrice, setOrderPrice] = useState(0);
//   const [deliveryCharge, setDeliveryCharge] = useState(0);
//   const [confirmedDeliveryId, setConfirmedDeliveryId] = useState(null);
//   const [deliveryConfirmed, setDeliveryConfirmed] = useState(false); 
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   useEffect(() => {
//     const loadOrder = async () => {
//       if (!orderId) return;
//       const res = await fetchOrderDetails(orderId);
//       if (res?.totalPrice) {
//         setOrderPrice(res.totalPrice);
//       }
//     };
//     loadOrder();
//   }, [orderId]);

//   useEffect(() => {
//     if (city.toLowerCase() === 'kandy') {
//       setDeliveryCharge(200);
//     } else if (city.toLowerCase() === 'colombo') {
//       setDeliveryCharge(500);
//     } else {
//       setDeliveryCharge(0);
//     }
//   }, [city]);

//   const totalAmount = orderPrice + deliveryCharge;

//   const handleSubmit = async () => {
//     if (!orderId) {
//       alert('Order ID missing. Please return and confirm your order.');
//       return;
//     }

//     setIsSubmitting(true);

//     const res = await confirmCheckout({ orderId, address, phone, paymentMethod });

//     setIsSubmitting(false);

//     if (res?.delivery?._id) {
//       setConfirmedDeliveryId(res.delivery._id); // Set delivery ID
//       setDeliveryConfirmed(true); // Set flag to show "Track your order" button
//       alert('✅ Delivery confirmed!');
//     } else {
//       alert('❌ Failed: ' + (res.message || 'Unknown error'));
//     }
//   };

//   // const handleTrackOrder = () => {
//   //   if (confirmedDeliveryId) {
//   //     navigate(`/track/${confirmedDeliveryId}`); // Redirect to /track/:deliveryId
//   //   } else {
//   //     alert('No delivery assigned yet.');
//   //   }
//   // };

//   const handlePayNow = async () => {
//     const userId = getUserIdFromToken(); // Fetch user ID from JWT token
//     if (!userId) {
//       alert('Please log in first.');
//       return;
//     }

//    // const payload = JSON.parse(atob(token.split('.')[1]));
//     //const userId = payload?.userId;

//     if (!userId || !orderId || !totalAmount) {
//       alert('Missing user or order info.');
//       return;
//     }

//     const paymentData = {
//       orderId,
//       userId,
//       amount: totalAmount,
//     };

//     const response = await fetch("http://localhost:5004/api/payments/test-checkout", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(paymentData),
//     });

//     const data = await response.json();

//     if (data.url) {
//       window.location.href = data.url; // Redirect to Stripe Checkout page
//     } else {
//       alert('Payment initiation failed. Please try again later.');
//     }
//   };

//   return (
//     <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-32">
//       <h1 className="text-2xl font-bold text-gray-800 mb-4">Checkout for Order #{orderId}</h1>

//       <input
//         className="border p-3 w-full mb-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//         placeholder="Delivery Address"
//         value={address}
//         onChange={(e) => setAddress(e.target.value)}
//       />

//       <input
//         className="border p-3 w-full mb-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//         placeholder="City (Kandy/Colombo)"
//         value={city}
//         onChange={(e) => setCity(e.target.value)}
//       />

//       <input
//         className="border p-3 w-full mb-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//         placeholder="Contact Number"
//         value={phone}
//         onChange={(e) => setPhone(e.target.value)}
//       />

//       <div className="mb-4">
//         <label className="block mb-1 font-semibold text-gray-700">Payment Method:</label>
//         <select
//           className="border p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//           value={paymentMethod}
//           onChange={(e) => setPaymentMethod(e.target.value)}
//         >
//           <option value="Cash on Delivery">Cash on Delivery</option>
//           <option value="Card">Card</option>
//         </select>
//       </div>

//       <div className="bg-gray-100 p-6 rounded-lg mb-6 shadow-md">
//         <p className="text-sm text-gray-600">🛒 Order Price: <strong>LKR {orderPrice}</strong></p>
//         <p className="text-sm text-gray-600">🚚 Delivery Charge: <strong>LKR {deliveryCharge}</strong></p>
//         <p className="mt-2 text-lg font-bold text-blue-700">
//           Total Amount: LKR {totalAmount}
//         </p>
//       </div>

//       {!deliveryConfirmed ? (
//         <button
//           onClick={handleSubmit}
//           disabled={isSubmitting}
//           className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold focus:outline-none hover:bg-blue-700"
//         >
//           {isSubmitting ? 'Confirming...' : 'Confirm Delivery'}
//         </button>
//       ) : (
//         <div className="flex flex-col items-center space-y-4">
//           <p className="text-green-600 font-semibold">Delivery confirmed successfully!</p>
//           {/* <button
//             onClick={handleTrackOrder}
//             className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
//           >
//             🚚 Track Your Order
//           </button> */}
//           <button
//             onClick={handlePayNow}
//             className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg"
//           >
//             💳 Pay Now
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { confirmCheckout, fetchOrderDetails } from '../services/api';
import { jwtDecode } from 'jwt-decode';

// Extract user ID from JWT token
const getUserIdFromToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    const decoded = jwtDecode(token);
    return decoded.id || decoded.userId || decoded._id || null;
  }
  return null;
};

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const orderId = state?.orderId || '';

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [orderPrice, setOrderPrice] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [confirmedDeliveryId, setConfirmedDeliveryId] = useState(null);
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // Restore delivery ID if user refreshed the page
  useEffect(() => {
    const saved = localStorage.getItem('pendingDeliveryId');
    if (saved) {
      setConfirmedDeliveryId(saved);
      setDeliveryConfirmed(true);
    }
  }, []);

  // Load order price
  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return;
      const res = await fetchOrderDetails(orderId);
      if (res?.totalPrice) {
        setOrderPrice(res.totalPrice);
      }
    };
    loadOrder();
  }, [orderId]);

  // Calculate delivery charge based on city
  useEffect(() => {
    if (city.toLowerCase() === 'kandy') {
      setDeliveryCharge(200);
    } else if (city.toLowerCase() === 'colombo') {
      setDeliveryCharge(500);
    } else {
      setDeliveryCharge(0);
    }
  }, [city]);

  const totalAmount = orderPrice + deliveryCharge;

  // Step 1: Confirm delivery details → creates delivery in DB
  const handleSubmit = async () => {
    if (!orderId) {
      alert('Order ID missing. Please return and confirm your order.');
      return;
    }

    if (!address || !phone) {
      alert('Please fill in your address and phone number.');
      return;
    }

    setIsSubmitting(true);

    const res = await confirmCheckout({ orderId, address, phone, paymentMethod });

    setIsSubmitting(false);

    if (res?.delivery?._id) {
      const deliveryId = res.delivery._id;
      setConfirmedDeliveryId(deliveryId);
      setDeliveryConfirmed(true);
      localStorage.setItem('pendingDeliveryId', deliveryId); // ✅ persist in case of refresh
      alert('✅ Delivery confirmed!');
    } else {
      alert('❌ Failed: ' + (res?.message || 'Unknown error'));
    }
  };

  // Step 2: Pay via Stripe — sends deliveryId in payload
  const handlePayNow = async () => {
    const userId = getUserIdFromToken();

    if (!userId) {
      alert('Please log in first.');
      return;
    }

    if (!orderId || !totalAmount) {
      alert('Missing order info.');
      return;
    }

    if (!confirmedDeliveryId) {
      alert('Please confirm your delivery details first before paying.');
      return;
    }

    setIsPaying(true);

    const paymentData = {
      orderId,
      userId,
      amount: totalAmount,
      deliveryId: confirmedDeliveryId, // ✅ pass deliveryId to payment service
    };

    try {
      const response = await fetch("http://localhost:5004/api/payments/test-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (data.url) {
        localStorage.removeItem('pendingDeliveryId'); // ✅ clear after redirect
        window.location.href = data.url;
      } else {
        alert('Payment initiation failed. Please try again.');
        setIsPaying(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('Something went wrong. Please try again.');
      setIsPaying(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-32">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Checkout for Order #{orderId}
      </h1>

      <input
        className="border p-3 w-full mb-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Delivery Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        disabled={deliveryConfirmed}
      />

      <input
        className="border p-3 w-full mb-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="City (Kandy/Colombo)"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        disabled={deliveryConfirmed}
      />

      <input
        className="border p-3 w-full mb-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Contact Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        disabled={deliveryConfirmed}
      />

      <div className="mb-4">
        <label className="block mb-1 font-semibold text-gray-700">Payment Method:</label>
        <select
          className="border p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          disabled={deliveryConfirmed}
        >
          <option value="Cash on Delivery">Cash on Delivery</option>
          <option value="Card">Card</option>
        </select>
      </div>

      <div className="bg-gray-100 p-6 rounded-lg mb-6 shadow-md">
        <p className="text-sm text-gray-600">
          🛒 Order Price: <strong>LKR {orderPrice}</strong>
        </p>
        <p className="text-sm text-gray-600">
          🚚 Delivery Charge: <strong>LKR {deliveryCharge}</strong>
        </p>
        <p className="mt-2 text-lg font-bold text-blue-700">
          Total Amount: LKR {totalAmount}
        </p>
      </div>

      {!deliveryConfirmed ? (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold focus:outline-none hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Confirming...' : 'Confirm Delivery'}
        </button>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <p className="text-green-600 font-semibold">✅ Delivery confirmed successfully!</p>
          <button
            onClick={handlePayNow}
            disabled={isPaying}
            className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-lg font-semibold"
          >
            {isPaying ? 'Redirecting to payment...' : '💳 Pay Now'}
          </button>
        </div>
      )}
    </div>
  );
}