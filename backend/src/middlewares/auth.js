"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token tidak ditemukan' });
        }
        jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: 'Token tidak valid atau sudah kadaluarsa' });
            }
            req.user = decoded;
            next();
        });
    }
    else {
        return res.status(401).json({ error: 'Akses ditolak, token tidak ditemukan' });
    }
};
exports.authenticateJWT = authenticateJWT;
//# sourceMappingURL=auth.js.map