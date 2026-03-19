import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): any => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }

    jwt.verify(token, JWT_SECRET as string, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Token tidak valid atau sudah kadaluarsa' });
      }
      
      req.user = decoded as { userId: string; email: string; role: string };
      next();
    });
  } else {
    return res.status(401).json({ error: 'Akses ditolak, token tidak ditemukan' });
  }
};
