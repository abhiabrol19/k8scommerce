import { Listener, OrderCreatedEvent, Subjects } from "@arktastic/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Product } from "../../models/products";
import { ProductUpdatedPublisher } from "../publishers/product-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    
    //find the product that the order is reserving
    const product = await Product.findById(data.product.id);

    //if no product throw error
    if (!product) {
      throw new Error('Product not found');
    }

    //mark the product as being reserved by setting its orderId property
    product.set({ orderId: data.id });

    //save the product
    await product.save();
    await new ProductUpdatedPublisher(this.client).publish({
      id: product.id,
      title: product.title,
      price: product.price,
      userId: product.userId,
      orderId: product.orderId,
      version: product.version
    });

    //ack the message
    msg.ack();
  }
}