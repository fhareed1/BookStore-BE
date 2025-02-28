import { Router, Request, Response, NextFunction } from "express";
import { compareSync, hashSync } from "bcrypt-ts";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient";
import { Role } from "@prisma/client";
import { error } from "console";

interface SignupBody {
  email: string;
  password: string;
  role?: Role;
}

interface LoginBody {
  email: string;
  password: string;
}

const router = Router();

router.post<{}, any, SignupBody>(
  "/register",
  async (
    req: Request<{}, any, SignupBody>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email, password } = req.body;
      const role = req.body.role || "USER";

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters" });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({ error: "Email already registered" });
      }

      const hashedPassword = hashSync(password, 8);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role,
          book: { create: [] },
        },
      });

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error("JWT_SECRET is not defined");
      }

      const token = jwt.sign({ id: user.id, role: user.role }, secret, {
        expiresIn: "24h",
      });

      return res.json({
        user,
        token,
      });
    } catch (error) {
      console.log(next(error));

      // Don't expose internal errors to client
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.post<{}, any, LoginBody>(
  "/login",
  async (
    req: Request<{}, any, LoginBody>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("Login route hit!");
      const { email, password } = req.body;

      const user = await prisma.user.findFirst({
        where: { email },
        select: {
          id: true,
          email: true,
          role: true,
          password: true, // Needed for comparison
        },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const passwordIsValid = compareSync(password, user.password);
      if (!passwordIsValid) {
        return res.status(401).json({ message: "Invalid Password" });
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error("JWT_SECRET is not defined");
      }

      const token = jwt.sign({ id: user.id, role: user.role }, secret, {
        expiresIn: "24h",
      });

      return res.json({ user, token });
    } catch (error) {
      return next(error);
    }
  }
);

export default router;
