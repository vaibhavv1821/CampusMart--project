const express = require("express");
const { getProfile, updateProfile, uploadAvatar } = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const { uploadMiddleware } = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/avatar", protect, uploadMiddleware.single("avatar"), uploadAvatar);

module.exports = router;