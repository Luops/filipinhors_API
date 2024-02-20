import { NextFunction, Request, Response } from "express";
// import dotenv from 'dotenv'
import generateToken from "../services/tokenService";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.json({ message: "Não autorizado!" }).status(403);
  }

  req.body = generateToken.verifyToken(token).id;
  next();
};
