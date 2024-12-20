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
            console.log("creating");
            let imageUrl = null;
            if (req.file) {
                imageUrl = `/uploads/team/${req.file.filename}`;
            }

            const member = new Team({
                name: req.body.name,
                position: req.body.position,
                bio: req.body.bio,
                image: imageUrl,
                socialLinks: {
                    linkedin: req.body.linkedin || '',
                    twitter: req.body.twitter || '',
                    facebook: req.body.facebook || ''
                }
            });

            await member.save();
            res.status(201).json(member);
        } catch (error) {
            console.log("error creating team member: ", error);
            res.status(400).json({ error: error.message || 'Error creating team member' });
        }
    },

    updateTeamMember: async (req, res) => {
        try {
            const member = await Team.findById(req.params.id);
            if (!member) {
                return res.status(404).json({ error: 'Team member not found' });
            }

            const updates = {};
            if (req.body.name) updates.name = req.body.name;
            if (req.body.position) updates.position = req.body.position;
            if (req.body.bio) updates.bio = req.body.bio;
            updates.socialLinks = {
                linkedin: req.body.linkedin || member.socialLinks.linkedin,
                twitter: req.body.twitter || member.socialLinks.twitter,
                facebook: req.body.facebook || member.socialLinks.facebook
            };

            // Handle image update
            if (req.file) {
                try {
                    // Delete old image file if it exists
                    if (member.image) {
                        const oldImagePath = path.join(__dirname, '..', 'public', member.image);
                        try {
                            await fs.unlink(oldImagePath);
                        } catch (unlinkError) {
                            console.error('Error deleting old image:', unlinkError);
                        }
                    }

                    // Set new image URL
                    updates.image = `/uploads/team/${req.file.filename}`;
                } catch (error) {
                    console.error('Error handling image:', error);
                    return res.status(400).json({ error: 'Error processing image' });
                }
            }

            const updatedMember = await Team.findByIdAndUpdate(
                req.params.id,
                { $set: updates },
                { new: true, runValidators: true }
            );

            res.json(updatedMember);
        } catch (error) {
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
                const imagePath = path.join(__dirname, '..', 'public', member.image);
                try {
                    await fs.unlink(imagePath);
                } catch (unlinkError) {
                    console.error('Error deleting image:', unlinkError);
                }
            }

            await Team.findByIdAndDelete(req.params.id);
            res.json({ message: 'Team member deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Error deleting team member' });
        }
    }
};

module.exports = teamController;