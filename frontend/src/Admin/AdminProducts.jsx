import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: "",
    category: "",
  });
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  const categories = [
    "Apple",
    "Mango",
    "Banana",
    "Grapes",
    "Orange",
    "Pineapple",
  ];

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/products");
      // Handle both array (old) and paginated object (new)
      if (response.data.products) {
        setProducts(response.data.products);
      } else {
        setProducts(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
      setLoading(false);
    }
  };

  // Add new product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/products", {
        ...newProduct,
        price: Number(newProduct.price),
      });
      fetchProducts();
      setNewProduct({ name: "", price: "", image: "", category: "" });
      toast.success("Product added successfully");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    }
  };

  // Update product
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/products/${editingProduct.id}`,
        {
          ...editingProduct,
          price: Number(editingProduct.price),
        }
      );
      setEditingProduct(null);
      fetchProducts();
      toast.success("Product updated successfully");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await axios.delete(`http://localhost:5000/products/${id}`);
      fetchProducts();
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  // Filtered products based on search
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.category?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (loading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Products</h2>

      {/* Add Product Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4">Add New Product</h3>
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              placeholder="Price"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
              className="border p-2 rounded"
              required
            />
            <select
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct({ ...newProduct, category: e.target.value })
              }
              className="border p-2 rounded"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Image URL"
              value={newProduct.image}
              onChange={(e) =>
                setNewProduct({ ...newProduct, image: e.target.value })
              }
              className="border p-2 rounded"
              required
            />
          </div>
          {newProduct.image && (
            <div className="flex items-center mt-2">
              <img
                src={
                  newProduct.image.startsWith("http")
                    ? newProduct.image
                    : `/${newProduct.image}`
                }
                alt="preview"
                className="h-16 w-16 object-cover rounded"
              />
            </div>
          )}
          <button
            type="submit"
            className="bg-[#8dc53e] text-white px-4 py-2 rounded hover:bg-[#76b431]"
          >
            Add Product
          </button>
        </form>
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search by name or category..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="border p-2 rounded w-full md:w-1/3"
        />
      </div>

      {/* Products List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentProducts.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4">
                  <img
                    src={
                      product.image?.startsWith("http")
                        ? product.image
                        : `/${product.image || ""}`
                    }
                    alt={product.name}
                    className="h-12 w-12 object-cover rounded"
                  />
                </td>

                {/* Product Name */}
                <td className="px-6 py-4">
                  {editingProduct?.id === product.id ? (
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          name: e.target.value,
                        })
                      }
                      className="border p-1 rounded"
                    />
                  ) : (
                    product.name
                  )}
                </td>

                {/* Category */}
                <td className="px-6 py-4">
                  {editingProduct?.id === product.id ? (
                    <select
                      value={editingProduct.category}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          category: e.target.value,
                        })
                      }
                      className="border p-1 rounded"
                    >
                      <option value="">Select</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  ) : (
                    product.category || "-"
                  )}
                </td>

                {/* Price */}
                <td className="px-6 py-4">
                  {editingProduct?.id === product.id ? (
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          price: e.target.value,
                        })
                      }
                      className="border p-1 rounded w-24"
                    />
                  ) : (
                    `₹${product.price}`
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  {editingProduct?.id === product.id ? (
                    <div className="space-x-2">
                      <button
                        onClick={handleUpdateProduct}
                        className="text-green-600 hover:text-green-900"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingProduct(null)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="space-x-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 space-x-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${currentPage === i + 1
                ? "bg-[#8dc53e] text-white"
                : "bg-gray-200 hover:bg-gray-300"
              }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default AdminProducts;
