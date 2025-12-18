import express, {Request, Response} from 'express';
import * as VoucherControllers from '../controllers/vouchers/voucherController.js';

const router = express.Router();

//http://localhost:3000/api/vouchers/client/:clientId
router.get('/vouchers/client/:clientId', async (req: Request, res: Response) => {
    const clientId = parseInt(req.params.clientId as string);
    const vouchers = await VoucherControllers.getAllVouchersClient({ clientId });
    res.status(200).json(vouchers);
});

//http://localhost:3000/api/vouchers/:voucherId/client/:clientId
router.get('/vouchers/:voucherId/client/:clientId', async (req: Request, res: Response) => {
    const voucherId = parseInt(req.params.voucherId as string);
    const clientId = parseInt(req.params.clientId as string);
    const voucher = await VoucherControllers.getVoucherByIdAndClient({ voucherId }, { clientId });
    res.status(200).json(voucher);
});

//http://localhost:3000/api/vouchers
router.post('/vouchers', async (req: Request, res: Response) => {
    const newVoucher = req.body;
    const createdVoucher = await VoucherControllers.createVoucher(newVoucher);
    res.status(201).json(createdVoucher);     
});

//http://localhost:3000/api/vouchers
router.put('/vouchers', async (req: Request, res: Response) => {
    const prevVoucher = req.body;
    const updatedVoucher = await VoucherControllers.updateVoucher(prevVoucher);
    res.status(200).json(updatedVoucher);
});

//http://localhost:3000/api/vouchers/:voucherId
router.delete('/vouchers/:voucherId', async (req: Request, res: Response) => {
    const voucherId = parseInt(req.params.voucherId as string);
    await VoucherControllers.deleteVoucher({ voucherId });
    res.status(204).send();
});

export default router;