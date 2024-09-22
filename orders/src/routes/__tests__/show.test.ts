import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Product } from '../../models/product';
import mongoose from 'mongoose';

it('fetches the order', async () => {
  // Create a product
  const product = Product.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });
  await product.save();

  const user = global.signin();
  if (!user) {
    throw new Error('User not found');
  }

  // Make a request to build an order with this product
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ productId: product.id })
    .expect(201);

  // Make request to fetch the order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it('returns an error if one user tries to fetch another users order', async () => {
  // Create a product
  const product = Product.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });
  await product.save();

  const user = global.signin();
  if (!user) {
    throw new Error('User not found');
  }

  // Make a request to build an order with this product
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ productId: product.id })
    .expect(201);

  // Make request to fetch the order with a different user
  const user2 = global.signin();
  if (!user2) {
    throw new Error('User not found');
  }
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user2)
    .send()
    .expect(401);
});

it('returns an error if the order does not exist', async () => {
  const user = global.signin();
  if (!user) {
    throw new Error('User not found');
  }
  const orderId = '5f7d9a7e9b1e8b001f1f2f1d';
  await request(app)
    .get(`/api/orders/${orderId}`)
    .set('Cookie', user)
    .send()
    .expect(404);
});

it('returns an error if the orderId is not a valid MongoDB ID', async () => {
  const user = global.signin();
  if (!user) {
    throw new Error('User not found');
  }
  const invalidOrderId = 'invalid-id';

  const response = await request(app)
    .get(`/api/orders/${invalidOrderId}`)
    .set('Cookie', user)
    .send();

  expect(response.status).toBe(400);
  expect(response.body.errors[0].message).toBe('Order Id must be valid');
});
