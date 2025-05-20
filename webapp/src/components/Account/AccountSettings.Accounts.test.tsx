import React from 'react';
import { shallow } from 'enzyme';
import { Accounts } from './AccountSettings.Accounts';
import { testUser } from '@models/__test__/User.TestData';

beforeEach(() => {
  jest.restoreAllMocks();
});

describe('Accounts', () => {
  it('should render properly', () => {
    // Arrange + Act
    const wrapper = shallow(<Accounts user={testUser} />);

    // Assert
    expect(wrapper).toMatchSnapshot();
  });
});
