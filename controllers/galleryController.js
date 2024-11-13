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


exports.createGalleryItem = async (req, res) => {
    try {
        console.log("creting gallery ==========", req.body)
        console.log("creting gallery  file==========", req.file)
        const item = new Gallery({
            title: req.body.title,
            description: req.body.description,
            image: req.file ? req.file.filename : null,
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
        const item = await Gallery.findByIdAndUpdate(
            req.params.id,
            {
                title: req.body.title,
                description: req.body.description,
                image: req.file ? req.file.filename : req.body.image,
                category: req.body.category
            },
            { new: true }
        );
        if (!item) {
            return res.status(404).json({ error: 'Gallery item not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(400).json({ error: 'Error updating gallery item' });
    }
};

exports.deleteGalleryItem = async (req, res) => {
    try {
        const item = await Gallery.findByIdAndDelete(req.params.id);
        if (!item) {
            return res.status(404).json({ error: 'Gallery item not found' });
        }
        res.json({ message: 'Gallery item deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting gallery item' });
    }
};