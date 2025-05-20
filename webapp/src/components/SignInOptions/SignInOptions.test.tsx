import React from 'react';
import { shallow } from 'enzyme';

import { SignInOptions } from './SignInOptions';

describe('SignInOptions', () => {
  it('should render properly with default inputs', () => {
    const wrapper = shallow(<SignInOptions />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render properly with no providers', () => {
    const wrapper = shallow(<SignInOptions providers={[]} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render properly with one provider', () => {
    const wrapper = shallow(<SignInOptions providers={['microsoft']} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render properly with two providers in the wrong order', () => {
    const wrapper = shallow(<SignInOptions providers={['microsoft', 'google']} />);
    expect(wrapper).toMatchSnapshot();
  });
});
