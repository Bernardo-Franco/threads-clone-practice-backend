import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/connectDB.js';

dotenv.config();
connectDB();
const PORT = process.env.PORT || 5000;
const app = express();

app.listen(PORT, () => console.log(`server running on port ${PORT}`));
