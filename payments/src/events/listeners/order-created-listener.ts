import { Listener, OrderCreatedEvent, Subjects } from "@arktastic/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "../queue-group-name";
import { Order } from "../../models/order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const existingOrder = await Order.findById(data.id);

    if (existingOrder) {
      if (existingOrder.version === data.version) {
        console.log(`Order with ID ${data.id} already exists`);
        msg.ack(); // Acknowledge the message to prevent redelivery
        return;
      }
    }
    
    const order = Order.build({
      id: data.id,
      version: data.version,
      userId: data.userId,
      price: data.product.price,
      status: data.status,
    });
    await order.save();
    console.log('Order created:', order);

    msg.ack();
  }
}
    