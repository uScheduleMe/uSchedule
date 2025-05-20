import React from 'react';
import { shallow } from 'enzyme';
import UserList from './UserList';
import { testUser } from '@models/__test__/User.TestData';

describe('UserList', () => {
  it('should render properly with no users', () => {
    const wrapper = shallow(<UserList users={[]} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render properly with 1 user', () => {
    const wrapper = shallow(<UserList users={[testUser]} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render properly with more than 1 user', () => {
    const wrapper = shallow(<UserList users={[testUser, testUser]} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render properly with a child component', () => {
    const wrapper = shallow(
      <UserList users={[testUser]}>{(u) => <span>{u.display_name}</span>}</UserList>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
