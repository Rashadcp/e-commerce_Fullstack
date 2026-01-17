import Product from "../models/product.js";

// @desc    Get all products
// @route   GET /products
export const getProducts = async (req, res) => {
    try {
        const { page = 1, limit = 12, search = "", category = "", sort = "", minPrice, maxPrice } = req.query;

        const query = {};
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }
        if (category && category !== "All") {
            query.category = category;
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            query.price = {};
            if (minPrice !== undefined && minPrice !== "") query.price.$gte = Number(minPrice);
            if (maxPrice !== undefined && maxPrice !== "") query.price.$lte = Number(maxPrice);
            // If the object is empty, remove it
            if (Object.keys(query.price).length === 0) delete query.price;
        }

        let sortOptions = {};
        if (sort === "price-asc") sortOptions.price = 1;
        else if (sort === "price-desc") sortOptions.price = -1;
        else if (sort === "name-asc") sortOptions.name = 1;
        else if (sort === "name-desc") sortOptions.name = -1;
        else sortOptions._id = -1; // Default sort by ID if createdAt is missing

        const products = await Product.find(query)
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Product.countDocuments(query);

        res.json({
            products,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            totalProducts: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /products
export const createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /products/:id
export const updateProduct = async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /products/:id
export const deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
