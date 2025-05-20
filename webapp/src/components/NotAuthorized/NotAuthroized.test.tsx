import React from 'react';
import { shallow } from 'enzyme';

import { NotAuthorized } from './NotAuthorized';

describe('NotAuthorized', () => {
  it('should render properly', () => {
    const wrapper = shallow(<NotAuthorized />);

    expect(wrapper).toMatchSnapshot();
  });
});
