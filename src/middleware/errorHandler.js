import { HttpError } from 'http-errors';

export const errorHandler = (err, req, res, next) => {

  // Check if the error is create by method createHttpError
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      message: err.message || err.name,
    });
  }

  // Check if th env is production
  const isProd = process.env.NODE_ENV === "production";

  res.status(500).json(
    {
      message: isProd
        ? "Something went wrong. Please try again later."
        : err.message,
    });
};
