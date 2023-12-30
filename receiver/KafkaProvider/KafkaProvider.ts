import { Consumer, Kafka, Partitioners, Producer } from 'kafkajs';

export class KafkaProvider {
  private readonly kafka: Kafka;

  private readonly consumer: Consumer;

  private readonly producer: Producer;

  public constructor() {
    this.kafka = new Kafka({
      clientId: 'my-receiver',
      brokers: ['localhost:9092'],
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
  }

  async sendSignal({
    topic,
    messages,
  }: {
    topic: string;
    messages: Array<Record<'value', string>>;
  }): Promise<void> {
    await this.producer.connect();
    await this.producer.send({ topic, messages });
    return this.producer.disconnect();
  }

  /**
   * @description O problema está nesse carinha, ele tenta resolver a promise e retornar a primeira mensagem recebida.
   * Porém, a rodar a mensagem do sender já havia sido considerada entregue antes da promise ser resolvida
   * e ele permanece esperando uma mensagem chegar para resolver, resultando em um loop.
   */
  async receive(
    data: Parameters<KafkaProvider['sendSignal']>[0],
  ): Promise<string | undefined> {
    await this.init();
    await this.sendSignal(data);

    return new Promise((resolve, reject) => {
      this.consumer.run({
        eachBatchAutoResolve: true,
        eachMessage: async ({ message }) => {
          const payload = message.value?.toString();

          console.log('\x1b[1m', '\x1b[38;2;255;255;0m', payload, '\x1b[0m');

          if (payload) {
            reject();
          }

          resolve(payload);
        },
      });
    });
  }

  async init(): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topics: ['send-data'],
      fromBeginning: true,
    });
  }
}
