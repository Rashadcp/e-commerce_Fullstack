import { useContext } from "react";
import { CartContext } from "../pages/CartProvider";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
function Cart() {
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();

  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // login check
  const handleProceedToPayment = () => {
    const loggedUser = localStorage.getItem("user");
    if (!loggedUser) {
      toast.info("Login required to buy");
      navigate("/login");
      return;
    }
    navigate("/address", { state: { totalAmount } });
  };
  // cart empty

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <h2 className="text-3xl font-bold mb-4">No products added yet 🛒</h2>
        <p className="text-lg text-gray-400">
          Your cart is empty — add some items to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-10">
      <h1 className="text-white text-3xl text-center font-bold mb-10 py-20">
        Your Cart
      </h1>

      <div className="max-w-5xl mx-auto grid gap-6">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between bg-[#c2d6aa] p-4 rounded"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.image?.startsWith("http") ? item.image : `/${item.image || ""}`}
                alt={item.name}
                className="w-20 h-20 object-cover rounded"
              />

              <div>
                <h2 className="font-semibold text-lg">{item.name}</h2>
                <p>
                  ₹{item.price.toFixed(2)} x {item.quantity}
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => addToCart(item, 1)}
                    className="bg-green-500 px-2 py-1 text-white rounded hover:bg-green-600"
                  >
                    +
                  </button>
                  <button
                    onClick={() => decreaseQuantity(item.id)}
                    className="bg-red-500 px-2 py-1 text-white rounded hover:bg-red-600"
                  >
                    -
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => removeFromCart(item.id)}
              className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-white"
            >
              Remove
            </button>
          </div>
        ))}

        <div className="text-right mt-6">
          <h2 className="text-white text-2xl mb-4">
            Total: ₹{totalAmount.toFixed(2)}
          </h2>
          <button
            onClick={handleProceedToPayment}
            className="bg-[#00b2fe] px-6 py-3 rounded hover:bg-[#0090d1] text-white transition"
          >
            Proceed to Payment 💳
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
