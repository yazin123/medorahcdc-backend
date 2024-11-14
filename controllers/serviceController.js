// controllers/serviceController.js
const Service = require('../models/Service');
const fs = require('fs').promises;
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const serviceController = {

  getAllServices: async (req, res) => {
    try {
      const services = await Service.find().sort('createdAt');
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching services' });
    }
  },

  getServiceById: async (req, res) => {
    try {
      const service = await Service.findById(req.params.id);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching service' });
    }
  },

  createService: async (req, res) => {
    try {
      let imageUrl = null;
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        imageUrl = result.secure_url;
      }

      const service = new Service({
        title: req.body.title,
        description: req.body.description,
        howitworks: req.body.howitworks,
        whatisService: req.body.whatisService,
        handledBy: req.body.handledBy,
        imageUrl
      });

      await service.save();
      res.status(201).json(service);
    } catch (error) {
      console.log("cant create service", error)
      res.status(400).json({ error: 'Error creating service' });
    }
  },

  updateService: async (req, res) => {
    try {
      console.log("update initiated")
      const service = await Service.findById(req.params.id);

      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      const updates = {};
      if (req.body.title) updates.title = req.body.title;
      if (req.body.description) updates.description = req.body.description;
      if (req.body.howitworks) updates.howitworks = req.body.howitworks;
      if (req.body.whatisService) updates.whatisService = req.body.whatisService;

      // Parse handledBy from JSON string
      if (req.body.handledBy) {
        try {
          updates.handledBy = JSON.parse(req.body.handledBy);
        } catch (e) {
          console.error('Error parsing handledBy:', e);
          updates.handledBy = Array.isArray(req.body.handledBy)
            ? req.body.handledBy
            : [req.body.handledBy];
        }
      }

      // Handle image update
      if (req.file) {
        try {
          // Delete old image from Cloudinary if it exists
          if (service.imageUrl) {
            const publicId = service.imageUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
          }

          const result = await cloudinary.uploader.upload(req.file.path);
          updates.imageUrl = result.secure_url;

          // Clean up uploaded file
          await fs.unlink(req.file.path);
        } catch (error) {
          console.error('Error handling image:', error);
          return res.status(400).json({ error: 'Error processing image' });
        }
      }

      const updatedService = await Service.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      res.json(updatedService);
    } catch (error) {
      console.error('Service update error:', error);
      res.status(400).json({ error: error.message || 'Error updating service' });
    }
  },

  deleteService: async (req, res) => {
    try {
      const service = await Service.findByIdAndDelete(req.params.id);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      // Delete the image from Cloudinary if it exists
      if (service.imageUrl) {
        await cloudinary.uploader.destroy(
          path.basename(service.imageUrl, path.extname(service.imageUrl))
        );
      }

      res.json({ message: 'Service deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting service' });
    }
  },
}

module.exports = serviceController