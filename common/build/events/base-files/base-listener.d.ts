import { Message, Stan } from 'node-nats-streaming';
import { Subjects } from '../subjects';
interface Event {
    subject: Subjects;
    data: any;
}
export declare abstract class Listener<Type extends Event> {
    abstract subject: Type['subject'];
    abstract queueGroupName: string;
    abstract onMessage(data: Type['data'], msg: Message): void;
    protected client: Stan;
    protected ackWait: number;
    constructor(client: Stan);
    subscriptionOptions(): import("node-nats-streaming").SubscriptionOptions;
    listen(): void;
    parseMessage(msg: Message): any;
}
export {};
