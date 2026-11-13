import type { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import type { Role } from "../../generated/prisma/enums";
import { HttpError } from "../utils/httpError";

const JWT_SECRET = process.env.JWT_SECRET || "clinica-salud-integral-secret-dev";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "8h") as jwt.SignOptions["expiresIn"];

export interface AuthUser {
  id: number;
  email: string;
  role: Role;
  medicId: number | null;
}

// Extiende Request de Express para tener req.user tipado en controladores y middlewares
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signToken(payload: AuthUser): string {
  return jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      medicId: payload.medicId,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
}

// Verifica el header Authorization: Bearer <token>
export const authenticate: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HttpError(401, "Token de autenticación requerido (Formato: Bearer <token>)");
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    throw new HttpError(401, "Token de autenticación vacío");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      medicId: decoded.medicId ?? null,
    };
    next();
  } catch {
    throw new HttpError(401, "Token inválido o expirado");
  }
};

// Restringe el acceso a uno o más roles permitidos (RECEPCIONISTA, MEDICO, GERENCIA)
export function authorize(...allowedRoles: Role[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new HttpError(401, "No autenticado");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new HttpError(
        403,
        `Acceso denegado: tu rol (${req.user.role}) no tiene permiso. Se requiere: ${allowedRoles.join(", ")}`,
      );
    }

    next();
  };
}
