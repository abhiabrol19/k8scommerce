import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import { OrderCreatedEvent, OrderStatus, Subjects } from "@arktastic/common";
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from "../../../models/order";

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'alskdfj',
    expiresAt: 'alskdjf',
    product: {
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 10,
    }
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('replicates the order info', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(order).toBeDefined();

  expect(order!.price).toEqual(data.product.price);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});