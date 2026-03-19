"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../utils/db"));
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        // Cek apakah email sudah terdaftar
        const existingUser = await db_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email sudah digunakan' });
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Buat user baru
        const newUser = await db_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });
        return res.status(201).json({
            message: 'Registrasi berhasil',
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                credits: newUser.credits,
            },
        });
    }
    catch (error) {
        console.error('Register Error:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Cari user
        const user = await db_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Email atau password salah' });
        }
        // Verifikasi password
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Email atau password salah' });
        }
        // Buat JWT Token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        return res.json({
            message: 'Login berhasil',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                credits: user.credits,
            },
        });
    }
    catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};
exports.login = login;
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const user = await db_1.default.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, role: true, credits: true }
        });
        if (!user)
            return res.status(404).json({ error: 'User tidak ditemukan' });
        return res.json({ user });
    }
    catch (error) {
        console.error('Get Profile Error:', error);
        return res.status(500).json({ error: 'Gagal mengambil profil' });
    }
};
exports.getUserProfile = getUserProfile;
//# sourceMappingURL=auth.controller.js.map