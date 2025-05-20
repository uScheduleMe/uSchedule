import React from 'react';
import { shallow } from 'enzyme';
import App from './App';

beforeEach(() => {
  jest.restoreAllMocks();
});

describe('AccountRouter', () => {
  it('should render properly', () => {
    // Arrange + Act
    const wrapper = shallow(<App />);

    // Assert
    expect(wrapper).toMatchSnapshot();
  });
});
