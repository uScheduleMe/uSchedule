import React from 'react';
import { shallow } from 'enzyme';
import { Calendar } from './Calendar';

beforeEach(() => {
  jest.restoreAllMocks();
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    user_uuid: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  }),
}));

describe('Calendar', () => {
  it('should render properly', () => {
    // Arrange + Act
    const wrapper = shallow(<Calendar />);

    // Assert
    expect(wrapper).toMatchSnapshot();
  });
});
