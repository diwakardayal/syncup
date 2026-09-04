import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const requireAuth = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req?.cookies?.token;
    if (token) {
      const decode = jwt.verify(token, process.env.JWT_SECRET as string) as {
        userId: number;
      };
      // find the user by id
      const existing = await prisma.user.findUnique({
        where: { id: decode.userId },
      });

      if (!existing) {
        res.status(401);
        throw new Error("User no longer exists");
      }

      req.user = existing;
      next();
    } else {
      console.log("token no found");
      res.status(401);
      throw Error("Unauthenticated request");
    }
  },
);

export default requireAuth;