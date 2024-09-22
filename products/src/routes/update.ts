import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, NotFoundError, NotAuthorizedError, BadRequestError } from '@arktastic/common';
import mongoose from 'mongoose';
import { Product } from '../models/products';
import { ProductUpdatedPublisher } from '../events/publishers/product-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put('/api/products/:id', requireAuth, [
  body('title')
  .not()
  .isEmpty()
  .withMessage('Title is required'),
  body('price')
  .isFloat({ gt: 0 })
  .withMessage('Price must be greater than 0')
], validateRequest, async (
  req: Request, 
  res: Response
  ) => {
    // const session = await mongoose.startSession();
    // session.startTransaction();
    // try {
      const product = await Product.findById(req.params.id);
  
      if (!product) {
        throw new NotFoundError();
      }
  
      if (product.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
      }

      if (product.orderId) {
        throw new BadRequestError('Cannot edit a reserved product');
      }
  
      product.set({
        title: req.body.title,
        price: req.body.price
      });
      await product.save();
  
      await new ProductUpdatedPublisher(natsWrapper.client).publish({
        id: product.id,
        version: product.version,
        title: product.title,
        price: product.price,
        userId: product.userId
      });
  
      //await session.commitTransaction();
  
      res.send(product);
    // } catch (err) {
    //   await session.abortTransaction();
    //   throw err;
    // } finally {
    //   session.endSession();
    // }
  });
  
  export { router as updateProductRouter };

