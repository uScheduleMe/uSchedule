import 'jest-enzyme';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

jest.mock('@services/LocalScheduler/createWorker', () => ({
  createWorker: () => ({}),
}));

jest.mock('comlink', () => ({
  wrap: () => ({}),
  expose: () => undefined,
}));
