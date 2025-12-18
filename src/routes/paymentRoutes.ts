import express, { Request, Response } from 'express';
import * as PaymentControllers from '../controllers/payment/paymentController.js';

const router = express.Router();

//http://localhost:3000/api/payments/voucher/:id
router.get('/payments/voucher/:id', async (req: Request, res: Response) => {
    const voucherId = parseInt(req.params.id as string);
    const payments = await PaymentControllers.getAllPaymentsOfVoucher({ voucherId });
    res.status(200).json(payments);
});

//http://localhost:3000/api/payments/:id
router.get('/payments/:id', async (req: Request, res: Response) => {
    const paymentId = parseInt(req.params.id as string);
    const payment = await PaymentControllers.getPaymentById({ paymentId });
    res.status(200).json(payment);
});

//http://localhost:3000/api/payments
router.post('/payments', async (req: Request, res: Response) => {
    const newPayment = req.body;
    const createdPayment = await PaymentControllers.createPayment(newPayment);
    res.status(201).json(createdPayment);     
});

//http://localhost:3000/api/payments/process
router.post('/payments/process', async (req: Request, res: Response) => {
    try {
        const { voucherId, amount } = req.body;
        
        if (!voucherId || !amount) return res.status(400).json({ error: 'voucherId y amount son requeridos' });
        
        const result = await PaymentControllers.processPayment(
            { voucherId },
            amount
        );
        
        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

//http://localhost:3000/api/payments
router.put('/payments', async (req: Request, res: Response) => {
    const prevPayment = req.body;
    const updatedPayment = await PaymentControllers.updatePayment(prevPayment);
    res.status(200).json(updatedPayment);
});

//http://localhost:3000/api/payments/:id
router.delete('/payments/:id', async (req: Request, res: Response) => {
    const paymentId = parseInt(req.params.id as string);
    await PaymentControllers.deletePayment({ paymentId });
    res.status(204).send();
});

export default router;