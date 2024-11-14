// controllers/galleryController.js
const Gallery = require('../models/Gallery');

exports.getAllGalleryItems = async (req, res) => {
  try {
    const gallery = await Gallery.find().sort('-createdAt');
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching gallery items' });
  }
};

exports.getGalleryItemById = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching gallery item' });
  }
};

const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});



exports.createGalleryItem = async (req, res) => {
  try {
    const uploadedImage = await cloudinary.uploader.upload(req.file.path);
    const item = new Gallery({
      title: req.body.title,
      description: req.body.description,
      image: uploadedImage.secure_url,
      cloudinaryId: uploadedImage.public_id,
      category: req.body.category
    });
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    console.log("error :", error)
    res.status(400).json({ error: 'Error creating gallery item' });
  }
};

exports.updateGalleryItem = async (req, res) => {
  try {
    const existingItem = await Gallery.findById(req.params.id);
    if (req.file) {
      await cloudinary.uploader.destroy(existingItem.cloudinaryId);
      const uploadedImage = await cloudinary.uploader.upload(req.file.path);
      const item = await Gallery.findByIdAndUpdate(
        req.params.id,
        {
          title: req.body.title,
          description: req.body.description,
          image: uploadedImage.secure_url,
          cloudinaryId: uploadedImage.public_id,
          category: req.body.category
        },
        { new: true }
      );
      if (!item) {
        return res.status(404).json({ error: 'Gallery item not found' });
      }
      res.json(item);
    } else {
      const item = await Gallery.findByIdAndUpdate(
        req.params.id,
        {
          title: req.body.title,
          description: req.body.description,
          category: req.body.category
        },
        { new: true }
      );
      if (!item) {
        return res.status(404).json({ error: 'Gallery item not found' });
      }
      res.json(item);
    }
  } catch (error) {
    res.status(400).json({ error: 'Error updating gallery item' });
  }
};

exports.deleteGalleryItem = async (req, res) => {
  try {
    console.log("deleting gallery with id", req.params.id)
    const item = await Gallery.findById(req.params.id);
    await cloudinary.uploader.destroy(item.cloudinaryId);
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    console.log("error deleting", error)
    res.status(500).json({ error: 'Error deleting gallery item' });
  }
};