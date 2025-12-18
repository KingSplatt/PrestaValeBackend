import express, { Request, Response } from 'express';
import * as CommissionConfigControllers from '../controllers/commisionConfig/commissionConfigController';

const router = express.Router();

//http://localhost:3000/api/commission-configs
router.get('/commission-configs', async (_req: Request, res: Response) => {
    const configs = await CommissionConfigControllers.getAllCommissionConfigs();
    res.status(200).json(configs);
});

//https:localhost:3000/api/commission-configs/:clientId
router.get('/commission-configs/:clientId', async (req: Request, res: Response) => {
    const clientId = parseInt(req.params.clientId as string);
    const config = await CommissionConfigControllers.getCommissionConfigByClientId({ clientId });
    res.status(200).json(config);
});

//https:localhost:3000/api/commission-configs
router.post('/commission-configs', async (req: Request, res: Response) => {
    const newConfig = req.body;
    const createdConfig = await CommissionConfigControllers.createCommissionConfig(newConfig);
    res.status(201).json(createdConfig);     
});

//https:localhost:3000/api/commission-configs
router.put('/commission-configs', async (req: Request, res: Response) => {
    const prevConfig = req.body;
    const updatedConfig = await CommissionConfigControllers.updateCommissionConfig(prevConfig);
    res.status(200).json(updatedConfig);
});

export default router;