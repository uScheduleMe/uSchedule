import React from 'react';
import { shallow } from 'enzyme';

import { Feedback } from './Feedback';

describe('Feedback', () => {
  it('should render properly', () => {
    const wrapper = shallow(<Feedback />);

    expect(wrapper).toMatchSnapshot();
  });
});
