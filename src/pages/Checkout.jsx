import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import CheckoutSteps from "../components/CheckoutSteps";
import { MapPin, Store, CreditCard, Banknote, ShieldCheck, Truck, Home } from 'lucide-react';
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
      // alert("Failed to load addresses"); // Silent fail for UI cleanliness, retry logic maybe better
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
  // Guard against double submission
  const processingRef = useState({ current: false })[0]; 

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
                alert("Your cart was empty. If you already paid, please check your Orders history.");
                navigate('/orders'); 
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
    return <div className="p-10 text-center text-gray-500">Your cart is empty</div>;
  }

  // ===============================
  // UI
  // ===============================
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <CheckoutSteps currentStep={2} />
      
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT SECTIONS */}
        <div className="lg:col-span-2 space-y-6">
            
          {/* STEP 1: DELIVERY METHOD */}
          <div className={`bg-white p-6 rounded-2xl border transition-all duration-300 ${step === 1 ? 'shadow-md border-blue-200 ring-1 ring-blue-100' : 'border-gray-100 opacity-60'}`}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                    Delivery Method
                </h2>
                {step > 1 && (
                    <button onClick={() => setStep(1)} className="text-sm text-blue-600 font-medium hover:underline">Change</button>
                )}
            </div>

            {step === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setDeliveryType("HOME_DELIVERY");
                      setStep(2);
                    }}
                    className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all hover:border-blue-300 hover:bg-blue-50 ${deliveryType === 'HOME_DELIVERY' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-200'}`}
                  >
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                        <Truck className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                        <div className="font-bold text-gray-900">Home Delivery</div>
                        <div className="text-sm text-gray-500">Get it delivered to your door</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setDeliveryType("STORE");
                      setStep(2);
                    }}
                    className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all hover:border-blue-300 hover:bg-blue-50 ${deliveryType === 'STORE' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-200'}`}
                  >
                    <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                        <Store className="w-6 h-6" />
                    </div>
                     <div className="text-left">
                        <div className="font-bold text-gray-900">Store Pickup</div>
                        <div className="text-sm text-gray-500">Collect from a nearby store</div>
                    </div>
                  </button>
                </div>
            )}
             {step > 1 && (
                <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {deliveryType === 'HOME_DELIVERY' ? <Truck className="w-4 h-4"/> : <Store className="w-4 h-4"/>}
                    <span className="font-medium">{deliveryType === 'HOME_DELIVERY' ? 'Home Delivery' : 'Store Pickup'}</span>
                </div>
            )}
          </div>

          {/* STEP 2: ADDRESS / STORE SELECTION */}
          <div className={`bg-white p-6 rounded-2xl border transition-all duration-300 ${step === 2 ? 'shadow-md border-blue-200 ring-1 ring-blue-100' : 'border-gray-100 opacity-60'}`}>
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                    {deliveryType === "HOME_DELIVERY" ? "Select Address" : "Select Store"}
                </h2>
                 {step > 2 && (
                    <button onClick={() => setStep(2)} className="text-sm text-blue-600 font-medium hover:underline">Change</button>
                )}
            </div>

            {step === 2 && (
                <div className="space-y-4">
                    {deliveryType === "HOME_DELIVERY" && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.isArray(addresses) && addresses.map((a) => (
                            <div
                            key={a.addressId}
                            onClick={() => setSelectedAddress(a)}
                            className={`p-4 border-2 rounded-xl cursor-pointer relative transition-all ${
                                selectedAddress?.addressId === a.addressId
                                ? "border-blue-600 bg-blue-50/30 shadow-sm"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            >
                                <div className="flex items-start gap-3">
                                    <MapPin className={`w-5 h-5 mt-0.5 ${selectedAddress?.addressId === a.addressId ? 'text-blue-600' : 'text-gray-400'}`} />
                                    <div>
                                        <p className="font-bold text-gray-900">{a.houseNumber}, {a.landmark}</p>
                                        <p className="text-sm text-gray-600 mt-1">{a.city}, {a.state} - {a.pincode}</p>
                                    </div>
                                </div>
                                {selectedAddress?.addressId === a.addressId && (
                                    <div className="absolute top-4 right-4 text-blue-600">
                                        <div className="w-3 h-3 bg-blue-600 rounded-full ring-2 ring-blue-200" />
                                    </div>
                                )}
                            </div>
                        ))}
                        </div>

                        {addresses.length === 0 && !showAddAddress && (
                             <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500 mb-2">No addresses saved yet</p>
                            </div>
                        )}

                        {!showAddAddress ? (
                        <button 
                            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                            onClick={() => setShowAddAddress(true)}
                        >
                            <span className="text-xl">+</span> Add New Address
                        </button>
                        ) : (
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-4 duration-300">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Home className="w-5 h-5" /> Add New Address
                            </h3>
                            <form onSubmit={handleAddAddress} className="space-y-4">
                            <input
                                type="text"
                                placeholder="House Number / Flat"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                value={newAddress.houseNumber}
                                onChange={(e) => setNewAddress({ ...newAddress, houseNumber: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Landmark"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                value={newAddress.landmark}
                                onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                type="text"
                                placeholder="City"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                value={newAddress.city}
                                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                required
                                />
                                <input
                                type="text"
                                placeholder="State"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                value={newAddress.state}
                                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                required
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Pincode"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                value={newAddress.pincode}
                                onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                                required
                            />
                            <div className="flex gap-3 justify-end pt-2">
                                <Button 
                                type="button" 
                                variant="ghost" 
                                className="text-gray-500 hover:text-gray-800"
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
                        <Button className="w-full mt-4 py-3 text-lg" disabled={!selectedAddress} onClick={() => setStep(3)}>
                            Continue with Selected Address
                        </Button>
                    </>
                    )}

                    {deliveryType === "STORE" && (
                    <>
                        <div className="grid grid-cols-1 gap-3">
                            {Array.isArray(stores) && stores.map((s) => (
                                <div
                                key={s.storeId}
                                onClick={() => setSelectedStore(s)}
                                className={`p-4 border-2 rounded-xl cursor-pointer flex justify-between items-center transition-all ${
                                    selectedStore?.storeId === s.storeId
                                    ? "border-blue-600 bg-blue-50/30 shadow-sm"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Store className={`w-5 h-5 ${selectedStore?.storeId === s.storeId ? 'text-blue-600' : 'text-gray-400'}`} />
                                        <div>
                                            <div className="font-bold text-gray-900">{s.storeName}</div>
                                            <div className="text-sm text-gray-500">{s.city}</div>
                                        </div>
                                    </div>
                                    {selectedStore?.storeId === s.storeId && (
                                         <div className="w-3 h-3 bg-blue-600 rounded-full ring-2 ring-blue-200" />
                                    )}
                                </div>
                            ))}
                        </div>
                         <Button className="w-full mt-4 py-3 text-lg" disabled={!selectedStore} onClick={() => setStep(3)}>
                            Continue with Selected Store
                        </Button>
                    </>
                    )}
                </div>
            )}
             {step > 2 && (
                 <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg">
                     <MapPin className="w-4 h-4"/>
                     <span className="font-medium">
                         {deliveryType === 'HOME_DELIVERY' 
                            ? `${selectedAddress?.houseNumber}, ${selectedAddress?.city}` 
                            : `${selectedStore?.storeName}, ${selectedStore?.city}`
                         }
                     </span>
                 </div>
            )}
          </div>

          {/* STEP 3: PAYMENT */}
          <div className={`bg-white p-6 rounded-2xl border transition-all duration-300 ${step === 3 ? 'shadow-md border-blue-200 ring-1 ring-blue-100' : 'border-gray-100 opacity-60'}`}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                Payment Method
            </h2>

             {step === 3 && (
                <div className="space-y-4">
                    <label className={`block relative p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'CASH' ? 'border-blue-600 bg-blue-50/20' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className="flex items-center gap-4">
                            <input
                                type="radio"
                                className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                                checked={paymentMethod === "CASH"}
                                onChange={() => setPaymentMethod("CASH")}
                            />
                            <div className="bg-green-100 p-2 rounded-lg text-green-700">
                                <Banknote className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="block font-bold text-gray-900">Cash on Delivery</span>
                                <span className="text-sm text-gray-500">Pay when you receive your order</span>
                            </div>
                        </div>
                    </label>

                    <label className={`block relative p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'RAZORPAY' ? 'border-blue-600 bg-blue-50/20' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className="flex items-center gap-4">
                            <input
                                type="radio"
                                className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                                checked={paymentMethod === "RAZORPAY"}
                                onChange={() => setPaymentMethod("RAZORPAY")}
                            />
                             <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="block font-bold text-gray-900">Online Payment (Razorpay)</span>
                                <span className="text-sm text-gray-500">Pay securely with Credit/Debit Card, UPI</span>
                            </div>
                        </div>
                    </label>

                    <Button 
                        className="w-full mt-8 py-4 text-lg shadow-xl shadow-blue-100 hover:shadow-blue-200" 
                        onClick={handlePlaceOrder}
                    >
                        {paymentMethod === "CASH" ? "Place Order" : "Pay Now"}
                    </Button>
                </div>
             )}
          </div>
        </div>

        {/* RIGHT: SUMMARY SIDEBAR */}
        <div className="h-fit">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    Order Summary
                </h3>
                 <div className="space-y-4 text-gray-600">
                    <div className="flex justify-between">
                        <span>Items Total</span>
                        <span className="font-medium text-gray-900">₹{cartSummary.totalMrp}</span>
                    </div>
                    {cartSummary.epointDiscount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Discount</span>
                            <span className="font-bold">- ₹{cartSummary.epointDiscount}</span>
                        </div>
                     )}
                    {cartSummary.platformFee > 0 && (
                         <div className="flex justify-between">
                            <span>Platform Fee</span>
                            <span className="font-medium text-gray-900">₹{cartSummary.platformFee}</span>
                        </div>
                    )}
                    <div className="h-px bg-gray-200 my-2"></div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-lg font-bold text-gray-800">Total Payable</span>
                        <span className="text-2xl font-bold text-blue-600">₹{cartSummary.totalAmount}</span>
                    </div>
                 </div>

                 <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Secure Checkout</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
