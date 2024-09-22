import { Listener, OrderCancelledEvent, Subjects } from "@arktastic/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Product } from "../../models/products";
import { ProductUpdatedPublisher } from "../publishers/product-updated-publisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const product = await Product.findById(data.product.id);

    if (!product) {
      throw new Error('Product not found');
    }

    product.set({ orderId: undefined });

    await product.save();

    await new ProductUpdatedPublisher(this.client).publish({
      id: product.id,
      title: product.title,
      price: product.price,
      userId: product.userId,
      orderId: product.orderId,
      version: product.version
    });

    msg.ack();

  }
}