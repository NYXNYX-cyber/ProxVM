declare class ProxmoxService {
    private client;
    constructor();
    getClusterStatus(): Promise<any>;
    getNodes(): Promise<any>;
    getVMs(node: string): Promise<any>;
    getLXCs(node: string): Promise<any>;
    getNextVMID(): Promise<number>;
    cloneVM(node: string, vmid: number, newid: number, name: string): Promise<any>;
    startVM(node: string, vmid: number, type?: 'qemu' | 'lxc'): Promise<any>;
    stopVM(node: string, vmid: number, type?: 'qemu' | 'lxc'): Promise<any>;
    getVMStatus(node: string, vmid: number, type?: 'qemu' | 'lxc'): Promise<any>;
    createLXC(node: string, params: any): Promise<any>;
    deleteLXC(node: string, vmid: number): Promise<any>;
    getVncProxy(node: string, vmid: number, type?: 'qemu' | 'lxc'): Promise<any>;
}
export declare const proxmoxService: ProxmoxService;
export {};
//# sourceMappingURL=proxmox.service.d.ts.map