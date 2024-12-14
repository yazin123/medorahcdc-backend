const Testimonial = require('../models/Testimonial');
const fs = require('fs').promises;
const path = require('path');

exports.getAllTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ createdAt: -1 });
        res.json(testimonials);
    } catch (error) {
        console.error('Error in getAllTestimonials:', error);
        res.status(500).json({ error: 'Internal server error while fetching testimonials' });
    }
};

exports.getTestimonialById = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ error: 'Testimonial not found' });
        }
        res.json(testimonial);
    } catch (error) {
        console.error('Error in getTestimonialById:', error);
        res.status(500).json({ error: 'Internal server error while fetching testimonial' });
    }
};

exports.createTestimonial = async (req, res) => {
    try {
        // Validate required fields
        const { name, content } = req.body;
        if (!name || !content) {
            return res.status(400).json({ error: 'Name and content are required fields' });
        }

        // Create testimonial object
        const testimonialData = {
            name,
            content,
            position: req.body.position || '',
            company: req.body.company || '',
            rating: req.body.rating || 5,
        };

        // Add image path if file was uploaded
        if (req.file) {
            testimonialData.image = `/uploads/testimonials/${req.file.filename}`;
        }

        const testimonial = new Testimonial(testimonialData);
        await testimonial.save();
        
        res.status(201).json(testimonial);
    } catch (error) {
        console.error('Error in createTestimonial:', error);
        res.status(400).json({ error: 'Error creating testimonial: ' + error.message });
    }
};

exports.updateTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ error: 'Testimonial not found' });
        }

        // Validate required fields
        const { name, content } = req.body;
        if (!name || !content) {
            return res.status(400).json({ error: 'Name and content are required fields' });
        }

        // Prepare update data
        const updateData = {
            name,
            content,
            position: req.body.position || '',
            company: req.body.company || '',
            rating: req.body.rating || 5
        };

        // Handle image update
        if (req.file) {
            // Delete old image file if it exists
            if (testimonial.image) {
                const oldImagePath = path.join(__dirname, '..', 'public', testimonial.image);
                try {
                    await fs.unlink(oldImagePath);
                } catch (unlinkError) {
                    console.error('Error deleting old image:', unlinkError);
                }
            }

            // Set new image URL
            updateData.image = `/uploads/testimonials/${req.file.filename}`;
        }

        // Update testimonial
        const updatedTestimonial = await Testimonial.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json(updatedTestimonial);
    } catch (error) {
        console.error('Error in updateTestimonial:', error);
        res.status(400).json({ error: 'Error updating testimonial: ' + error.message });
    }
};

exports.deleteTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ error: 'Testimonial not found' });
        }

        // Delete associated image file if it exists
        if (testimonial.image) {
            const imagePath = path.join(__dirname, '..', 'public', testimonial.image);
            try {
                await fs.unlink(imagePath);
            } catch (unlinkError) {
                console.error('Error deleting image:', unlinkError);
            }
        }

        await testimonial.deleteOne();
        res.json({ message: 'Testimonial deleted successfully' });
    } catch (error) {
        console.error('Error in deleteTestimonial:', error);
        res.status(500).json({ error: 'Internal server error while deleting testimonial' });
    }
};