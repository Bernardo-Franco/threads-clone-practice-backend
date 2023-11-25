import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/connectDB.js';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
dotenv.config();
connectDB();
const PORT = process.env.PORT || 5000;
const app = express();

//Middlewares
app.use(express.json({ limit: '50mb' })); // to parse Json Data in the req.body -- the 50mb limit is because we are saving imgs in base64 string format
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // to parse nested objects in the req.body
app.use(cookieParser());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);

app.listen(PORT, () => console.log(`server running on port ${PORT}`));
