import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: { id: string; grade: number; name?: string };
}

// Demo header-based auth. Replace with your real auth integration.
export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const userId = String(req.headers['x-user-id'] || 'system');
  const grade = Number(req.headers['x-user-grade'] ?? 0);
  const name = String(req.headers['x-user-name'] || 'System');
  req.user = { id: userId, grade, name };
  next();
}

export function requireGrade(minGrade: number) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.grade >= minGrade) return next();
    return res.status(403).json({ error: 'Insufficient grade' });
  };
}
