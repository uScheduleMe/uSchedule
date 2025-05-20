import React from 'react';
import { shallow } from 'enzyme';
import { ConfirmationModal } from './ConfirmationModal';
import { faReact } from '@fortawesome/free-brands-svg-icons';

beforeEach(() => {
  jest.restoreAllMocks();
});

describe('ConfirmationModal with minimum inputs', () => {
  it('should render properly', () => {
    // Arrange + Act
    const wrapper = shallow(
      <ConfirmationModal
        onConfirm={() => Promise.resolve()}
        confirmationMessage="confirmation message"
        title="confirmation title"
        onHide={() => undefined}
      />,
    );

    // Assert
    expect(wrapper).toMatchSnapshot();
  });
});

describe('ConfirmationModal with inputs for defaults', () => {
  it('should render properly', () => {
    // Arrange + Act
    const wrapper = shallow(
      <ConfirmationModal
        onConfirm={() => Promise.resolve()}
        confirmationMessage="confirmation message"
        title="confirmation title"
        onHide={() => undefined}
        icon={faReact}
        confirmButtonLabel="do_the_thing"
        cancelButtonLabel="bail_out"
        className="confirmation-modal-test"
      />,
    );

    // Assert
    expect(wrapper).toMatchSnapshot();
  });
});
