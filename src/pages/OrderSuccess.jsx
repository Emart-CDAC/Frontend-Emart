import { Link } from "react-router-dom";

const OrderSuccess = () => {
  return (
    <div className="max-w-xl mx-auto text-center py-20">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        ✅ Order Placed Successfully
      </h1>
      <p className="mb-6">Thank you for shopping with E-Mart</p>

      <Link
        to="/orders"
        className="inline-block bg-black text-white px-6 py-2 rounded"
      >
        View Orders
      </Link>
    </div>
  );
};

export default OrderSuccess;
