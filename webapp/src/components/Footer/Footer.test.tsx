import React from 'react';
import { shallow } from 'enzyme';
import { Footer } from './Footer';

describe('Footer', () => {
  it('should render properly', () => {
    process.env.REACT_APP_VERSION = 'ci-test';
    const wrapper = shallow(<Footer />);

    expect(wrapper).toMatchSnapshot();
  });
});
