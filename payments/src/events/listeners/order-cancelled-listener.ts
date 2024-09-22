import { Listener, OrderCancelledEvent, Subjects, OrderStatus } from "@arktastic/common";
import { queueGroupName } from "../queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const order = await Order.findByEvent(data);

    if (!order) {
      throw new Error('Order not found');
    } else {
      if (order.status === OrderStatus.Complete) {
        throw new Error('Cannot cancel a completed order');
      }
      else if (order.status === OrderStatus.Cancelled) {
        console.log(`Order with ID ${data.id} already cancelled`);
        msg.ack();
        return;
      }
    }

    order.set({ status: OrderStatus.Cancelled });

    await order.save();

    msg.ack();
  }
}

