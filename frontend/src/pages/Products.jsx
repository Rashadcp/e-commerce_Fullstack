import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { CartContext } from "./CartProvider";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import Footer from "../components/Footer";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { productAPI } from "../services/api";

function Products() {
  const { addToCart, decreaseQuantity, cart, toggleWishlist, wishlist, user } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleAddToCart = (product) => {
    if (!user) {
      toast.info("Please login to add items to cart");
      navigate("/login", { state: { from: location } });
      return;
    }
    addToCart(product);
  };

  const handleToggleWishlist = (product) => {
    if (!user) {
      toast.info("Please login to add items to wishlist");
      navigate("/login", { state: { from: location } });
      return;
    }
    toggleWishlist(product);
  };


  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 12;

  const [sortOption, setSortOption] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch products with backend-driven search and pagination
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getAll({
          page: currentPage,
          limit: productsPerPage,
          search: debouncedSearch,
          category: filterCategory,
          sort: sortOption,
          minPrice: priceRange[0],
          maxPrice: priceRange[1]
        });

        // Ensure we handle both array and paginated response object
        if (res.data.products) {
          setProducts(res.data.products);
          setTotalPages(res.data.totalPages);
          setTotalProducts(res.data.totalProducts);
        } else {
          setProducts(res.data);
          setTotalPages(1);
          setTotalProducts(res.data.length);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, debouncedSearch, sortOption, filterCategory, priceRange]);

  // Reset to page 1 when filters/search/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sortOption, filterCategory, priceRange]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products; // products are already filtered and paginated from backend
  const filteredProducts = products; // Keep this for backward compatibility in the JSX below if any


  return (
    <>
      <div className="min-h-screen bg-black py-20">
        <h1 className="text-4xl text-center text-[#00b2fe] font-extrabold mb-8">
          REFUEL Energy Drinks ⚡
        </h1>

        {/* 🔍 Search Bar */}
        <div className="max-w-2xl mx-auto mb-8 px-4">
          <input
            type="text"
            placeholder="Search for energy drinks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-full bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b2fe]"
          />
        </div>

        {/* 🧠 Loading or Error */}
        {loading ? (
          <div className="text-white text-center text-2xl mt-10">
            Loading products...
          </div>
        ) : error ? (
          <div className="text-red-500 text-center text-2xl mt-10">{error}</div>
        ) : (
          <>

            {/* Sort & Filter */}
            <div className="max-w-7xl mx-auto px-4 mb-8 flex flex-wrap items-center justify-between gap-4 text-white">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <label>Sort By:</label>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 focus:border-[#00b2fe] outline-none"
                  >
                    <option value="">Default</option>
                    <option value="price-asc">Price: Low → High</option>
                    <option value="price-desc">Price: High → Low</option>
                    <option value="name-asc">Name: A → Z</option>
                    <option value="name-desc">Name: Z → A</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <label>Category:</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 focus:border-[#00b2fe] outline-none"
                  >
                    <option value="All">All Categories</option>
                    <option value="Apple">Apple</option>
                    <option value="Mango">Mango</option>
                    <option value="Orange">Orange</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <label>Price Range:</label>
                  <select
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                    className="bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 focus:border-[#00b2fe] outline-none"
                  >
                    <option value="2000">Up to ₹2000</option>
                    <option value="500">Up to ₹500</option>
                    <option value="300">Up to ₹300</option>
                    <option value="200">Up to ₹200</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="max-w-7xl mx-auto grid gap-8 px-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {currentProducts.length > 0 ? (
                currentProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-[#d8e7bf] p-4 rounded-xl shadow hover:shadow-2xl transition-transform duration-300 transform hover:scale-105 flex flex-col"
                  >
                    <div className="overflow-hidden rounded-lg relative">
                      <img
                        src={
                          product.image?.match(/^(http|data:)/)
                            ? product.image
                            : `/${product.image?.replace(/^\/+/, "") || ""}`
                        }
                        alt={product.name}
                        className="h-60 w-full object-cover mb-4 rounded transition-transform duration-300 hover:scale-110"
                      />

                      <button
                        onClick={() => handleToggleWishlist(product)}
                        className={`absolute top-2 right-2 p-2 rounded-full ${wishlist.some((item) => item.id === product.id)
                          ? "bg-pink-500 text-white"
                          : "bg-gray-300 text-gray-700"
                          } hover:bg-pink-400 transition`}
                      >
                        <FaHeart />
                      </button>
                    </div>

                    <h2 className="font-bold text-lg text-gray-900">
                      {product.name}
                    </h2>
                    <p className="font-medium mb-3 text-gray-800">
                      ₹{product.price}
                    </p>

                    <div className="flex gap-2 mt-auto">
                      {cart.find((item) => item.id === product.id) ? (
                        <div className="flex items-center justify-between w-full bg-[#8dc53e] rounded-lg">
                          <button
                            onClick={() => decreaseQuantity(product.id)}
                            className="px-4 py-2 text-white hover:bg-[#76b431] rounded-l-lg transition font-bold"
                          >
                            -
                          </button>
                          <span className="text-white font-bold">
                            {cart.find((item) => item.id === product.id).quantity}
                          </span>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="px-4 py-2 text-white hover:bg-[#76b431] rounded-r-lg transition font-bold"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex-1 bg-[#8dc53e] text-white py-2 rounded-lg hover:bg-[#76b431] transition flex items-center justify-center gap-2"
                        >
                          <FaShoppingCart /> Add
                        </button>
                      )}
                    </div>

                  </div>
                ))
              ) : (
                <p className="text-center text-white text-xl col-span-full">
                  No products found.
                </p>
              )}
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center justify-center mt-10 gap-4">
              <p className="text-white">
                Showing{" "}
                <span className="text-[#8dc53e] font-semibold">
                  {indexOfFirstProduct + 1}
                </span>{" "}
                -{" "}
                <span className="text-[#8dc53e] font-semibold">
                  {Math.min(indexOfLastProduct, totalProducts)}
                </span>{" "}
                of{" "}
                <span className="text-[#8dc53e] font-semibold">
                  {totalProducts}
                </span>{" "}
                products
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="px-4 py-2 bg-[#00b2fe] text-white rounded-lg hover:bg-[#0092d1] disabled:opacity-50"
                  disabled={currentPage === 1}
                >
                  Prev
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-4 py-2 rounded-lg ${currentPage === index + 1
                      ? "bg-[#8dc53e] text-white"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                      }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className="px-4 py-2 bg-[#00b2fe] text-white rounded-lg hover:bg-[#0092d1] disabled:opacity-50"
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}

export default Products;
