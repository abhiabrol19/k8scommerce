import request from 'supertest';
import { app } from '../../../app';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Product } from '../../../models/products';
import mongoose from 'mongoose';
import { OrderCancelledEvent, OrderStatus } from '@arktastic/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const product = Product.build({
    title: 'concert',
    price: 99,
    userId: 'asdf',
  });
  const orderId = new mongoose.Types.ObjectId().toHexString();
  product.set({ orderId });
  await product.save();

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    product: {
      id: product.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, product, data, msg };
};

it('updates the product, publishes an event, and acks the message', async () => {
  const { listener, product, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedProduct = await Product.findById(product.id);

  expect(updatedProduct!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});