const Service = require('../models/Service');
const fs = require('fs').promises;
const path = require('path');

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
        // Use local file path for image
        imageUrl = `/uploads/services/${req.file.filename}`;
      }

      const service = new Service({
        title: req.body.title,
        description: req.body.description,
        howitworks: req.body.howitworks,
        whatisService: req.body.whatisService,
        whatToExpect: req.body.whatToExpect,
        signs: req.body.signs,
        handledBy: req.body.handledBy,
        imageUrl
      });

      await service.save();
      res.status(201).json(service);
    } catch (error) {
      console.log("Can't create service", error);
      res.status(400).json({ error: 'Error creating service' });
    }
  },

  updateService: async (req, res) => {
    try {
      console.log("Update initiated");
      const service = await Service.findById(req.params.id);

      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      const updates = {};
      if (req.body.title) updates.title = req.body.title;
      if (req.body.description) updates.description = req.body.description;
      if (req.body.howitworks) updates.howitworks = req.body.howitworks;
      if (req.body.whatisService) updates.whatisService = req.body.whatisService;
      if (req.body.whatToExpect) updates.whatToExpect = req.body.whatToExpect;
      if (req.body.signs) updates.signs = req.body.signs;

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
          // Delete old image file if it exists
          if (service.imageUrl) {
            const oldImagePath = path.join(__dirname, '..', 'public', service.imageUrl);
            try {
              await fs.unlink(oldImagePath);
            } catch (unlinkError) {
              console.error('Error deleting old image:', unlinkError);
            }
          }

          // Set new image URL
          updates.imageUrl = `/uploads/services/${req.file.filename}`;
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

      // Delete the image file if it exists
      if (service.imageUrl) {
        const imagePath = path.join(__dirname, '..', 'public', service.imageUrl);
        try {
          await fs.unlink(imagePath);
        } catch (unlinkError) {
          console.error('Error deleting image:', unlinkError);
        }
      }

      res.json({ message: 'Service deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting service' });
    }
  },
}

module.exports = serviceController;