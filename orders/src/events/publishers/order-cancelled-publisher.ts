import { Publisher, Subjects, OrderCancelledEvent } from "@arktastic/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}