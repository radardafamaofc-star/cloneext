const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'replit_secret_key';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Mock Database (Replace with Replit DB later)
let licenses = [
    { key: 'TEST-123', status: 'active', expiry: '2026-12-31', userId: 'user1' }
];

app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin') {
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token });
    }
    res.status(401).json({ message: 'Unauthorized' });
});

app.get('/api/licenses', (req, res) => {
    res.json(licenses);
});

app.post('/api/licenses', (req, res) => {
    const newLicense = { ...req.body, id: Date.now() };
    licenses.push(newLicense);
    res.json(newLicense);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Admin Panel Server running on port ${PORT}`);
});
