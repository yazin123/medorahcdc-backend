// controllers/blogController.js
const Blog = require('../models/Blog');
const fs = require('fs').promises;
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort('-createdAt');
        res.json(blogs);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ error: 'Error fetching blogs' });
    }
};

exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.json(blog);
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).json({ error: 'Error fetching blog' });
    }
};

exports.createBlog = async (req, res) => {
  try {
    const imageUrls = await Promise.all(
      req.files.map(async (file) => {
        // Upload the file to Cloudinary and get the secure URL
        const result = await cloudinary.uploader.upload(file.path);
        return result.secure_url;
      })
    );

    const blogData = {
      ...req.body,
      image: imageUrls,
      tags: Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(tag => tag.trim())
    };

    const blog = new Blog(blogData);
    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(400).json({ error: 'Error creating blog' });
  }
};

exports.getBlogBySlug = async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug });
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.json(blog);
    } catch (error) {
        console.error('Error fetching blog by slug:', error);
        res.status(500).json({ error: 'Error fetching blog' });
    }
};

exports.getRelatedBlogs = async (req, res) => {
    try {
        const serviceName = req.query.serviceName;
        const nm = serviceName.toLowerCase().replace('-', ' ');

        const blogs = await Blog.find({
            tags: { $in: [nm, new RegExp(nm, 'i')] }
        }).sort('-createdAt');

        res.json(blogs);
    } catch (error) {
        console.error('Error fetching service blogs:', error);
        res.status(500).json({ error: 'Error fetching service blogs' });
    }
};

exports.updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        const imageUrls = [...(blog.image || [])];
        if (req.files?.length) {
            const newImageUrls = await Promise.all(req.files.map(async (file) => {
                const result = await cloudinary.uploader.upload(file.path);
                return result.secure_url;
            }));
            imageUrls.push(...newImageUrls);
        }

        const updateData = {
            ...req.body,
            image: imageUrls,
            tags: Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(tag => tag.trim())
        };

        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json(updatedBlog);
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(400).json({ error: 'Error updating blog' });
    }
};

exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        // Delete associated images from Cloudinary
        if (blog.image && blog.image.length > 0) {
            for (const imageUrl of blog.image) {
                const publicId = imageUrl.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }
        }

        await blog.deleteOne();
        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({ error: 'Error deleting blog' });
    }
};