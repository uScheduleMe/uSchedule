import React from 'react';
import { shallow } from 'enzyme';

import { ProtectedRoute } from './ProtectedRoute';

describe('ProtectedRoute', () => {
  it('should render properly', () => {
    const wrapper = shallow(<ProtectedRoute />);

    expect(wrapper).toMatchSnapshot();
  });
});
