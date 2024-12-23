// controllers/contactController.js
const ContactDetails = require('../models/ContactDetails');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

exports.sendContactEmail = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, message } = req.body;
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.RECIPIENT_EMAIL,
            subject: 'New Contact Form Submission',
            html: `
                <h3>New Contact Form Submission</h3>
                <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Message:</strong> ${message}</p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending email', error: error.message });
    }
};

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
