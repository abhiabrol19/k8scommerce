import express, { Request, Response } from 'express';
import { requireAuth, validateRequest, NotAuthorizedError, NotFoundError, BadRequestError } from '@arktastic/common';
import { Order, OrderStatus } from '../models/order';
import { param } from 'express-validator';
import mongoose from 'mongoose';
import { natsWrapper } from '../nats-wrapper';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';


const router = express.Router();

router.delete('/api/orders/:orderId', requireAuth, [
  param('orderId')
    .not()
    .isEmpty()
    .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage('Order Id must be valid')
], validateRequest, async (req: Request, res: Response) => {
  //const session = await mongoose.startSession();
  //session.startTransaction();
  //try {
    const order = await Order.findById(req.params.orderId).populate('product');
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Order is already cancelled');
    }

    order.status = OrderStatus.Cancelled;
   //await order.save({ session });
    await order.save();

    await new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      product: {
        id: order.product.id
      },
    });

   // await session.commitTransaction();

    res.status(204).send(order);
  // } catch (err) {
  //   await session.abortTransaction();
  //   throw err;
  // } finally {
  //   session.endSession();
  // }
});

export { router as deleteOrderRouter };