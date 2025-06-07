// server/payme/webhook-routes.ts
import express, { Request, Response, Router } from 'express';
import { PaymeWebhookController } from './webhook-controller';

export function setupPaymeWebhookRoutes(): Router {
  const router = express.Router();
  const paymeController = new PaymeWebhookController();

  // Single endpoint to handle all Payme methods
  router.post('/api/payment/webhook', async (req: Request, res: Response) => {
    try {
      // For the first iteration, we skip header authentication as mentioned
      // Later we'll add proper authentication
      
      // Process the webhook
      return await paymeController.handleWebhook(req, res);
    } catch (error: any) {
      console.error('Payme webhook error:', error);
      
      return res.status(200).json({
        error: {
          code: -31008,
          message: {
            ru: 'Внутренняя ошибка сервера',
            uz: 'Serverdagi ichki xatolik',
            en: 'Internal server error'
          }
        },
        id: req.body.id || 0
      });
    }
  });

  // Client-facing endpoint to redirect users to Payme checkout
  router.get('/api/payment/checkout/:userId', (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      if (!userId || isNaN(Number(userId))) {
        return res.status(400).send('Invalid user ID');
      }
      
      // For our platform, we have a fixed amount for payment
      // The amount should be specified in tiyins (1 UZS = 100 tiyins)
      const amount = 5000000; // 50,000 UZS in tiyins
      
      // Generate Payme URL using the user ID as the order ID
      const paymeUrl = paymeController.generatePaymeUrl(userId, amount);
      
      // Redirect user to Payme checkout
      return res.redirect(paymeUrl);
    } catch (error: any) {
      console.error('Payment redirect error:', error);
      return res.status(500).send('Error redirecting to payment page');
    }
  });

  return router;
}