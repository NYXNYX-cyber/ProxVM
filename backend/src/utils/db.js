"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// Inisialisasi Prisma Client tanpa logika tambahan yang berat saat startup
const prisma = global.prisma || new client_1.PrismaClient();
if (process.env.NODE_ENV !== 'production')
    global.prisma = prisma;
exports.default = prisma;
//# sourceMappingURL=db.js.map