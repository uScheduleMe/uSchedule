import { Term } from '@models/Term';
import { TermScheduleSetData } from '@models/TermScheduleSetData';
import { useState } from 'react';

export function useScheduleManager() {
  const [scheduleSetDataByTerm, setScheduleSetDataByTerm] = useState<
    Map<Term['id'], TermScheduleSetData>
  >(new Map<Term['id'], TermScheduleSetData>());

  const updateTermScheduleSet = (termId: Term['id'], scheduleSet: TermScheduleSetData): void => {
    setScheduleSetDataByTerm((current) => current.set(termId, scheduleSet));
  };

  return { scheduleSetDataByTerm, updateTermScheduleSet };
}
