const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/user-auth', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("✅ MongoDB connected");
}).catch(err => {
    console.error("❌ MongoDB connection error:", err);
});

// Schema & Model
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    gender: String,
    password: String
});

const User = mongoose.model('User', userSchema);

// Register API
app.post('/api/register', async (req, res) => {
    const { firstName, lastName, email, phone, gender, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ firstName, lastName, email, phone, gender, password: hashedPassword });
        await newUser.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Login API
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ email: username });
        if (!user) return res.json({ success: false });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.json({ success: false });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// Server start
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
