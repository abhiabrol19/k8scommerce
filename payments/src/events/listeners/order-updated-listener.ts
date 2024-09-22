import { Listener, OrderUpdatedEvent, Subjects, OrderStatus } from "@arktastic/common";
import { queueGroupName } from "../queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

export class OrderUpdatedListener extends Listener<OrderUpdatedEvent> {
  subject: Subjects.OrderUpdated = Subjects.OrderUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderUpdatedEvent['data'], msg: Message) {
    const order = await Order.findByEvent(data);

    if (!order) {
      throw new Error('Order not found');
    } else {
      if (order.status === OrderStatus.Complete) {
        throw new Error('Cannot update a completed order');
      }
      else if (order.status === OrderStatus.Cancelled) {
        throw new Error('Cannot update a cancelled order');
      }
    }

    order.set(data);

    await order.save();

    msg.ack();
  }
}