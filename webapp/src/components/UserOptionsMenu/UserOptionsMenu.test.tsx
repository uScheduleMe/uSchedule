import React from 'react';
import { shallow } from 'enzyme';
import { UserOptionsMenu } from './UserOptionsMenu';
import { testUser } from '@models/__test__/User.TestData';

describe('UserOptionsMenu', () => {
  it('should render properly', () => {
    const wrapper = shallow(<UserOptionsMenu user={testUser} />);

    expect(wrapper).toMatchSnapshot();
  });
});
