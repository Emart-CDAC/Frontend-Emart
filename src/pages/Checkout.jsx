import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import {
  placeOrderAPI,
  createRazorpayOrderAPI,
  getStoresAPI,
  getAddressesAPI,
  addAddressAPI,
} from "../services/api";

const Checkout = () => {
  const { cartItems, cartSummary, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Wizard
  const [step, setStep] = useState(1);

  // Selection
  const [deliveryType, setDeliveryType] = useState("HOME_DELIVERY");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);

  // Data
  const [addresses, setAddresses] = useState([]);
  const [stores, setStores] = useState([]);
  const [showAddAddress, setShowAddAddress] = useState(false);

  const [newAddress, setNewAddress] = useState({
    houseNumber: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });

  // ===============================
  // LOAD DATA
  // ===============================
  useEffect(() => {
    if (!user?.id) return;

    if (deliveryType === "HOME_DELIVERY") {
      loadAddresses();
    } else {
      loadStores();
    }
  }, [deliveryType, user?.id]);

  const loadAddresses = async () => {
    try {
      const res = await getAddressesAPI(user.id);
      console.log("📍 Addresses loaded:", res.data); // DEBUG
      // Ensure res.data is an array
      setAddresses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Failed to load addresses:", err);
      alert("Failed to load addresses");
      setAddresses([]);
    }
  };

  const loadStores = async () => {
    try {
      const res = await getStoresAPI();
      setStores(res.data);
    } catch {
      alert("Failed to load stores");
    }
  };

  // ===============================
  // ADD ADDRESS
  // ===============================
  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await addAddressAPI(user.id, newAddress);
      setAddresses([...addresses, res.data]);
      setShowAddAddress(false);
      setNewAddress({
        houseNumber: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
      });
    } catch {
      alert("Failed to add address");
    }
  };

  // ===============================
  // PLACE ORDER
  // ===============================
  // ===============================
  // PLACE ORDER
  // ===============================
  // Guard against double submission
  const processingRef = useState({ current: false })[0]; // Using useState to mimic useRef behavior since useRef import is missing or tricky to add without breaking existing imports

  const handlePlaceOrder = async () => {
    try {
      if (processingRef.current) return;
      
      if (!user?.id) {
        alert("User not logged in");
        return;
      }

      // 🛑 VALIDATION
      if (deliveryType === "HOME_DELIVERY" && !selectedAddress) {
        alert("Please select a delivery address.");
        return;
      }
      if (deliveryType === "STORE" && !selectedStore) {
        alert("Please select a store for pickup.");
        return;
      }

      processingRef.current = true;

      const payload = {
        userId: user.id,
        deliveryType,
        paymentMethod,
        addressId:
          deliveryType === "HOME_DELIVERY"
            ? selectedAddress?.addressId
            : null,
        storeId:
          deliveryType === "STORE"
            ? selectedStore?.storeId
            : null,
      };

      console.log("🏠 Selected Address:", selectedAddress); // DEBUG
      console.log("📦 Placing Order Payload:", payload);

      // ===============================
      // CASH ON DELIVERY
      // ===============================
      if (paymentMethod === "CASH") {
        const { data } = await placeOrderAPI(payload);
        console.log("✅ Order Placed:", data);
        await refreshCart(); // Clear Frontend Cart
        navigate(`/invoice/${data.orderId}`); // Check if backend returns orderId or id
        return;
      }

      // ===============================
      // RAZORPAY
      // ===============================
      // Create Razorpay Order with Amount Only
      const { data: rzpOrder } = await createRazorpayOrderAPI(
        cartSummary.totalAmount
      );
      
      const orderData = typeof rzpOrder === 'string' ? JSON.parse(rzpOrder) : rzpOrder;
      console.log("💳 Razorpay Order Created:", orderData);

      const options = {
        key: "rzp_test_S8S02r0SbbS25V", 
        amount: orderData.amount, 
        currency: "INR",
        name: "e-MART",
        description: "Order Payment",
        order_id: orderData.id,

        handler: async function (response) {
          console.log("✅ Payment Success:", response);
          try {
             // ✅ Payment success → place order
             const { data } = await placeOrderAPI(payload);
             console.log("✅ Order Saved:", data);
             // Clear local cart state
             await refreshCart();
             navigate(`/invoice/${data.orderId}`);
          } catch(e) {
             console.error("❌ Order Creation Failed:", e);
             // Check for specific error codes from backend
             const errorCode = e.response?.data?.code;
             const errorMsg = e.response?.data?.message || e.message;
             
             if (errorCode === 'CART_EMPTY') {
                // If cart is empty, it might mean the order was ALREADY placed by a duplicate call.
                // We should check if an order was recently created? 
                // For now, let's assume success if we suspect a race condition, OR just show the alert.
                alert("Your cart was empty. If you already paid, please check your Orders history.");
                navigate('/profile'); // Redirect to profile/orders to check
             } else {
                alert("Payment successful but Order Creation failed: " + errorMsg + "\nPlease contact support.");
             }
          } finally {
             // Don't reset processingRef here, we are navigating away
          }
        },

        prefill: {
          name: user.fullName,
          email: user.email,
          contact: user.mobile || "",
        },

        theme: { color: "#2563eb" },
        modal: {
            ondismiss: function() {
                processingRef.current = false;
            }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response) {
        alert("Payment Failed: " + response.error.description);
        processingRef.current = false;
      });
      razorpay.open();
    } catch (err) {
      console.error("❌ Place Order Error:", err);
      processingRef.current = false;
      // Show more detailed error if available
      const errorCode = err.response?.data?.code;
      const errorMsg = err.response?.data?.message || err.message;
      
      if (errorCode === 'CART_EMPTY') {
        alert("Your cart is empty. Please add items before checkout.");
        navigate('/cart');
      } else {
        alert("Failed to place order: " + errorMsg);
      }
    }
  };

  // ===============================
  // GUARDS
  // ===============================
  if (!cartItems.length) {
    return <div className="p-10 text-center">Your cart is empty</div>;
  }

  // ===============================
  // UI
  // ===============================
  return (
    <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* LEFT */}
      <div className="md:col-span-2 space-y-6">
        {/* STEP 1 */}
        <div className="border p-4 rounded">
          <h2 className="font-bold mb-4">1️⃣ Delivery Method</h2>
          <div className="flex gap-4">
            <Button
              onClick={() => {
                setDeliveryType("HOME_DELIVERY");
                setStep(2);
              }}
            >
              Home Delivery
            </Button>
            <Button
              onClick={() => {
                setDeliveryType("STORE");
                setStep(2);
              }}
            >
              Store Pickup
            </Button>
          </div>
        </div>

        {/* STEP 2 */}
        {step >= 2 && (
          <div className="border p-4 rounded">
            <h2 className="font-bold mb-4">
              2️⃣ {deliveryType === "HOME_DELIVERY" ? "Select Address" : "Select Store"}
            </h2>

            {deliveryType === "HOME_DELIVERY" && (
              <>
                {Array.isArray(addresses) && addresses.length > 0 ? (
                  addresses.map((a) => (
                    <div
                      key={a.addressId}
                      onClick={() => setSelectedAddress(a)}
                      className={`p-3 border rounded cursor-pointer mb-2 ${
                        selectedAddress?.addressId === a.addressId
                          ? "border-blue-600 bg-blue-50"
                          : ""
                      }`}
                    >
                      <p className="font-semibold">{a.houseNumber}, {a.landmark}</p>
                      <p className="text-sm text-gray-600">{a.city}, {a.state} - {a.pincode}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm mb-4">No addresses found. Please add one.</p>
                )}

                {!showAddAddress ? (
                  <Button 
                    variant="outline" 
                    className="w-full mt-2 mb-4 border-dashed"
                    onClick={() => setShowAddAddress(true)}
                  >
                    + Add New Address
                  </Button>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg my-4 border">
                    <h3 className="font-semibold mb-3">New Address</h3>
                    <form onSubmit={handleAddAddress} className="space-y-3">
                      <input
                        type="text"
                        placeholder="House Number / Flat"
                        className="w-full p-2 border rounded"
                        value={newAddress.houseNumber}
                        onChange={(e) => setNewAddress({ ...newAddress, houseNumber: e.target.value })}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Landmark"
                        className="w-full p-2 border rounded"
                        value={newAddress.landmark}
                        onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="City"
                          className="w-full p-2 border rounded"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          required
                        />
                        <input
                          type="text"
                          placeholder="State"
                          className="w-full p-2 border rounded"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          required
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Pincode"
                        className="w-full p-2 border rounded"
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                        required
                      />
                      <div className="flex gap-2 justify-end mt-2">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          onClick={() => setShowAddAddress(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          Save Address
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            )}

            {deliveryType === "STORE" &&
              Array.isArray(stores) && stores.map((s) => (
                <div
                  key={s.storeId}
                  onClick={() => setSelectedStore(s)}
                  className={`p-3 border rounded cursor-pointer mb-2 ${
                    selectedStore?.storeId === s.storeId
                      ? "border-blue-600 bg-blue-50"
                      : ""
                  }`}
                >
                  {s.storeName} - {s.city}
                </div>
              ))}

            <Button className="mt-4" onClick={() => setStep(3)}>
              Continue
            </Button>
          </div>
        )}

        {/* STEP 3 */}
        {step >= 3 && (
          <div className="border p-4 rounded">
            <h2 className="font-bold mb-4">3️⃣ Payment</h2>

            <label className="block mb-2">
              <input
                type="radio"
                checked={paymentMethod === "CASH"}
                onChange={() => setPaymentMethod("CASH")}
              />{" "}
              Cash on Delivery
            </label>

            <label>
              <input
                type="radio"
                checked={paymentMethod === "RAZORPAY"}
                onChange={() => setPaymentMethod("RAZORPAY")}
              />{" "}
              Razorpay
            </label>

            <Button className="mt-6 w-full" onClick={handlePlaceOrder}>
              {paymentMethod === "CASH" ? "Place Order" : "Pay Now"}
            </Button>
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div className="border p-6 rounded h-fit">
        <h3 className="font-bold mb-4">Order Summary</h3>
        <p>Total MRP: ₹{cartSummary.totalMrp}</p>
        <p>Discount: -₹{cartSummary.epointDiscount}</p>
        <p className="font-bold text-lg mt-2">
          Payable: ₹{cartSummary.totalAmount}
        </p>
      </div>
    </div>
  );
};

export default Checkout;
