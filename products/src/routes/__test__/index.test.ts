import request from 'supertest';
import { app } from '../../app';

const createProduct = () => {
  const cookie = global.signin();
  if (!cookie) {
    throw new Error('Signin failed');
  }
  return request(app)
    .post('/api/products')
    .set('Cookie', cookie)
    .send({
      title: 'concert',
      price: 20
    });
}

it('Can fetch a list of products', async () => {
  await createProduct();
  await createProduct();
  await createProduct();
  await createProduct();

  const response = await request(app)
    .get('/api/products')
    .send()
    .expect(200);

  expect(response.body.length).toEqual(4);
});