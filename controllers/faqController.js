// controllers/faqController.js
const FAQ = require('../models/FAQ');

exports.getAllFaqs = async (req, res) => {
    try {
        const faqs = await FAQ.find().sort('order');
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching FAQs' });
    }
};

exports.getFaqById = async (req, res) => {
    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq) {
            return res.status(404).json({ error: 'FAQ not found' });
        }
        res.json(faq);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching FAQ' });
    }
};

exports.createFaq = async (req, res) => {
    try {
        const faq = new FAQ(req.body);
        await faq.save();
        res.status(201).json(faq);
    } catch (error) {
        res.status(400).json({ error: 'Error creating FAQ' });
    }
};

exports.updateFaq = async (req, res) => {
    try {
        const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!faq) {
            return res.status(404).json({ error: 'FAQ not found' });
        }
        res.json(faq);
    } catch (error) {
        res.status(400).json({ error: 'Error updating FAQ' });
    }
};

exports.deleteFaq = async (req, res) => {
    try {
        const faq = await FAQ.findByIdAndDelete(req.params.id);
        if (!faq) {
            return res.status(404).json({ error: 'FAQ not found' });
        }
        res.json({ message: 'FAQ deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting FAQ' });
    }
};

