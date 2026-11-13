import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { loginSchema, registerSchema } from "../schemas/authSchema";
import { signToken } from "../middlewares/authMiddleware";
import { HttpError } from "../utils/httpError";

// POST /api/auth/register
export async function register(req: Request, res: Response) {
  const { email, password, role, medicId } = registerSchema.parse(req.body);

  if (medicId && role !== "MEDICO") {
    throw new HttpError(400, "Solo un usuario con rol MEDICO puede vincularse a un registro de médico");
  }

  let targetMedicId: number | undefined = medicId;

  if (role === "MEDICO") {
    if (targetMedicId) {
      const medic = await prisma.medic.findUnique({ where: { id: targetMedicId } });
      if (!medic) throw new HttpError(404, "Médico a vincular no encontrado");
      if (medic.userId) throw new HttpError(409, "Ese médico ya cuenta con un usuario vinculado");
    } else {
      // Si no envió medicId pero existe un médico con el mismo correo sin usuario, lo vincula automáticamente
      const medicByEmail = await prisma.medic.findUnique({ where: { email } });
      if (medicByEmail && !medicByEmail.userId) {
        targetMedicId = medicByEmail.id;
      }
    }
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      role,
      ...(targetMedicId ? { medic: { connect: { id: targetMedicId } } } : {}),
    },
    include: {
      medic: { select: { id: true, name: true, specialty: true } },
    },
  });

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    medicId: user.medic?.id ?? null,
  };

  const token = signToken(payload);

  res.status(201).json({
    data: {
      token,
      user: {
        ...payload,
        medic: user.medic,
      },
    },
  });
}

// POST /api/auth/login
export async function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      medic: { select: { id: true, name: true, specialty: true } },
    },
  });

  if (!user) {
    throw new HttpError(401, "Credenciales inválidas");
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new HttpError(401, "Credenciales inválidas");
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    medicId: user.medic?.id ?? null,
  };

  const token = signToken(payload);

  res.status(200).json({
    data: {
      token,
      user: {
        ...payload,
        medic: user.medic,
      },
    },
  });
}

// GET /api/auth/me
export async function getProfile(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      medic: {
        select: {
          id: true,
          name: true,
          email: true,
          specialty: true,
        },
      },
    },
  });

  if (!user) throw new HttpError(404, "Usuario no encontrado");
  res.status(200).json({ data: user });
}
