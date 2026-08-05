const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ DB Error:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/users', require('./routes/users'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/zk', require('./routes/zk'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/trust', require('./routes/trust'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/ranking', require('./routes/ranking'));
app.use('/api/platform', require('./routes/platform'));

app.get('/api/health', (req, res) => res.json({ status: 'Server is running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
