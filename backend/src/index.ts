import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { Client } from 'ssh2';
import authRoutes from './routes/auth.routes';
import vpsRoutes from './routes/vps.routes';
import adminRoutes from './routes/admin.routes';
import prisma from './utils/db';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const server = http.createServer(app);

const wss = new WebSocketServer({ noServer: true });

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/vps', vpsRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => { res.json({ status: 'ok' }); });

// Manual Upgrade untuk WebSocket
server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
  if (url.pathname === '/console') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on('connection', async (ws: WebSocket, req: http.IncomingMessage) => {
  console.log("[SSH-CONSOLE] New connection attempt...");
  const conn = new Client();

  try {
    const url = new URL(req.url || '', 'http://localhost');
    const token = url.searchParams.get('token');
    const instanceId = url.searchParams.get('instanceId');

    if (!token || !instanceId) { ws.close(); return; }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const instance = await prisma.instance.findUnique({ where: { id: instanceId } });
    
    if (!instance) { ws.close(); return; }
    
    // Check access: Owner OR Admin
    if (instance.userId !== decoded.userId && decoded.role !== 'ADMIN') { 
      ws.close(); 
      return; 
    }

    // Konfigurasi SSH ke Node Proxmox
    const sshConfig = {
      host: '10.10.5.200', // IP Node Proxmox Anda
      port: 22,
      username: 'root',
      password: process.env.PROXMOX_PASSWORD || 'AsusTerbaik5'
    };

    conn.on('ready', () => {
      console.log("[SSH-CONSOLE] SSH Ready. Entering LXC...");
      ws.send("\r\n[NyxHosting] SSH Tunnel Established. Entering LXC...\r\n");
      
      // Jalankan perintah pct enter untuk masuk ke shell LXC
      conn.shell((err, stream) => {
        if (err) {
          ws.send(`\r\n[Error] Failed to open shell: ${err.message}\r\n`);
          return ws.close();
        }

        // Masuk ke container
        stream.write(`pct enter ${instance.vmid}\n`);
        stream.write(`clear\n`);

        // Pipa data: SSH -> WebSocket
        stream.on('data', (data: any) => ws.send(data));
        
        // Pipa data: WebSocket -> SSH
        ws.on('message', (data: any) => stream.write(data));

        stream.on('close', () => {
          conn.end();
          ws.close();
        });
      });
    }).on('error', (err) => {
      console.error("[SSH-CONSOLE] SSH Error:", err.message);
      ws.send(`\r\n[Error] SSH Connection Failed: ${err.message}\r\n`);
      ws.close();
    }).connect(sshConfig);

    ws.on('close', () => {
      conn.end();
    });

  } catch (err: any) {
    console.error("[SSH-CONSOLE] Fatal Error:", err.message);
    ws.close();
  }
});

server.listen(port, () => {
  console.log(`[Server]: API Running on port ${port} (SSH Jumper Enabled)`);
});
