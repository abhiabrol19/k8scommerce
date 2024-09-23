import { Stan } from 'node-nats-streaming';
import { Subjects } from '../subjects';

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Publisher<Type extends Event> {
  abstract subject: Type['subject'];
  protected client: Stan;

  constructor(client: Stan) {
    this.client = client;
  }

  publish(data: Type['data']) {
    return new Promise<void>((resolve, reject) => {
      this.client.publish(
        this.subject, 
        JSON.stringify(data), 
        (err) => {
          if (err) {
            return reject(err);
          }
          console.log('Event published to subject', this.subject);
          resolve();
      });
    });
  }
}