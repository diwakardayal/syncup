import { Response, Request, NextFunction } from "express";
import { RequestHandler } from "express-serve-static-core";

const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error("Async error caught: ", err);
      next(err);
    });
  };

export default asyncHandler;
