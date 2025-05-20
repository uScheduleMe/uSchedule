import React from 'react';
import { shallow } from 'enzyme';
import { SharedWithMe } from './SharedWithMe';

beforeEach(() => {
  jest.restoreAllMocks();
});

describe('SharedWithMe', () => {
  it('should render properly', () => {
    // Arrange + Act
    const wrapper = shallow(<SharedWithMe />);

    // Assert
    expect(wrapper).toMatchSnapshot();
  });
});
