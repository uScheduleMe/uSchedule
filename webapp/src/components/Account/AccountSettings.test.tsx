import React from 'react';
import { shallow } from 'enzyme';
import { AccountSettings } from './AccountSettings';

beforeEach(() => {
  jest.restoreAllMocks();
});

describe('AccountSettings', () => {
  it('should render properly', () => {
    // Arrange + Act
    const wrapper = shallow(<AccountSettings />);

    // Assert
    expect(wrapper).toMatchSnapshot();
  });
});
