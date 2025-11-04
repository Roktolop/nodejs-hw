import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware

app.use(express.json());
app.use(cors());
app.use(
  pino({
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
        messageFormat: '{req.method} {req.url} {res.statusCode} - {responseTime}ms',
        hideObject: true,
      },
    },
  }),
);

//GET /notes
app.get('/notes', (req, res) => {
  res.status(200).json(
    {"message": "Retrieved all notes"});
})

//GET /notes/:id
app.get('/notes/:id', (req, res) => {
  const { id } = req.params;

  res.status(200).json(
    { "message": `Retrieved note with ID: ${id}` });
})

app.get('/test-error', () => {
  throw new Error('Simulated server error');
})

//Unknown routes handler
app.use((req, res) => {
  res.status(404).json({ "message": "Route not found" });
})

//Global error handler
app.use((err, req, res, next) => {
  console.log(err);

  const isProd = process.env.NODE_ENV === "production";
  res.status(500).json(
    {
      message: isProd
      ? "Something went wrong. Please try again later."
        : err.message,
    });
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
