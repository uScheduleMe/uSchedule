import React, { createContext, useContext } from 'react';
import { ScheduleFilterData, AllowTimeConflicts } from '@models/ScheduleFilterData';
import { SettingsData } from '@models/SettingsData';
import { Course } from '@models/Course';
import { Term } from '@models/Term';
import { TermScheduleSetData } from '@models/TermScheduleSetData';
import {
  CourseMapping,
  ScheduleBuilderStoreProps,
  TermListMapping,
  CoursesByTermMapping,
  TermMetaMapping,
  PreviousState,
  GenerationImpactingSettings,
} from './types';
import { useAvailableTerms } from './useAvailableTerms';
import { useCourseManager } from './useCourseManager';
import { useSettingsManager } from './useSettingsManager';
import { useFiltersManager } from './useFiltersManager';
import { useMemoizeManager } from './useMemoizeManager';
import { useScheduleManager } from './useScheduleManager';

/* eslint-disable @typescript-eslint/no-unused-vars */
const defaultFilters: ScheduleFilterData = {
  minimize_before_time: '06:00',
  minimize_after_time: '23:30',
  lunch_size: '00:30',
  lunch_start: '10:00',
  lunch_end: '13:30',
  lunch_is_enabled: false,
  allow_closed_components: true,
  allow_time_conflicts: AllowTimeConflicts.NONE,
  evening_is_enabled: false,
  evening_size: '00:30',
  evening_start: '17:30',
  evening_end: '19:30',
};

const defaultSettings: SettingsData = {
  format_time_as_military: false,
  use_remote_scheduler: false,
};

const defaultPreviousState: PreviousState = {
  filters: {} as ScheduleFilterData,
  termMeta: {} as TermMetaMapping,
  settings: {} as GenerationImpactingSettings,
};

const defaults = {
  filters: defaultFilters,
  settings: defaultSettings,
  courses: {} as CourseMapping,
  coursesByTerm: {} as CoursesByTermMapping,
  termList: {} as TermListMapping,
  previousState: defaultPreviousState,
  scheduleSetDataByTerm: new Map<Term['id'], TermScheduleSetData>(),
  updateFilters: (filters: Partial<ScheduleFilterData>): void => undefined,
  updateSettings: (settings: Partial<SettingsData>): void => undefined,
  updateTermScheduleSet: (termId: Term['id'], scheduleSet: TermScheduleSetData): void => undefined,
  addCourseData: (courseData: Course, term: string): void => undefined,
  deleteCourse: (courseID: Course['id'], term: string): void => undefined,
  memoizeState: (): void => undefined,
  getTermMeta: (): TermMetaMapping => ({}),
};
/* eslint-enable @typescript-eslint/no-unused-vars */

export type ScheduleBuilderContextType = typeof defaults;

const ScheduleBuilderContext = createContext<ScheduleBuilderContextType>(defaults);

export const useScheduleBuilderStore = () => useContext(ScheduleBuilderContext);

export function ScheduleBuilderStoreProvider(props: ScheduleBuilderStoreProps): JSX.Element {
  const termList = useAvailableTerms();
  const course_manager = useCourseManager();
  const schedule_manager = useScheduleManager();
  const settings_manager = useSettingsManager(defaultSettings);
  const filters_manager = useFiltersManager(defaultFilters);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { format_time_as_military, ...generation_settings } = settings_manager.settings;
  const memoize_manager = useMemoizeManager(
    defaultPreviousState,
    course_manager.coursesByTerm,
    filters_manager.filters,
    generation_settings,
  );

  return (
    <ScheduleBuilderContext.Provider
      value={{
        ...course_manager,
        ...schedule_manager,
        ...settings_manager,
        ...filters_manager,
        ...memoize_manager,
        termList,
      }}
    >
      {props.children}
    </ScheduleBuilderContext.Provider>
  );
}
