import React from 'react';
import { ThemeDropdown } from './ThemeDropdown';
import { shallow } from 'enzyme';

beforeEach(() => {
  jest.restoreAllMocks();
});

describe('ThemeDropdown', () => {
  it('should render properly', () => {
    // Arrange + Act
    const wrapper = shallow(<ThemeDropdown />);

    // Assert
    expect(wrapper).toMatchSnapshot();
  });
});
