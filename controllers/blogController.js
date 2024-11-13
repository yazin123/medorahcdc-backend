// controllers/blogController.js
const Blog = require('../models/Blog');
const fs = require('fs').promises;
const path = require('path');

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
    console.log("fetching dddddddddddddddddd",req.params)
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
    const blogData = {
      ...req.body,
      image: req.files?.map(file => `/uploads/blogs/${file.filename}`) || [],
      tags: Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(tag => tag.trim())
    };

    const blog = new Blog(blogData);
    await blog.save();  // Slug will be automatically generated here
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
    console.log("=====tag for :", req.query.serviceName);
    let nm = serviceName.toLowerCase().replace('-', ' ');
    console.log("=====tag for sadasd:", nm);

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

    // Handle images...
    const imageUrls = [...(blog.image || [])];
    if (req.files?.length) {
      const newImageUrls = req.files.map(file => `/uploads/blogs/${file.filename}`);
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
      { new: true, runValidators: true }  // This ensures the slug is updated if title changes
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

    // Delete associated images
    if (blog.image && blog.image.length > 0) {
      for (const imageUrl of blog.image) {
        const imagePath = path.join(__dirname, '..', 'public', imageUrl);
        await fs.unlink(imagePath).catch(err => console.error('Error deleting image:', err));
      }
    }

    await blog.deleteOne();
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ error: 'Error deleting blog' });
  }
};