import amqp from 'amqplib';

const RABBITMQ_URL = 'amqp://5.75.206.157:5672';

let channel;
export default async function connectToChannel() {
    if (channel) return channel;

    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        console.log('Connected to RabbitMQ');
        return channel;
    } catch (error) {
        console.error('Cannot connect to RabbitMQ:', error);
        throw error;
    }
}

export const pushToQueue = async (queue, data) => {
    try {
        const channel = await connectToChannel();
        await channel.assertQueue(queue);

        let bufferData = Buffer.from(JSON.stringify(data));

        return channel.sendToQueue(queue, bufferData);
    } catch (error) {
        console.log(error.message);
    }
};

export const pushToQueue2 = async (queue, data) => {
    try {
        const channel = await connectToChannel();
        await channel.assertQueue(queue, { durable: true });

        const bufferData = Buffer.from(JSON.stringify(data));

        return channel.sendToQueue(queue, bufferData, { persistent: true });
    } catch (error) {
        console.error('Error pushing to queue:', error.message);
    }
};

await connectToChannel();
