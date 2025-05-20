import React from 'react';
import { shallow } from 'enzyme';
import { UserImage } from './UserImage';
import { testUser } from '@models/__test__/User.TestData';

describe('UserImage', () => {
  it('should render properly', () => {
    const wrapper = shallow(<UserImage user={testUser} />);

    expect(wrapper).toMatchSnapshot();
  });
});
