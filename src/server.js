import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectMongoDB } from './db/connectMongoDB.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { logger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import notesRoutes from './routes/notesRoutes.js';
import { errors } from 'celebrate';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware

app.use(express.json());
app.use(cors());
app.use(logger());

// Routes
app.use(notesRoutes);

//Unknown routes handler
app.use(notFoundHandler);

//Celebrate error handler
app.use(errors());

//Global error handler
app.use(errorHandler);

// Connect to MongoDB and start the server
await connectMongoDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
