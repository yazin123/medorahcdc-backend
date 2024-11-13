// controllers/serviceController.js
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

      const service = new Service(
        {
          title: req.body.title,
          description: req.body.description,
          howitworks: req.body.howitworks,
          whatisService: req.body.whatisService,
          handledBy: req.body.handledBy,
          imageUrl: req.file ? req.file.filename : null,
        }
      );
      console.log("Service details are :", service)
      await service.save();
      res.status(201).json(service);
    } catch (error) {
      console.log("cant create service", error)
      res.status(400).json({ error: 'Error creating service' });
    }
  },

  updateService: async (req, res) => {
    try {
      const service = await Service.findById(req.params.id);
  
      if (!service) {
        if (req.file) {
          await fs.unlink(path.join(__dirname, '..', 'uploads', req.file.filename))
            .catch(err => console.error('Error deleting uploaded file:', err));
        }
        return res.status(404).json({ error: 'Service not found' });
      }
  
      const updates = {};
      if (req.body.title) updates.title = req.body.title;
      if (req.body.description) updates.description = req.body.description;
      if (req.body.howitworks) updates.howitworks = req.body.howitworks;
      if (req.body.whatisService) updates.whatisService = req.body.whatisService;
  
      // Handle the handledBy field update
      if (req.body.handledBy && Array.isArray(req.body.handledBy)) {
        updates.handledBy = req.body.handledBy;
      } else if (req.body.handledBy) {
        updates.handledBy = [req.body.handledBy];
      }
  
      // Handle image update
      if (req.file) {
        // Delete old image if it exists
        if (service.imageUrl) {
          const oldImagePath = path.join(__dirname, '..', 'uploads', path.basename(service.imageUrl));
          await fs.unlink(oldImagePath)
            .catch(err => console.error('Error deleting old image:', err));
        }
        updates.imageUrl = `${req.file.filename}`; // Store as URL path
      }
  
      const updatedService = await Service.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
      ).populate('handledBy');
  
      res.json(updatedService);
    } catch (error) {
      if (req.file) {
        await fs.unlink(path.join(__dirname, '..', 'uploads', req.file.filename))
          .catch(err => console.error('Error deleting uploaded file:', err));
      }
      res.status(400).json({ error: error.message || 'Error updating service' });
    }
  },

  deleteService: async (req, res) => {
    try {
      const service = await Service.findByIdAndDelete(req.params.id);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }
      res.json({ message: 'Service deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting service' });
    }
  },
}

module.exports = serviceController