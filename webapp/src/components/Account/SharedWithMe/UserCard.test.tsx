import React from 'react';
import { shallow } from 'enzyme';
import { UserCard } from './UserCard';
import { testUser } from '@models/__test__/User.TestData';

beforeEach(() => {
  jest.restoreAllMocks();
});

describe('UserCard', () => {
  it('should render properly', () => {
    // Arrange + Act
    const wrapper = shallow(<UserCard user={testUser} />);

    // Assert
    expect(wrapper).toMatchSnapshot();
  });
});
