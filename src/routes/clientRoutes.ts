import express, { Request, Response } from 'express';
import * as ClientControllers from '../controllers/clients/clientController.js';

const router = express.Router();

//https:localhost:3000/api/clients
router.get('/clients', async (_req: Request, res: Response) => {
    const clients = await ClientControllers.getAllClients();
    res.status(200).json(clients);
});

//https:localhost:3000/api/clients/:id
router.get('/clients/:id', async (req: Request, res: Response) => {
    const clientId = parseInt(req.params.id as string);
    const client = await ClientControllers.getClientById({ clientId });
    res.status(200).json(client);
})

//https:localhost:3000/api/clients
router.post('/clients', async (req: Request, res: Response) => {
    const newClient = req.body;
    const createdClient = await ClientControllers.createClient(newClient);
    res.status(201).json(createdClient);     
});

//https:localhost:3000/api/clients
router.put('/clients', async (req: Request, res: Response) => {
    const prevClient = req.body;
    const updatedClient = await ClientControllers.updateClient(prevClient);
    res.status(200).json(updatedClient);
});

router.delete('/clients/:id', async (req: Request, res: Response) => {
    const clientId = parseInt(req.params.id as string);
    await ClientControllers.deleteClient({ clientId });
    res.status(204).send();
})

export default router;