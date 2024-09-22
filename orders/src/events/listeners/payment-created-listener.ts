import { Subjects, Listener, PaymentCreatedEvent } from '@arktastic/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Order, OrderStatus } from '../../models/order';
import { OrderUpdatedPublisher } from '../publishers/order-updated-publisher';
import { Product } from '../../models/product';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error('Order not found');
    } else if (order.status === OrderStatus.Complete) {
      throw new Error('Order already completed');
    }

    order.set({
      status: OrderStatus.Complete,
    });

    await order.save();

    await new OrderUpdatedPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      product: {
        id: order.product.id,
        price: order.product.price,
      },
    });

    msg.ack();
  }
}
