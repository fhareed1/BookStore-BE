import jwt, { JwtPayload } from "jsonwebtoken";
import { Middleware } from "../types/middleware";
import { NextFunction, Request, Response } from "express";

// Extend Express Request type
export interface AuthenticatedRequest extends Request {
  userId?: string;
}

function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "No Token Provided or Invalid Format" });
  }

  const token = authHeader.split(" ")[1]; // Extract token after "Bearer"

  try {
    const secret = process.env.JWT_SECRET as string;
    if (!secret) throw new Error("JWT_SECRET is not set");

    const decoded = jwt.verify(token, secret) as JwtPayload;
    if (!decoded || typeof decoded === "string") {
      return res.status(401).json({ message: "Invalid Token" });
    }

    console.log("Auth middleware triggered");


    req.userId = decoded.id; // Now TypeScript recognizes this
    console.log(req.userId);
    
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid Token" });
  }
}

export default authMiddleware;
