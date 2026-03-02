const express = require("express");
const {
  addReview,
  getSellerReviews,
  getProductReviews,
} = require("../controllers/ratingController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", protect, addReview);
router.get("/seller/:sellerId", getSellerReviews);
router.get("/product/:productId", getProductReviews);

module.exports = router;