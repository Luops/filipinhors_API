import jwt from "jsonwebtoken";
import Logger from "../../config/logger";

const secret = process.env.TOKEN_SECRET as string;

const generateToken = (uuid: string) => {
  return jwt.sign({ id: uuid }, secret, {
    expiresIn: "3000s",
    header: { alg: "HS256", typ: "JWT" },
  });
};

const verifyToken = (token: string): any => {
  const verified = jwt.verify(token, secret);
  if (verified) {
    return verified;
  }
};

export default {
  generateToken,
  verifyToken,
};
