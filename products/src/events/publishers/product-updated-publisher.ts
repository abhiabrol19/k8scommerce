import { Publisher, Subjects, ProductUpdatedEvent } from '@arktastic/common';

export class ProductUpdatedPublisher extends Publisher<ProductUpdatedEvent> {
  subject: Subjects.ProductUpdated = Subjects.ProductUpdated;
}