import { ScheduleFilterData } from '@models/ScheduleFilterData';
import { useState } from 'react';
import {
  PreviousState,
  TermMetaMapping,
  CoursesByTermMapping,
  GenerationImpactingSettings,
} from './types';

export function useMemoizeManager(
  defaultPreviousState: PreviousState,
  coursesByTerm: CoursesByTermMapping,
  filters: ScheduleFilterData,
  settings: GenerationImpactingSettings,
) {
  const [previousState, setPreviousState] = useState<PreviousState>(defaultPreviousState);

  const getTermMeta = (): TermMetaMapping => {
    const termMeta: TermMetaMapping = {};
    for (const term of Object.values(coursesByTerm)) {
      termMeta[term.termId] = {};
      for (const course of Object.values(term.courses)) {
        termMeta[term.termId][course.id] = course.getConfigurationSignature();
      }
    }
    return termMeta;
  };

  const memoizeState = (): void => {
    setPreviousState({
      filters,
      termMeta: getTermMeta(),
      settings,
    });
  };

  return { previousState, getTermMeta, memoizeState };
}
