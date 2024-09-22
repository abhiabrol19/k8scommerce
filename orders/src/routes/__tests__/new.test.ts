import request from 'supertest';
import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';
import { Product } from '../../models/product';
import { Order, OrderStatus } from '../../models/order';
import { OrderCreatedPublisher } from '../../events/publishers/order-created-publisher';

it('Has a route handler listening to /api/orders for post requests', async () => {
  const response = await request(app)
    .post('/api/orders')
    .send({});

  expect(response.status).not.toEqual(404);
});

it('Can only be accessed if the user is signed in', async () => {
  await request(app)
    .post('/api/orders')
    .send({})
    .expect(401);
});

it('Returns a status other than 401 if the user is signed in', async () => {

  const cookie = global.signin();
  
  if (!cookie) {
    throw new Error('Signin failed');
  }

  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({});

  expect(response.status).not.toEqual(401);
});

it('Returns an error if an invalid productId is provided', async () => {

  const cookie = global.signin();
  
  if (!cookie) {
    throw new Error('Signin failed');
  }
  await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({
      productId: ''
    })
    .expect(400);
});

it('Returns an error if the product does not exist', async () => {
  const productId = new mongoose.Types.ObjectId().toHexString();

  const cookie = global.signin();
  
  if (!cookie) {
    throw new Error('Signin failed');
  }
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ productId })
  
  expect(response.status).toEqual(404);
});

it('returns an eror if product is already reserved', async () => {
  const product = Product.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Concert Ticket',
    price: 100
  });
  await product.save();
  const order = Order.build({
    product,
    userId: '1234',
    status: OrderStatus.Created,
    expiresAt: new Date()
  })
  await order.save()

  const cookie = global.signin();
  if (!cookie) {
    throw new Error('Signin failed');
  }
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ productId: product.id })
    .expect(400);
});

it('Reserves a product', async () => {
  const product = Product.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Concert Ticket',
    price: 100
  });
  await product.save();

  const cookie = global.signin();
  
  if (!cookie) {
    throw new Error('Signin failed');
  }

  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ productId: product.id })
    .expect(201);

  expect(response.body.status).toEqual('created');
});

it('Emits an order created event', async () => {
  const product = Product.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Concert Ticket',
    price: 100
  });
  await product.save();

  const cookie = global.signin();
  
  if (!cookie) {
    throw new Error('Signin failed');
  }

  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ productId: product.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});


