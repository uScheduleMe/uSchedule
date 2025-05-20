import React from 'react';
import { shallow } from 'enzyme';
import UnifiedSearch from './UnifiedSearch';

describe('UnifiedSearch', () => {
  it('should render properly', () => {
    const wrapper = shallow(<UnifiedSearch />);

    expect(wrapper).toMatchSnapshot();
  });
});
