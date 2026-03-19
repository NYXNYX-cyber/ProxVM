import axios, { AxiosInstance } from 'axios';
import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const PROXMOX_URL = process.env.PROXMOX_URL || '';
const PROXMOX_TOKEN_ID = process.env.PROXMOX_TOKEN_ID || ''; 
const PROXMOX_SECRET = process.env.PROXMOX_SECRET || '';

class ProxmoxService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: PROXMOX_URL,
      headers: {
        Authorization: `PVEAPIToken=${PROXMOX_TOKEN_ID}=${PROXMOX_SECRET}`,
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });
  }

  async getNodes() {
    const response = await this.client.get('/nodes');
    return response.data.data;
  }

  async getLXCs(node: string) {
    const response = await this.client.get(`/nodes/${node}/lxc`);
    return response.data.data;
  }

  async getVMStatus(node: string, vmid: number, type: string = 'lxc') {
    const response = await this.client.get(`/nodes/${node}/${type}/${vmid}/status/current`);
    return response.data.data;
  }

  async getNextVMID(): Promise<number> {
    const response = await this.client.get('/cluster/nextid');
    return parseInt(response.data.data);
  }

  async startVM(node: string, vmid: number, type: string = 'lxc') {
    const response = await this.client.post(`/nodes/${node}/${type}/${vmid}/status/start`);
    return response.data.data;
  }

  async stopVM(node: string, vmid: number, type: string = 'lxc') {
    const response = await this.client.post(`/nodes/${node}/${type}/${vmid}/status/stop`);
    return response.data.data;
  }

  async createLXC(node: string, params: any) {
    const response = await this.client.post(`/nodes/${node}/lxc`, params);
    return response.data.data;
  }

  async deleteLXC(node: string, vmid: number) {
    const response = await this.client.delete(`/nodes/${node}/lxc/${vmid}`);
    return response.data.data;
  }

  // Fallback console URL for UI
  async getConsoleUrl(node: string, vmid: number) {
    const baseUrl = PROXMOX_URL.split('/api2')[0];
    return `${baseUrl}/?console=lxc&xtermjs=1&vmid=${vmid}&node=${node}`;
  }
}

export const proxmoxService = new ProxmoxService();
