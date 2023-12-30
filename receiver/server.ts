import 'reflect-metadata';
import './KafkaProvider';
import { container } from 'tsyringe';
import express, { Request, Response } from 'express';
import { KafkaProvider } from './KafkaProvider/KafkaProvider';

const app = express();
const kafkaProvider = container.resolve(KafkaProvider);

app.post(
  '/',
  async (
    _request: Request<never, never, never, never>,
    response: Response<string | undefined>,
  ) => {
    const message = await kafkaProvider.receive({
      topic: 'receive-data',
      messages: [{ value: 'Me mande dados' }],
    });

    return response.status(200).send(message);
  },
);

app.listen(2222, () => console.log('Receiver rodando na porta 2222'));
