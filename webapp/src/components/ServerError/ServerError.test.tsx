import React from 'react';
import { shallow } from 'enzyme';

import { ServerError } from './ServerError';

describe('ServerError', () => {
  it('should render properly', () => {
    const wrapper = shallow(<ServerError />);

    expect(wrapper).toMatchSnapshot();
  });
});
