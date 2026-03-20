import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../utils/db';
import { proxmoxService } from '../services/proxmox.service';

export const getNodes = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const nodes = await proxmoxService.getNodes();
    return res.json({ nodes });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getUserInstances = async (req: AuthRequest, res: Response): Promise<any> => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const instances = await prisma.instance.findMany({
      where: { userId },
      include: { product: true }
    });

    // SINKRONISASI LEBIH AMAN: Jangan langsung hapus jika API error
    try {
      const node = process.env.PROXMOX_NODE || 'nzx';
      const proxmoxLXCs = await proxmoxService.getLXCs(node);
      
      // Ambil semua VMID dari Proxmox dan jadikan String
      if (Array.isArray(proxmoxLXCs)) {
        const proxmoxVmids = proxmoxLXCs.map((ct: any) => String(ct.vmid));
        
        // Cari yang ada di DB tapi TIDAK ADA di Proxmox
        const staleInstances = instances.filter(inst => !proxmoxVmids.includes(String(inst.vmid)));

        if (staleInstances.length > 0) {
          // HANYA HAPUS jika kita yakin Proxmox benar-benar tidak punya VM tersebut
          // (Opsional: Bisa tambahkan pengecekan per-VM di sini untuk memastikan)
          console.warn(`[SYNC] Menemukan ${staleInstances.length} data yang mungkin basi.`);
        }
      }
    } catch (e) {
      console.error('[SYNC ERROR]: Proxmox API mungkin sibuk, melewati sinkronisasi.');
    }

    return res.json({ instances });
  } catch (error: any) {
    return res.json({ instances: [] });
  }
};

export const getInstanceStatus = async (req: AuthRequest, res: Response): Promise<any> => {
  const userId = req.user?.userId;
  const { id } = req.params;
  
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const instance = await prisma.instance.findUnique({ where: { id: id as string } });
    if (!instance || instance.userId !== userId) return res.status(404).json({ error: 'Not found' });

    try {
      const status = await proxmoxService.getVMStatus(instance.node, instance.vmid, 'lxc');
      return res.json({ status });
    } catch (proxmoxError: any) {
      // JANGAN HAPUS OTOMATIS jika Proxmox error 500 (bisa jadi cuma busy)
      if (proxmoxError.response?.status === 404 || proxmoxError.message?.includes("not exist")) {
        // Hanya hapus jika Proxmox eksplisit bilang NOT FOUND (404)
        console.warn(`[STATUS] VPS-${instance.vmid} tidak ditemukan di Proxmox, menghapus dari DB...`);
        await prisma.instance.delete({ where: { id: instance.id } }).catch(() => {});
        return res.status(404).json({ error: 'Deleted from Proxmox' });
      }
      
      // Jika error lain (500, timeout, dll), kirim status unknown saja, JANGAN HAPUS
      return res.json({ status: { status: 'unknown' } });
    }
  } catch (error: any) {
    return res.status(404).json({ error: 'Not found' });
  }
};

export const deleteInstance = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Gunakan deleteMany agar jika tidak ada yang ditemukan, tidak melempar error
    const result = await prisma.instance.deleteMany({ 
      where: { 
        id: id as string, 
        userId: userId 
      } 
    });
    
    return res.json({ message: 'Deleted', count: result.count });
  } catch (error) {
    return res.status(200).json({ message: 'Already gone' }); // Tetap anggap sukses
  }
};

// MENGHAPUS TOTAL (Proxmox + DB)
export const destroyInstance = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const instance = await prisma.instance.findUnique({ where: { id: id as string } });
    if (!instance || instance.userId !== userId) return res.status(404).json({ error: 'Not found' });

    // 1. Coba matikan dulu (Proxmox tidak bisa hapus CT yang menyala)
    try {
      await proxmoxService.stopVM(instance.node, instance.vmid, 'lxc');
      // Tunggu sebentar agar proses stop selesai
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (e) {
      // Abaikan jika sudah mati
    }

    // 2. Hapus dari Proxmox
    try {
      await proxmoxService.deleteLXC(instance.node, instance.vmid);
    } catch (proxmoxError: any) {
      console.warn('[Destroy]: Gagal hapus di Proxmox, mungkin sudah tidak ada.');
    }

    // 3. Hapus dari Database
    await prisma.instance.delete({ where: { id: instance.id } });

    return res.json({ message: 'Instance destroyed permanently' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Gagal memusnahkan VPS' });
  }
};

export const startInstance = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const instance = await prisma.instance.findUnique({ where: { id: id as string } });
    if (!instance || instance.userId !== userId) return res.status(403).json({ error: 'Denied' });
    await proxmoxService.startVM(instance.node, instance.vmid, 'lxc');
    return res.json({ message: 'OK' });
  } catch (error) {
    return res.status(500).json({ error: 'Fail' });
  }
};

export const stopInstance = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const instance = await prisma.instance.findUnique({ where: { id: id as string } });
    if (!instance || instance.userId !== userId) return res.status(403).json({ error: 'Denied' });
    await proxmoxService.stopVM(instance.node, instance.vmid, 'lxc');
    return res.json({ message: 'OK' });
  } catch (error) {
    return res.status(500).json({ error: 'Fail' });
  }
};

export const createInstance = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;
    const { planName, price, ram, cpu, disk } = req.body;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Parse specs dari string (misal: "4GB" -> 4096, "1 Core" -> 1)
    const ramMB = parseInt(ram) * (ram.includes('GB') ? 1024 : 1) || 1024;
    const cpuCores = parseInt(cpu) || 1;
    const diskGB = parseInt(disk) || 20;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');
      if (user.credits < price) throw new Error('Insufficient funds');

      await tx.user.update({ where: { id: userId }, data: { credits: { decrement: price } } });
      
      let product = await tx.product.findFirst({ where: { name: planName } });
      if (!product) {
        product = await tx.product.create({ 
          data: { name: planName, price, vcpu: cpuCores, ram: ramMB, disk: diskGB } 
        });
      }

      const newVmid = await proxmoxService.getNextVMID();
      const node = process.env.PROXMOX_NODE || 'nzx';
      const template = process.env.PROXMOX_LXC_TEMPLATE || '';
      const storage = process.env.PROXMOX_LXC_STORAGE || 'local-lvm';
      
      const staticIp = `10.10.5.${newVmid}`;
      const sshPort = 10000 + newVmid;

      await proxmoxService.createLXC(node, { 
        vmid: newVmid, 
        ostemplate: template, 
        storage, 
        rootfs: `${storage}:${product.disk}`, 
        hostname: `vps-${newVmid}`, 
        password: 'trial-vps-123', 
        cores: product.vcpu, 
        memory: product.ram, 
        net0: `name=eth0,bridge=vmbr0,ip=${staticIp}/24,gw=10.10.5.1,firewall=1`, 
        unprivileged: 1, 
        features: 'nesting=1', 
        start: 0 
      });

      // OTOMATISASI SSH BRIDGE: Tambahkan aturan IPTables di Proxmox Host
      try {
        const iptablesCmd = `iptables -t nat -A PREROUTING -p tcp --dport ${sshPort} -j DNAT --to-destination ${staticIp}:22`;
        await proxmoxService.executeSSHCommand(iptablesCmd);
        console.log(`[SSH-BRIDGE] NAT rule added for port ${sshPort} to ${staticIp}:22`);
        
        // OTOMATISASI FRP: Update frpc.toml di host Proxmox
        await proxmoxService.addFRPProxy(newVmid, staticIp);

        // OTOMATISASI SSH CONFIG (Inside Container):
        // Tunggu 20 detik agar OS benar-benar stabil
        setTimeout(async () => {
          try {
            console.log(`[SSH-CONFIG] Memulai konfigurasi otomatis untuk VPS-${newVmid}...`);
            
            // Perintah "Brute Force" yang lebih simpel: 
            // 1. Hapus baris lama (jika ada) agar tidak duplikat
            // 2. Tambahkan baris baru di akhir file
            // 3. Paksa ganti password
            // 4. Restart SSH
            const cmd = `pct exec ${newVmid} -- sh -c "sed -i '/PermitRootLogin/d' /etc/ssh/sshd_config && sed -i '/PasswordAuthentication/d' /etc/ssh/sshd_config && echo 'PermitRootLogin yes' >> /etc/ssh/sshd_config && echo 'PasswordAuthentication yes' >> /etc/ssh/sshd_config && echo 'root:trial-vps-123' | chpasswd && (systemctl restart ssh || service ssh restart)"`;
            
            const output = await proxmoxService.executeSSHCommand(cmd);
            console.log(`[SSH-CONFIG] Hasil eksekusi VPS-${newVmid}: ${output || 'Success (No output)'}`);
          } catch (e: any) {
            console.error(`[SSH-CONFIG] FATAL ERROR VPS-${newVmid}: ${e.message}`);
          }
        }, 20000);
      } catch (sshErr: any) {
        console.error(`[SSH-FRP-BRIDGE] Gagal setup tunnel: ${sshErr.message}`);
      }

      return await tx.instance.create({ 
        data: { 
          userId: userId, 
          productId: product.id, 
          vmid: newVmid, 
          node, 
          status: 'provisioning', 
          ipv4: staticIp, 
          password: 'trial-vps-123' 
        }, 
        include: { product: true } 
      });
    });
    return res.status(201).json({ instance: result });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const getInstanceConsole = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const instance = await prisma.instance.findUnique({ where: { id: id as string } });
    if (!instance || instance.userId !== userId) return res.status(403).json({ error: 'Forbidden' });
    
    // URL fallback jika user ingin buka langsung di Proxmox
    const consoleUrl = await proxmoxService.getConsoleUrl(instance.node, instance.vmid);
    
    return res.json({ consoleUrl, node: instance.node, vmid: instance.vmid });
  } catch (error) {
    return res.status(500).json({ error: 'Fail' });
  }
};
