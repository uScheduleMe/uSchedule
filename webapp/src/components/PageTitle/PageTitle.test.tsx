import React from 'react';
import { shallow } from 'enzyme';

import { PageTitle } from './PageTitle';

describe('PageTitle', () => {
  it('should render properly', () => {
    const wrapper = shallow(<PageTitle headTitle="Test">Test</PageTitle>);

    expect(wrapper).toMatchSnapshot();
  });
});
