import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
export declare const getNodes: (req: AuthRequest, res: Response) => Promise<any>;
export declare const getUserInstances: (req: AuthRequest, res: Response) => Promise<any>;
export declare const getInstanceStatus: (req: AuthRequest, res: Response) => Promise<any>;
export declare const deleteInstance: (req: AuthRequest, res: Response) => Promise<any>;
export declare const destroyInstance: (req: AuthRequest, res: Response) => Promise<any>;
export declare const startInstance: (req: AuthRequest, res: Response) => Promise<any>;
export declare const stopInstance: (req: AuthRequest, res: Response) => Promise<any>;
export declare const createInstance: (req: AuthRequest, res: Response) => Promise<any>;
export declare const getInstanceConsole: (req: AuthRequest, res: Response) => Promise<any>;
//# sourceMappingURL=vps.controller.d.ts.map