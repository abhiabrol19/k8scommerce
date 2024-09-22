import express, { Request, Response } from 'express';
import { NotFoundError, BadRequestError, requireAuth, validateRequest } from '@arktastic/common';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { Order } from '../models/order';
import { Product } from '../models/product';
import { OrderStatus } from '@arktastic/common';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';


const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router.post('/api/orders', requireAuth, [
  body('productId')
    .not()
    .isEmpty()
    .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage('Product Id must be provided')
], validateRequest,
async (
  req: Request, 
  res: Response
  ) => {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) { 
      throw new NotFoundError();
    }

    const isReserved = await product.isReserved();
     if (isReserved) {
        throw new BadRequestError('Product is already reserved');
      }

    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);
    //const session = await mongoose.startSession();
    //session.startTransaction();
    //try {
      const newOrder = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        expiresAt: expiration,
        product
      });

      await newOrder.save();

      // Publish an event saying that an order was created
      new OrderCreatedPublisher(natsWrapper.client).publish({
        id: newOrder.id,
        version: newOrder.version,
        status: newOrder.status,
        userId: newOrder.userId,
        expiresAt: newOrder.expiresAt.toISOString(),
        product: {
          id: product.id,
          price: product.price
        },
      });

    //  await session.commitTransaction();

      res.status(201).send(newOrder);
    // } catch (err) {
    //   await session.abortTransaction();
    //   throw err;
    // } finally {
    //   session.endSession();
    // }
});

export { router as newOrderRouter };