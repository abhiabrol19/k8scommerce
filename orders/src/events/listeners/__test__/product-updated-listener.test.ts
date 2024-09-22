import request from "supertest";
import { app } from "../../../app";
import { ProductUpdatedEvent } from "@arktastic/common";
import { ProductUpdatedListener } from "../product-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Product } from "../../../models/product";

const setup = async () => {
  //create an instance of the listener
  const listener = new ProductUpdatedListener(natsWrapper.client);

  const product = Product.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'test',
    price: 10
  });
  await product.save();

  //create a fake data event
  const data: ProductUpdatedEvent['data'] = {
    id: product.id,
    title: 'concert',
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: product.version+1
  };

  //create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, data, msg, product };
};

it('updates and saves a product', async () => {
  const { listener, data, msg, product } = await setup();
  //call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  const updatedProduct = await Product.findById(product.id);
  expect(updatedProduct!.title).toEqual(data.title);
  expect(updatedProduct!.price).toEqual(data.price);
  expect(updatedProduct!.version).toEqual(data.version);
});

it('acks the message', async () => {

  const { listener, data, msg } = await setup();

  //call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  //write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();

});

it('does not call ack if the event has a skipped version number', async () => {
  const { listener, data, msg } = await setup();

  data.version = 100;

  try {
    await listener.onMessage(data, msg);
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled();
});

