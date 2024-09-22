import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('Returns an error if the product does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  console.log(id);
  const res = await request(app)
    .get(`/api/products/${id}`)
    .send()
    .expect(404);

    console.log(res.body);
});

it('Returns the product if the product exists', async () => {
  const title = 'concert';
  const price = 20;

  const cookie = global.signin();
  
  if (!cookie) {
    throw new Error('Signin failed');
  }

  const response = await request(app)
    .post('/api/products')
    .set('Cookie', cookie)
    .send({
      title,
      price
    })
    .expect(201);

  const productResponse = await request(app)
    .get(`/api/products/${response.body.id}`)
    .send()
    .expect(200);

  expect(productResponse.body.title).toEqual(title);
  expect(productResponse.body.price).toEqual(price);
});

