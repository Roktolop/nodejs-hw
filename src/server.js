import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectMongoDB } from './db/connectMongoDB.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { logger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware

app.use(express.json());
app.use(cors());
app.use(logger());

//GET /notes
app.get('/notes', (req, res) => {
  res.status(200).json(
    { "message": "Retrieved all notes" });
});

//GET /notes/:noteId
app.get('/notes/:noteId', (req, res) => {
  const { noteId } = req.params;

  res.status(200).json(
    { "message": `Retrieved note with ID: ${noteId}` });
});

//Unknown routes handler
app.use(notFoundHandler);

//Global error handler
app.use(errorHandler);

// Connect to MongoDB and start the server
await connectMongoDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
