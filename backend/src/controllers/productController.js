const Product = require("../models/Product");
const { getAIPrice } = require("../services/aiService");

const createProduct = async (req, res, next) => {
  try {
    const { title, description, price, category, condition, images } = req.body;

    if (!title || !description || !price || !category || !condition) {
      res.status(400);
      throw new Error("Please fill all required fields");
    }

    const { aiPriceMin, aiPriceMax } = await getAIPrice({
      title,
      category,
      condition,
      price,
    });

    const product = await Product.create({
      title,
      description,
      price,
      category,
      condition,
      images: images || [],
      seller: req.user._id,
      aiPriceMin,
      aiPriceMax,
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const { search, category } = req.query;

    let filter = { status: "Available" };

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter)
      .populate("seller", "name college branch year avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

const getSingleProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "name college branch year avatar"
    );

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    product.views += 1;
    await product.save();

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("You are not authorized to delete this product");
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  deleteProduct,
};