import { Consumer, Kafka, Partitioners, Producer } from 'kafkajs';

export class KafkaProvider {
  private readonly kafka: Kafka;

  private readonly consumer: Consumer;

  private readonly producer: Producer;

  public constructor() {
    this.kafka = new Kafka({
      clientId: 'my-sender',
      brokers: [`localhost:9092`],
      requestTimeout: 30000,
    });
    this.consumer = this.kafka.consumer({
      groupId: 'my-group',
      allowAutoTopicCreation: true,
      sessionTimeout: 6000,
      heartbeatInterval: 3000,
    });
    this.producer = this.kafka.producer({
      createPartitioner: Partitioners.DefaultPartitioner,
      allowAutoTopicCreation: true,
      idempotent: true,
    });
    (async () => this.init())();
  }

  async init(): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topics: ['receive-data'],
      fromBeginning: true,
    });
    await this.producer.connect();

    return this.consumer.run({
      eachBatchAutoResolve: true,
      eachMessage: async ({ message }) => {
        if (!message.value) {
          throw new Error('Queria conversar mas to sem assunto rsrs');
        }

        console.log(
          '\x1b[1m',
          '\x1b[38;2;255;255;0m',
          message.value?.toString(),
          '\x1b[0m',
        );

        await this.producer.send({
          topic: 'send-data',
          messages: [{ value: 'Receba o melhor do Brasil chefe' }],
        });
      },
    });
  }
}
