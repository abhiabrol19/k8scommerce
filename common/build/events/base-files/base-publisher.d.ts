import { Stan } from 'node-nats-streaming';
import { Subjects } from '../subjects';
interface Event {
    subject: Subjects;
    data: any;
}
export declare abstract class Publisher<Type extends Event> {
    abstract subject: Type['subject'];
    protected client: Stan;
    constructor(client: Stan);
    publish(data: Type['data']): Promise<void>;
}
export {};
