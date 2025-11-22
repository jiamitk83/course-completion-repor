const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 3000;

// MongoDB connection string - replace with your own
const uri = 'mongodb://localhost:27017'; // Assuming local MongoDB
const client = new MongoClient(uri);

app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files

let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db('courseCompletionDB');
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
}

connectDB();

// Routes

// Classes
app.get('/api/classes', async (req, res) => {
    try {
        const classes = await db.collection('classes').find({}).toArray();
        res.json(classes.map(c => c.name));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/classes', async (req, res) => {
    try {
        const { name } = req.body;
        await db.collection('classes').insertOne({ name });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/classes/:oldName', async (req, res) => {
    try {
        const { oldName } = req.params;
        const { name } = req.body;
        await db.collection('classes').updateOne({ name: oldName }, { $set: { name } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/classes/:name', async (req, res) => {
    try {
        const { name } = req.params;
        await db.collection('classes').deleteOne({ name });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Subjects
app.get('/api/subjects', async (req, res) => {
    try {
        const subjects = await db.collection('subjects').find({}).toArray();
        res.json(subjects.map(s => s.name));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/subjects', async (req, res) => {
    try {
        const { name } = req.body;
        await db.collection('subjects').insertOne({ name });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/subjects/:oldName', async (req, res) => {
    try {
        const { oldName } = req.params;
        const { name } = req.body;
        await db.collection('subjects').updateOne({ name: oldName }, { $set: { name } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/subjects/:name', async (req, res) => {
    try {
        const { name } = req.params;
        await db.collection('subjects').deleteOne({ name });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Chapters
app.get('/api/chapters/:className/:subjectName', async (req, res) => {
    try {
        const { className, subjectName } = req.params;
        const chapters = await db.collection('chapters').find({ className, subjectName }).sort({ chapterNumber: 1 }).toArray();
        res.json(chapters);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/chapters', async (req, res) => {
    try {
        const chapter = req.body;
        await db.collection('chapters').insertOne(chapter);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/chapters/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const chapter = req.body;
        await db.collection('chapters').updateOne({ _id: new require('mongodb').ObjectId(id) }, { $set: chapter });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/chapters/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('chapters').deleteOne({ _id: new require('mongodb').ObjectId(id) });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Status
app.get('/api/status/:className/:subjectName', async (req, res) => {
    try {
        const { className, subjectName } = req.params;
        const status = await db.collection('status').find({ className, subjectName }).toArray();
        const statusMap = {};
        status.forEach(s => {
            statusMap[s.chapterNumber] = s;
        });
        res.json(statusMap);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/status/:className/:subjectName/:chapterNumber', async (req, res) => {
    try {
        const { className, subjectName, chapterNumber } = req.params;
        const statusData = req.body;
        await db.collection('status').updateOne(
            { className, subjectName, chapterNumber: parseInt(chapterNumber) },
            { $set: { ...statusData, className, subjectName, chapterNumber: parseInt(chapterNumber) } },
            { upsert: true }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/status/:className/:subjectName/:chapterNumber', async (req, res) => {
    try {
        const { className, subjectName, chapterNumber } = req.params;
        await db.collection('status').deleteOne({ className, subjectName, chapterNumber: parseInt(chapterNumber) });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// All chapters
app.get('/api/all-chapters', async (req, res) => {
    try {
        const chapters = await db.collection('chapters').find({}).toArray();
        res.json(chapters);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// All status
app.get('/api/all-status', async (req, res) => {
    try {
        const status = await db.collection('status').find({}).toArray();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});