import React from 'react';
import { shallow } from 'enzyme';

import { Schedules } from './Schedules';

describe('Schedules', () => {
  it('should render properly', () => {
    const wrapper = shallow(<Schedules />);

    expect(wrapper).toMatchSnapshot();
  });
});
