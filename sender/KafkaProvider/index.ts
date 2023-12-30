import { container } from 'tsyringe';
import { KafkaProvider } from './KafkaProvider';

container.registerInstance('MessageProvider', container.resolve(KafkaProvider));
