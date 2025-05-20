import React from 'react';
import { shallow } from 'enzyme';

import { TERMS } from '@models/__test__/Term.TestData';
import { SaveScheduleModal } from './TermSchedule.SaveScheduleModal';

describe('SaveScheduleModal', () => {
  it('should render properly', () => {
    const wrapper = shallow(
      <SaveScheduleModal term={TERMS.WINTER_2020} onSave={async (): Promise<boolean> => false} />,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
