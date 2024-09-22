import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, NotFoundError, BadRequestError, NotAuthorizedError, OrderStatus } from '@arktastic/common';
import { Order } from '../models/order';
import stripe from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/payments', 
  requireAuth,  
  [
    body('orderId')
      .not()
      .isEmpty()
      .withMessage('Order ID must be provided'),
    body('token')
      .not()
      .isEmpty()
      .withMessage('Token must be provided')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for a cancelled order');
    }

    // Create a charge
    try {

      // Create a PaymentIntent with the PaymentMethod ID
      const paymentIntent = await stripe.paymentIntents.create({
        amount: order.price * 100, // Convert price to cents
        currency: 'usd',
        payment_method_types: ['card'],
        description: 'Test payment',
        confirm: true,
        payment_method: token, // Use test card token
        error_on_requires_action: true,
      });

      // Create a payment record
      const payment = Payment.build({
        orderId,
        stripeId: paymentIntent.id,
      });

      await payment.save();

      // Publish a payment created event
      new PaymentCreatedPublisher(natsWrapper.client).publish({
        id: payment.id,
        orderId: payment.orderId,
        stripeId: payment.stripeId,
      });
    
      // Handle successful payment
      console.log('Payment successful');

      res.status(201).send({ id: payment.id });
    } catch (error) {
      console.error('Payment failed');
      console.error(error);
      throw new Error('Payment failed');
    }
});

export { router as createChargeRouter };
    