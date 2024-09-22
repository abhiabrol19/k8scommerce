import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@arktastic/common';
import stripe from '../../stripe';
import { Payment } from '../../models/payment';

//jest.mock('../../stripe');

it('returns a 404 on a non existing order', async () => {
  const user = global.signin();
  if (!user) {
    throw new Error('User not found');
  }

  await request(app)
    .post('/api/payments')
    .set('Cookie', user)
    .send({
      token: 'asdasd',
      orderId: new mongoose.Types.ObjectId().toHexString()
    })
    .expect(404);
});

it('returns a 401 when purchasing an order that does not belong to the user', async () => {

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created
  });

  await order.save();

  const user = global.signin();
  if (!user) {
    throw new Error('User not found');
  }

  await request(app)
    .post('/api/payments')
    .set('Cookie', user)
    .send({
      token: 'asdasd',
      orderId: order.id
    })
    .expect(401);

});

it('returns a 400 when purchasing a cancelled order', async () => {

    const userId = new mongoose.Types.ObjectId().toHexString();
    
    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      userId,
      version: 0,
      price: 20,
      status: OrderStatus.Cancelled
    });
  
    await order.save();
  
    const user = global.signin(userId);
    if (!user) {
      throw new Error('User not found');
    }
  
    await request(app)
      .post('/api/payments')
      .set('Cookie', user)
      .send({
        token: 'asdasd',
        orderId: order.id
      })
      .expect(400);
});

it('returns a 204 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 100000);
    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      userId,
      version: 0,
      price,
      status: OrderStatus.Created
    });
  
    await order.save();
  
    const user = global.signin(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await request(app)
      .post('/api/payments')
      .set('Cookie', user)
      .send({
        token: 'pm_card_visa',
        orderId: order.id
      })
      .expect(201);

    const stripeCharges = await stripe.paymentIntents.list({ limit: 50 });

    const stripeCharge = stripeCharges.data.find(charge => {
      return charge.amount === price * 100;
    });

    expect(stripeCharge).toBeDefined();
    expect(stripeCharge!.currency).toEqual('usd');
    //expect(stripeCharge!.payment_method).toEqual('pm_card_visa');
    expect(stripeCharge!.description).toEqual('Test payment');
    expect(stripeCharge!.status).toEqual('succeeded');

    const payment = await Payment.findOne({
      orderId: order.id,
      stripeId: stripeCharge!.id
    });

    expect(payment).not.toBeNull();

    });