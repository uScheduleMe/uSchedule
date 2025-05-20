import React from 'react';
import { shallow } from 'enzyme';
import { AccountWithEmailExists } from './SignInError';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useLocation: () => ({
    search: {
      existing_providers: ['google'],
    },
  }),
}));

describe('SignInError', () => {
  it('should render properly', () => {
    const wrapper = shallow(<AccountWithEmailExists />);

    expect(wrapper).toMatchSnapshot();
  });
});
