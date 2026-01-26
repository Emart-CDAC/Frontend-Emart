import { Link } from "react-router-dom";

const OrderSuccess = () => {
  return (
    <div className="max-w-3xl mx-auto py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">🎉 Order Placed Successfully</h1>
      <p className="text-gray-600 mb-6">
        Thank you for shopping with e-MART.
      </p>

      <div className="flex justify-center gap-4">
        <Link to="/" className="px-4 py-2 bg-black text-white rounded">
          Go to Home
        </Link>

        <Link to="/orders" className="px-4 py-2 border rounded">
          View Orders
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
