import React from 'react';
import { shallow } from 'enzyme';
import AccountRouter from './AccountRouter';

beforeEach(() => {
  jest.restoreAllMocks();
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({}),
}));

describe('AccountRouter', () => {
  it('should render properly', () => {
    // Arrange + Act
    const wrapper = shallow(<AccountRouter />);

    // Assert
    expect(wrapper).toMatchSnapshot();
  });
});
