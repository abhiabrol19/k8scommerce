import nats from 'node-nats-streaming';
import { ProductCreatedPublisher } from './events/product-created-publisher';

console.clear();

const stan = nats.connect('pangea', 'abc', {
  url: 'http://localhost:4222'
});

stan.on('connect', async () => {
  console.log('Publisher connected to NATS');

  // const data = JSON.stringify({
  //   id: '123',
  //   title: 'concert',
  //   price: 20
  // });

  // stan.publish('product:created', data, () => {
  //   console.log('Event published');
  // });

  const publisher = new ProductCreatedPublisher(stan);
  try {
    await publisher.publish({
      id: '123',
      title: 'concert',
      price: 20
    });
  } catch (err) {
    console.error(err);
  }
});