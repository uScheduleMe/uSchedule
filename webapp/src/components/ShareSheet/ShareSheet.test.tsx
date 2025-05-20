import React from 'react';
import { shallow } from 'enzyme';
import ShareSheet from './ShareSheet';

describe('ShareSheet', () => {
  it('should render properly', () => {
    const wrapper = shallow(<ShareSheet />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render properly with customizable inputs', () => {
    const wrapper = shallow(
      <ShareSheet title="Modal Title" show={true} onHide={() => undefined} closeButton={false} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
