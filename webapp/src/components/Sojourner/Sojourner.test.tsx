import React from 'react';
import { shallow } from 'enzyme';
import Sojourner from './Sojourner';

describe('Sojourner', () => {
  it('should render properly', () => {
    const wrapper = shallow(<Sojourner />);

    expect(wrapper).toMatchSnapshot();
  });
});
