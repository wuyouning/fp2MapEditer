const express = require('express');
const app = express();
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const connection = require('./db/db');

// 使用中间件
app.use(express.json());

// 使用登录路由
app.use('/api', authRoutes);

// 监听端口
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));