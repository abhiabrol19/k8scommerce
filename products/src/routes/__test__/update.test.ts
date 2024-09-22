import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Product } from '../../models/products';

it('returns 404 if product does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const cookie = global.signin();
  if (!cookie) {
    throw new Error('Signin failed');
  }
  await request(app)
    .put(`/api/products/${id}`)
    .set('Cookie', cookie)
    .send({
      title: 'concert',
      price: 20
    })
    .expect(404);
});

it('returns 401 if user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/products/${id}`)
    .send({
      title: 'concert',
      price: 20
    })
    .expect(401);
});

it('returns 401 if user does not own the product', async () => {
  const cookie = global.signin();
  if (!cookie) {
    throw new Error('Signin failed');
  }

  const title = 'concert';
  const price = 20;

  const res = await request(app)
    .post('/api/products')
    .set('Cookie', cookie)
    .send({
      title: title,
      price: price
    });

    const cookie2 = global.signin();
    if (!cookie2) {
      throw new Error('Signin failed');
    }

  await request(app)
    .put(`/api/products/${res.body.id}`)
    .set('Cookie', cookie2)
    .send({
      title: 'concert',
      price: 1000
    })
    .expect(401);
  
});

it('returns 400 if user provides invalid title or price', async () => {
  const cookie = global.signin();
  if (!cookie) {
    throw new Error('Signin failed');
  }

  const title = 'concert';
  const price = 20;

  const res = await request(app)
    .post('/api/products')
    .set('Cookie', cookie)
    .send({
      title: title,
      price: price
    });

  await request(app)
    .put(`/api/products/${res.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 20
    })
    .expect(400);

  await request(app)
    .put(`/api/products/${res.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'concert',
      price: -20
    })
    .expect(400);

  const productResponse = await request(app)
    .get(`/api/products/${res.body.id}`)
    .send()
    .expect(200);

  expect(productResponse.body.title).toEqual(title);
  expect(productResponse.body.price).toEqual(price);

});

it('updates the product provided valid inputs', async () => {
  const cookie = global.signin();
  if (!cookie) {
    throw new Error('Signin failed');
  }

  const title = 'concert';
  const price = 20;

  const res = await request(app)
    .post('/api/products')
    .set('Cookie', cookie)
    .send({
      title: title,
      price: price
    });

  await request(app)
    .put(`/api/products/${res.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new concert',
      price: 100
    })
    .expect(200);

  const productResponse = await request(app)
    .get(`/api/products/${res.body.id}`)
    .send();

  expect(productResponse.body.title).toEqual('new concert');
  expect(productResponse.body.price).toEqual(100);
});

it('publishes an event', async () => {
  const cookie = global.signin();
  if (!cookie) {
    throw new Error('Signin failed');
  }

  const title = 'concert';
  const price = 20;

  const res = await request(app)
    .post('/api/products')
    .set('Cookie', cookie)
    .send({
      title: title,
      price: price
    });

  await request(app)
    .put(`/api/products/${res.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new concert',
      price: 100
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates if the product is reserved', async () => {
  const cookie = global.signin();
  if (!cookie) {
    throw new Error('Signin failed');
  }

  const title = 'concert';
  const price = 20;

  const res = await request(app)
    .post('/api/products')
    .set('Cookie', cookie)
    .send({
      title: title,
      price: price
    });

  const product = await Product.findById(res.body.id);
  product!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });

  await product!.save();

  await request(app)
    .put(`/api/products/${res.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new concert',
      price: 100
    })
    .expect(400);

  });