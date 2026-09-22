import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import asyncHandler from "../middleware/asyncHandler";

const registerUser = asyncHandler(async (req: Request, res: Response) => {
  // extract info from req.body
  const { email, name, password } = req.body;

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    res.status(409).json({ message: "User already exist" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name,
      password: hashedPassword,
    },
  });

  res.status(200).json({ message: "User registered" });
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // check if the user exist
  const existing = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!existing) {
    res.status(404).json({ message: "User doesnt exist" });
    return;
  }

  const isMatch = await bcrypt.compare(password, existing.password);

  if (!isMatch) {
    res.status(401).json({ message: "Wrong password" });
    return;
  }

  const token = jwt.sign(
    { userId: existing.id },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" },
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(200).json({ message: "Login successful" });
  //
});

const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
});

export { registerUser, loginUser, logoutUser };
