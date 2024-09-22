import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Product } from '../../models/product';
import mongoose from 'mongoose';

it('fetches orders for a particular user', async () => {
  // Create three products
  const productOne = Product.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Product One',
    price: 10
  });
  await productOne.save();

  const productTwo = Product.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Product Two',
    price: 20
  });
  await productTwo.save();

  const productThree = Product.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Product Three',
    price: 30
  });
  await productThree.save();

  const cookie1 = global.signin();
  
  if (!cookie1) {
    throw new Error('Signin failed');
  }

  const cookie2 = global.signin();
  
  if (!cookie2) {
    throw new Error('Signin failed');
  }

  // Create one order as User #1
  await request(app)
    .post('/api/orders')
    .set('Cookie', cookie1)
    .send({ productId: productOne.id })
    .expect(201);

  // Create two orders as User #2
  const { body: orderOne } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie2)
    .send({ productId: productTwo.id })
    .expect(201);
  
  const { body: orderTwo } = await request(app) 
    .post('/api/orders')
    .set('Cookie', cookie2)
    .send({ productId: productThree.id })
    .expect(201);

  // Make request to get orders for User #2
  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', cookie2)
    .expect(200);

  // Make sure we only got the orders for User #2
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderOne.id);
  expect(response.body[1].id).toEqual(orderTwo.id);

  expect(response.body[0].product.price).toEqual(20);
  expect(response.body[1].product.price).toEqual(30);

  expect(response.body[0].product.title).toEqual('Product Two');
  expect(response.body[1].product.title).toEqual('Product Three');

});
  