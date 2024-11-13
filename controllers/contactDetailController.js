// controllers/contactController.js
const ContactDetails = require('../models/ContactDetails');

// Get all contacts
exports.getContacts = async (req, res) => {
    console.log("reached contact controller")
    try {
        const contacts = await ContactDetails.find().sort({ createdAt: -1 });
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching contacts', error: error.message });
    }
};
exports.getWhatsapp = async (req, res) => {
    console.log("reached whatsapp controller")
    try {
        const contacts = await ContactDetails.find({media:'whatsapp'})
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching contacts', error: error.message });
    }
};

// Add new contact
exports.addContact = async (req, res) => {
    try {
        const { media, value } = req.body;
        const contact = new ContactDetails({ media, value });
        await contact.save();
        res.status(201).json(contact);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'This media type already exists' });
        }
        res.status(500).json({ message: 'Error adding contact', error: error.message });
    }
};

// Update contact
exports.updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        const { media, value } = req.body;
        
        const contact = await ContactDetails.findByIdAndUpdate(
            id,
            { media, value },
            { new: true, runValidators: true }
        );
        
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        
        res.status(200).json(contact);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'This media type already exists' });
        }
        res.status(500).json({ message: 'Error updating contact', error: error.message });
    }
};

// Delete contact
exports.deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        const contact = await ContactDetails.findByIdAndDelete(id);
        
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        
        res.status(200).json({ message: 'Contact deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting contact', error: error.message });
    }
};