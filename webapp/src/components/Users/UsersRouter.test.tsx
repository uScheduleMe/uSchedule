import React from 'react';
import { shallow } from 'enzyme';
import UsersRouter from './UsersRouter';

beforeEach(() => {
  jest.restoreAllMocks();
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    user_uuid: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  }),
}));

describe('UsersRouter', () => {
  it('should render properly', () => {
    // Arrange + Act
    const wrapper = shallow(<UsersRouter />);

    // Assert
    expect(wrapper).toMatchSnapshot();
  });
});
