import React from 'react';
import { shallow } from 'enzyme';
import { Danger } from './AccountSettings.Danger';
import { testUser } from '@models/__test__/User.TestData';

beforeEach(() => {
  jest.restoreAllMocks();
});

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => undefined,
}));

describe('Danger', () => {
  it('should render properly', () => {
    // Arrange + Act
    const wrapper = shallow(<Danger user={testUser} />);

    // Assert
    expect(wrapper).toMatchSnapshot();
  });
});
