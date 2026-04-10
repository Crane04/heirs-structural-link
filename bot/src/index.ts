import 'dotenv/config';
import express from 'express';
import webhookRouter from './webhook';
import apiRouter from './api';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: false })); // Required for Twilio webhooks

app.use('/webhook', webhookRouter);
app.use('/api', apiRouter);

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'heirs-bot' }));

app.listen(PORT, () => {
  console.log(`[Bot] Running on port ${PORT}`);
});
