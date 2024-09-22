import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Product } from '../../models/product';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';

it('Updates the status of the order to cancelled', async () => {
  const user = global.signin();
  if (!user) {
    throw new Error('User not found');
  }

  const product = Product.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });

  await product.save();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ productId: product.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);
  
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);

});

it('returns an error if one user tries to delete another users order', async () => {
  const user = global.signin();
  if (!user) {
    throw new Error('User not found');
  }

  const product = Product.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });

  await product.save();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ productId: product.id })
    .expect(201);

  const user2 = global.signin();
  if (!user2) {
    throw new Error('User not found');
  }

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user2)
    .send()
    .expect(401);
});

it('returns an error if the order is not found', async () => {
  const user = global.signin();
  if (!user) {
    throw new Error('User not found');
  }

  const orderId = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .delete(`/api/orders/${orderId}`)
    .set('Cookie', user)
    .send()
    .expect(404);
});

it('validates the order id', async () => {
  const user = global.signin();
  if (!user) {
    throw new Error('User not found');
  }

  await request(app)
    .delete('/api/orders/1234')
    .set('Cookie', user)
    .send()
    .expect(400);
});

it('returns an error if the order is already cancelled', async () => {
  const user = global.signin();
  if (!user) {
    throw new Error('User not found');
  }

  const product = Product.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });

  await product.save();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ productId: product.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(400);
});

it('publishes an order cancelled event', async () => {
  const user = global.signin();
  if (!user) {
    throw new Error('User not found');
  }

  const product = Product.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });

  await product.save();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ productId: product.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});