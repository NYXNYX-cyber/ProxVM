import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../utils/db';
import { proxmoxService } from '../services/proxmox.service';

// Middleware cek admin (bisa dipindah ke file middleware jika mau)
export const isAdmin = (req: AuthRequest, res: Response, next: any) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Akses ditolak. Khusus Administrator.' });
  }
  next();
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        credits: true,
        createdAt: true,
        _count: { select: { instances: true } }
      }
    });
    return res.json({ users });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateUserCredits = async (req: AuthRequest, res: Response): Promise<any> => {
  const { userId, amount } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { credits: parseFloat(amount) }
    });
    return res.json({ message: 'Saldo berhasil diperbarui', user });
  } catch (error: any) {
    return res.status(500).json({ error: 'Gagal memperbarui saldo' });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<any> => {
  const { userId, role } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: role }
    });
    return res.json({ message: `Role berhasil diubah ke ${role}`, user });
  } catch (error: any) {
    return res.status(500).json({ error: 'Gagal memperbarui role' });
  }
};

export const getAllInstances = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const instances = await prisma.instance.findMany({
      include: {
        user: { select: { email: true, name: true } },
        product: true
      }
    });
    return res.json({ instances });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<any> => {
  const id = req.params.id as string;
  try {
    // Cek apakah user punya instance aktif
    const instances = await prisma.instance.findMany({ where: { userId: id } });
    if (instances.length > 0) {
      return res.status(400).json({ error: 'User masih memiliki VPS aktif. Hapus VPS-nya dulu.' });
    }

    await prisma.user.delete({ where: { id } });
    return res.json({ message: 'User berhasil dihapus' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Gagal menghapus user' });
  }
};
