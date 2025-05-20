import React from 'react';
import { shallow } from 'enzyme';
import { Profile } from './AccountSettings.Profile';
import { testUser } from '@models/__test__/User.TestData';

beforeEach(() => {
  jest.restoreAllMocks();
});

describe('Profile', () => {
  it('should render properly', () => {
    // Arrange + Act
    const wrapper = shallow(<Profile user={testUser} />);

    // Assert
    expect(wrapper).toMatchSnapshot();
  });
});
