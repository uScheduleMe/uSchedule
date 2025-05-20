import React from 'react';
import { shallow } from 'enzyme';
import { OptionsDropdown } from './OptionsDropdown';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

beforeEach(() => {
  jest.restoreAllMocks();
});

describe('OptionsDropdown', () => {
  it('should render properly', () => {
    // Arrange + Act
    const wrapper = shallow(
      <OptionsDropdown
        options={{
          a: {
            icon: faSun,
            label: 'test-a',
          },
          b: {
            icon: faMoon,
            label: 'test-b',
          },
        }}
        default_icon={faMoon}
        onValueChanged={(new_val: string) => `${new_val}-test`}
      />,
    );

    // Assert
    expect(wrapper).toMatchSnapshot();
  });
});
