import express from 'express';
import dotenv from 'dotenv';
import clientRoutes from './routes/clientRoutes';
import voucherRoutes from './routes/voucherRoutes';
import paymentRoutes from './routes/paymentRoutes';

dotenv.config();

const app = express();
const PUERTO_DEFAULT = 3000;
const PORT = process.env.PORT || PUERTO_DEFAULT;

// Middleware
app.use(express.json());

// Rutas
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.use('/api', clientRoutes);
app.use('/api', voucherRoutes);
app.use('/api', paymentRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
});

export default app;
