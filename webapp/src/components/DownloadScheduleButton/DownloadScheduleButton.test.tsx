import React from 'react';
import { shallow } from 'enzyme';
import { DownloadScheduleButton } from './DownloadScheduleButton';
import { CourseSchedule } from '@models/CourseSchedule';
import { Term, TermSeasons } from '@models/Term';

beforeEach(() => {
  jest.restoreAllMocks();
});

describe('DownloadScheduleButton with minimum inputs', () => {
  it('should render properly', () => {
    const termYear = 2021;
    const wrapper = shallow(
      <DownloadScheduleButton
        schedule={{} as CourseSchedule}
        term={new Term(termYear, TermSeasons.Winter)}
      />,
    );

    expect(wrapper).toMatchSnapshot();
  });
});

describe('DownloadScheduleButton with inputs for defaults', () => {
  it('should render properly', () => {
    const termYear = 2021;
    const wrapper = shallow(
      <DownloadScheduleButton
        schedule={{} as CourseSchedule}
        term={new Term(termYear, TermSeasons.Winter)}
        className="download-schedule-button-test"
        disabled={true}
      />,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
