import { Publisher, Subjects, PaymentCreatedEvent } from '@arktastic/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}