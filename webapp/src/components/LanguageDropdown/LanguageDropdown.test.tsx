import React from 'react';
import { shallow } from 'enzyme';
import { LanguageDropdown } from './LanguageDropdown';

beforeEach(() => {
  jest.restoreAllMocks();
});

describe('LanguageDropdown', () => {
  it('should render properly', () => {
    // Arrange + Act
    const wrapper = shallow(<LanguageDropdown />);

    // Assert
    expect(wrapper).toMatchSnapshot();
  });
});
