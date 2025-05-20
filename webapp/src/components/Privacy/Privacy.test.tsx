import React from 'react';
import { shallow } from 'enzyme';

import { Privacy } from './Privacy';

describe('Privacy', () => {
  it('should render properly', () => {
    const wrapper = shallow(<Privacy />);

    expect(wrapper).toMatchSnapshot();
  });
});
