// controllers/adminController.js
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin || !await bcrypt.compare(password, admin.password)) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};


exports.create = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new Admin({
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User'
    });
    await admin.save();
    console.log('Admin user created successfully');
    res.status(200).json('Admin created success')
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}
