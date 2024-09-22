import { Publisher, Subjects, ProductCreatedEvent } from '@arktastic/common';

export class ProductCreatedPublisher extends Publisher<ProductCreatedEvent> {
  subject: Subjects.ProductCreated = Subjects.ProductCreated;
}