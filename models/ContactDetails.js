// models/ContactDetails.js
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    media: {
        type: String,
        required: true,
        unique: true,
        enum: ['youtube', 'instagram', 'linkedin', 'whatsapp', 'facebook', 'phone-primary', 'phone-secondary', 'whatsapp', 'address', 'email']
    },
    value: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const ContactDetails = mongoose.model('ContactDetails', contactSchema);
module.exports = ContactDetails;
