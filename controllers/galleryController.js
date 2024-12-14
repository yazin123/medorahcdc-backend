const Gallery = require('../models/Gallery');
const fs = require('fs').promises;
const path = require('path');

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

exports.createGalleryItem = async (req, res) => {
  try {
    const item = new Gallery({
      title: req.body.title,
      description: req.body.description,
      image: `/uploads/gallery/${req.file.filename}`,
      category: req.body.category
    });
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    console.log("Error creating gallery item:", error);
    res.status(400).json({ error: 'Error creating gallery item' });
  }
};

exports.updateGalleryItem = async (req, res) => {
  try {
    const existingItem = await Gallery.findById(req.params.id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    const updateData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category
    };

    // Handle image update
    if (req.file) {
      // Delete old image file if it exists
      if (existingItem.image) {
        const oldImagePath = path.join(__dirname, '..', 'public', existingItem.image);
        try {
          await fs.unlink(oldImagePath);
        } catch (unlinkError) {
          console.error('Error deleting old image:', unlinkError);
        }
      }

      // Set new image URL
      updateData.image = `/uploads/gallery/${req.file.filename}`;
    }

    const item = await Gallery.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(item);
  } catch (error) {
    console.error('Error updating gallery item:', error);
    res.status(400).json({ error: 'Error updating gallery item' });
  }
};

exports.deleteGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    // Delete image file if it exists
    if (item.image) {
      const imagePath = path.join(__dirname, '..', 'public', item.image);
      try {
        await fs.unlink(imagePath);
      } catch (unlinkError) {
        console.error('Error deleting image:', unlinkError);
      }
    }

    // Delete the database record
    await Gallery.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    res.status(500).json({ error: 'Error deleting gallery item' });
  }
};