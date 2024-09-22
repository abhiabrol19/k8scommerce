import express, { Request, Response } from 'express';
import { requireAuth, NotAuthorizedError, NotFoundError, validateRequest } from '@arktastic/common';
import { Order } from '../models/order';
import { param } from 'express-validator';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/api/orders/:orderId', requireAuth, [
  param('orderId')
  .not()
  .isEmpty()
  .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
  .withMessage('Order Id must be valid')
], validateRequest,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('product');
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    res.send(order);
});

export { router as showOrderRouter };