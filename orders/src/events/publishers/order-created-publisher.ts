import { Publisher, OrderCreatedEvent, Subjects } from '@arktastic/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}