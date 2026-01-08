import { useContext } from "react";
import { CartContext } from "./CartProvider";
import { FaShoppingCart, FaTrash } from "react-icons/fa";

function Wishlist() {
  const { wishlist, addToCart, toggleWishlist } = useContext(CartContext);

  if (wishlist.length === 0)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-2xl">
        ❤️ Your wishlist is empty!
      </div>
    );

  return (
    <div className="min-h-screen bg-black py-20 px-6 text-white">
      <h1 className="text-4xl font-bold text-center text-[#00b2fe] mb-10">
        My Wishlist ❤️
      </h1>
      <div className="max-w-6xl mx-auto grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {wishlist.map((item) => (
          <div
            key={item.id || item._id}
            className="bg-[#c2d6aa] p-4 rounded-xl shadow hover:shadow-2xl transition-transform duration-300 transform hover:scale-105 flex flex-col"
          >

            <img
              src={item.image?.startsWith("http") ? item.image : `/${item.image || ""}`}
              alt={item.name}
              className="h-60 w-full object-cover mb-4 rounded-lg"
            />

            <h2 className="text-lg font-bold text-gray-900">{item.name}</h2>
            <p className="text-gray-800 mb-3 font-medium">₹{item.price}</p>

            <div className="flex gap-2 mt-auto">
              <button
                onClick={() => {
                  addToCart(item);
                  toggleWishlist(item); // Remove from wishlist after moving
                }}
                className="flex-1 bg-[#8dc53e] text-white py-2 rounded-lg hover:bg-[#76b431] flex items-center justify-center gap-2"
              >
                <FaShoppingCart /> Move to Cart
              </button>

              <button
                onClick={() => toggleWishlist(item)}
                className="bg-red-500 text-white px-3 rounded-lg hover:bg-red-400 flex items-center justify-center"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Wishlist;
