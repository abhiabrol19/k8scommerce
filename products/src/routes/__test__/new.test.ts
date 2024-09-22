import request from 'supertest';
import { app } from '../../app';
import { Product } from '../../models/products';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

it('Has a route handler listening to /api/products for post requests', async () => {
  const response = await request(app)
    .post('/api/products')
    .send({});

  expect(response.status).not.toEqual(404);
});

it('Can only be accessed if the user is signed in', async () => {
  await request(app)
    .post('/api/products')
    .send({})
    .expect(401);
});

it('Returns a status other than 401 if the user is signed in', async () => {

  const cookie = global.signin();
  
  if (!cookie) {
    throw new Error('Signin failed');
  }

  const response = await request(app)
    .post('/api/products')
    .set('Cookie', cookie)
    .send({});

  expect(response.status).not.toEqual(401);
});

it('Returns an error if an invalid title is provided', async () => {
  const productId = new mongoose.Types.ObjectId();

  const cookie = global.signin();
  
  if (!cookie) {
    throw new Error('Signin failed');
  }
  await request(app)
    .post('/api/products')
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 10
    })
    .expect(400);
});

it('Returns an error if an invalid title is provided', async () => {

  const cookie = global.signin();
  
  if (!cookie) {
    throw new Error('Signin failed');
  }
  await request(app)
    .post('/api/products')
    .set('Cookie', cookie)
    .send({
      price: 10
    })
    .expect(400);
});

it('Returns an error if an invalid price is provided', async () => {

  const cookie = global.signin();
  
  if (!cookie) {
    throw new Error('Signin failed');
  }
  await request(app)
    .post('/api/products')
    .set('Cookie', cookie)
    .send({
      title: 'title',
      price: -10
    })
    .expect(400);
});

it('Returns an error if an invalid price is provided', async () => {

  const cookie = global.signin();
  
  if (!cookie) {
    throw new Error('Signin failed');
  }
  await request(app)
    .post('/api/products')
    .set('Cookie', cookie)
    .send({
      title: 'title'
    })
    .expect(400);
});

it('Creates a product with valid inputs', async () => {
  let products = await Product.find({});
  expect(products.length).toEqual(0);

  const cookie = global.signin();
  
  if (!cookie) {
    throw new Error('Signin failed');
  }

  await request(app)
    .post('/api/products')
    .set('Cookie', cookie)
    .send({
      title: 'title',
      price: 10
    })
    .expect(201);

  products = await Product.find({});
  expect(products.length).toEqual(1);

  expect(products[0].price).toEqual(10);
  expect(products[0].title).toEqual('title');

  
});

it('Publishes an event', async () => {
  const cookie = global.signin();
  
  if (!cookie) {
    throw new Error('Signin failed');
  }

  await request(app)
    .post('/api/products')
    .set('Cookie', cookie)
    .send({
      title: 'title',
      price: 10
    })
    .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

});