import React from 'react';
import { shallow } from 'enzyme';
import { UserIndicator } from './UserIndicator';

describe('UserIndicator', () => {
  it('should render properly', () => {
    const wrapper = shallow(<UserIndicator />);

    expect(wrapper).toMatchSnapshot();
  });
});
