import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/connectDB.js';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes.js';
dotenv.config();
connectDB();
const PORT = process.env.PORT || 5000;
const app = express();

//Middlewares
app.use(express.json()); // to parse Json Data in the req.body
app.use(express.urlencoded({ extended: true })); // to parse nested objects in the req.body
app.use(cookieParser());

// Routes
app.use('/api/users', userRoutes);

app.listen(PORT, () => console.log(`server running on port ${PORT}`));
