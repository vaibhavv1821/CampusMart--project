const Rating = require("../models/Rating");
const User = require("../models/User");
const Product = require("../models/Product");

const updateSellerAverageRating = async (sellerId) => {
  const ratings = await Rating.find({ seller: sellerId });

  if (ratings.length === 0) {
    await User.findByIdAndUpdate(sellerId, {
      averageRating: 0,
      totalRatings: 0,
    });
    return;
  }

  const total = ratings.reduce((sum, r) => sum + r.rating, 0);
  const average = (total / ratings.length).toFixed(1);

  await User.findByIdAndUpdate(sellerId, {
    averageRating: parseFloat(average),
    totalRatings: ratings.length,
  });
};

const addReview = async (req, res, next) => {
  try {
    const { sellerId, productId, rating, review } = req.body;

    if (!sellerId || !productId || !rating) {
      res.status(400);
      throw new Error("sellerId, productId and rating are required");
    }

    if (req.user._id.toString() === sellerId.toString()) {
      res.status(400);
      throw new Error("You cannot review yourself");
    }

    const seller = await User.findById(sellerId);
    if (!seller) {
      res.status(404);
      throw new Error("Seller not found");
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    const existingReview = await Rating.findOne({
      user: req.user._id,
      product: productId,
    });

    if (existingReview) {
      res.status(400);
      throw new Error("You have already reviewed this product");
    }

    const newRating = await Rating.create({
      user: req.user._id,
      seller: sellerId,
      product: productId,
      rating,
      review: review || "",
    });

    await updateSellerAverageRating(sellerId);

    res.status(201).json({
      success: true,
      rating: newRating,
    });
  } catch (error) {
    next(error);
  }
};

const getSellerReviews = async (req, res, next) => {
  try {
    const { sellerId } = req.params;

    const seller = await User.findById(sellerId);
    if (!seller) {
      res.status(404);
      throw new Error("Seller not found");
    }

    const reviews = await Rating.find({ seller: sellerId })
      .populate("user", "name avatar college")
      .populate("product", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating: seller.averageRating,
      totalRatings: seller.totalRatings,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    const reviews = await Rating.find({ product: productId })
      .populate("user", "name avatar college")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addReview,
  getSellerReviews,
  getProductReviews,
};