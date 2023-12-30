import 'reflect-metadata';
import './KafkaProvider';
import express from 'express';

const app = express();

app.listen(1111, () => console.log('Sender rodando na porta 1111'));
