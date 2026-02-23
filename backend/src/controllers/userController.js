const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, college, branch, year } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, college, branch, year },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error("Please upload an image file");
    }

    const user = await User.findById(req.user.id);

    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId);
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "campusmart/avatars",
      width: 300,
      crop: "scale",
    });

    fs.unlinkSync(req.file.path);

    user.avatar = result.secure_url;
    user.avatarPublicId = result.public_id;
    await user.save();

    res.status(200).json({
      success: true,
      avatar: result.secure_url,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

module.exports = { getProfile, updateProfile, uploadAvatar };