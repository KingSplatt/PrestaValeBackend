import express, { Request, Response } from 'express';
import * as CommissionConfigControllers from '../controllers/commisionConfig/commissionConfigController';

const router = express.Router();

//http://localhost:3000/api/commission-configs
router.get('/commission-configs', async (_req: Request, res: Response) => {
    const configs = await CommissionConfigControllers.getAllCommissionConfigs();
    res.status(200).json(configs);
});

export default router;