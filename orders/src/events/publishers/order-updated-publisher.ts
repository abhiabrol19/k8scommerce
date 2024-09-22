import { Publisher, OrderUpdatedEvent, Subjects } from '@arktastic/common';

export class OrderUpdatedPublisher extends Publisher<OrderUpdatedEvent> {
  subject: Subjects.OrderUpdated = Subjects.OrderUpdated;
}