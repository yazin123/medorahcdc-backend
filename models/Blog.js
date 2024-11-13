// models/Blog.js
const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  image: [String],
  tags: [String],
  slug: { 
    type: String, 
    unique: true,
    lowercase: true
  },
  createdAt: { type: Date, default: Date.now }

});

blogSchema.pre('save', async function(next) {
  if (!this.isModified('title')) {
    return next();
  }

  // Create base slug from title
  let baseSlug = slugify(this.title, {
    lower: true,      // Convert to lowercase
    strict: true,     // Remove special characters
    trim: true        // Trim whitespace
  });

  // Check if slug already exists
  let slug = baseSlug;
  let counter = 1;
  let exists = true;

  // Keep checking until we find a unique slug
  while (exists) {
    const doc = await this.constructor.findOne({ slug, _id: { $ne: this._id } });
    if (!doc) {
      exists = false;
    } else {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  this.slug = slug;
  next();
});

const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;