const Team = require('../models/Team');
const fs = require('fs').promises;
const path = require('path');

const teamController = {
    getAllTeamMembers: async (req, res) => {
        try {
            const team = await Team.find();
            res.json(team);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching team members' });
        }
    },

    getTeamMemberById: async (req, res) => {
        try {
            const member = await Team.findById(req.params.id);
            if (!member) {
                return res.status(404).json({ error: 'Team member not found' });
            }
            res.json(member);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching team member' });
        }
    },

    createTeamMember: async (req, res) => {
        try {
            if (!req.body.name || !req.body.position) {
                return res.status(400).json({ error: 'Name and position are required' });
            }

            const member = new Team({
                name: req.body.name,
                position: req.body.position,
                bio: req.body.bio,
                image: req.file ? req.file.filename : null,
                socialLinks: {
                    linkedin: req.body.linkedin || '',
                    twitter: req.body.twitter || '',
                    facebook: req.body.facebook || ''
                }
            });

            await member.save();
            res.status(201).json(member);
        } catch (error) {
            if (req.file) {
                await fs.unlink(path.join(__dirname, '..', 'uploads', req.file.filename))
                    .catch(err => console.error('Error deleting uploaded file:', err));
            }
            res.status(400).json({ error: error.message || 'Error creating team member' });
        }
    },

    updateTeamMember: async (req, res) => {
        try {
            const member = await Team.findById(req.params.id);
            if (!member) {
                if (req.file) {
                    await fs.unlink(path.join(__dirname, '..', 'uploads', req.file.filename))
                        .catch(err => console.error('Error deleting uploaded file:', err));
                }
                return res.status(404).json({ error: 'Team member not found' });
            }

            // Update fields if provided
            const updates = {};
            if (req.body.name) updates.name = req.body.name;
            if (req.body.position) updates.position = req.body.position;
            if (req.body.bio) updates.bio = req.body.bio;

            // Update social links
            updates.socialLinks = {
                linkedin: req.body.linkedin || member.socialLinks.linkedin,
                twitter: req.body.twitter || member.socialLinks.twitter,
                facebook: req.body.facebook || member.socialLinks.facebook
            };

            // Handle image update
            if (req.file) {
                // Delete old image if it exists
                if (member.image) {
                    await fs.unlink(path.join(__dirname, '..', 'uploads', member.image))
                        .catch(err => console.error('Error deleting old image:', err));
                }
                updates.image = req.file.filename;
            }

            const updatedMember = await Team.findByIdAndUpdate(
                req.params.id,
                { $set: updates },
                { new: true, runValidators: true }
            );

            res.json(updatedMember);
        } catch (error) {
            if (req.file) {
                await fs.unlink(path.join(__dirname, '..', 'uploads', req.file.filename))
                    .catch(err => console.error('Error deleting uploaded file:', err));
            }
            res.status(400).json({ error: error.message || 'Error updating team member' });
        }
    },

    deleteTeamMember: async (req, res) => {
        try {
            const member = await Team.findById(req.params.id);
            if (!member) {
                return res.status(404).json({ error: 'Team member not found' });
            }

            // Delete the image file if it exists
            if (member.image) {
                await fs.unlink(path.join(__dirname, '..', 'uploads', member.image))
                    .catch(err => console.error('Error deleting image file:', err));
            }

            await Team.findByIdAndDelete(req.params.id);
            res.json({ message: 'Team member deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Error deleting team member' });
        }
    }
};

module.exports = teamController;