import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@arktastic/common';
import { Product } from '../models/products';
import { ProductCreatedPublisher } from '../events/publishers/product-created-publisher';
import { natsWrapper } from '../nats-wrapper';
import mongoose from 'mongoose';

const router = express.Router();

router.post('/api/products', requireAuth, [
  body('title')
    .not()
    .isEmpty()
    .withMessage('Title is required'),
  body('price')
    .isFloat({ gt: 0 })
    .withMessage('Price must be greater than 0')
], validateRequest, async (req: Request, res: Response) => {
  // const session = await mongoose.startSession();
  // session.startTransaction();
  // try {
    const { title, price } = req.body;

    const product = Product.build({
      title,
      price,
      userId: req.currentUser!.id
    });

    await product.save();

    await new ProductCreatedPublisher(natsWrapper.client).publish({
      id: product.id,
      version: product.version,
      title: product.title,
      price: product.price,
      userId: product.userId
    });

    //await session.commitTransaction();

    res.status(201).send(product);
  // } catch (err) {
  //   await session.abortTransaction();
  //   throw err;
  // } finally {
  //   session.endSession();
  // }
});

export { router as createProductRouter };