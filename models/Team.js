
// models/Team.js
const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  bio: String,
  image: String,
  socialLinks: {
    linkedin: String,
    twitter: String,
    facebook: String
  },
  createdAt: { type: Date, default: Date.now }
});

const Team = mongoose.model('Team', teamSchema);
module.exports = Team;
