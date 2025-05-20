import React from 'react';
import { PageTitle } from '@components/PageTitle/PageTitle';
import { useUserStore } from '@stores/UserStore';
import { useAsync } from '@hooks/useAsync';
import { useService } from '@hooks/useService';
import { CourseScheduleExtended } from '@models/CourseScheduleExtended';
import { SchedulerService } from '@services/Scheduler/Scheduler';
import Container from 'react-bootstrap/Container';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { NotFound } from '@components/NotFound/NotFound';
import DraftTermSchedules from './DraftTermSchedules';
import { TermScheduleSetData } from '@models/TermScheduleSetData';
import IconAlert from '@components/IconAlert/IconAlert';

export const DraftSchedules = (): JSX.Element => {
  const { t } = useTranslation(['scheduler', 'common']);
  const { user_uuid } = useParams();
  const { user } = useUserStore();
  const schedulerService = useService(SchedulerService);

  const [drafts, setDrafts, draftsAreLoading] = useAsync(
    () => schedulerService.getDrafts(user_uuid ?? ''),
    [],
    t('scheduler:error.get_calendar'),
    { enabled: !!user },
  );

  const scheduleSetData = Array.from(
    drafts
      .reduce((map, s) => {
        map.has(s.term.id) ? map.get(s.term.id)?.push(s) : map.set(s.term.id, [s]);
        return map;
      }, new Map<string, CourseScheduleExtended[]>())
      .values(),
    (cs) => new TermScheduleSetData<CourseScheduleExtended>(cs, cs[0].term),
  );

  const [calendarSchedules, setCalendarSchedules] = useAsync(
    () => schedulerService.getCalendar(user_uuid ?? ''),
    [],
    t('scheduler:error.get_drafts'),
    { enabled: !!user, dependencies: [user_uuid] },
  );

  const calendarSchedulesByTerm = calendarSchedules.reduce(
    (map, s) => map.set(s.term.id, s),
    new Map<string, CourseScheduleExtended>(),
  );

  const removeDraft = (schedule: CourseScheduleExtended): void =>
    setDrafts((drafts) => drafts.filter((d) => d.id !== schedule.id));

  const moveToCalendar = (draft: CourseScheduleExtended): void => {
    const calSchedule = calendarSchedulesByTerm.get(draft.term.id);
    if (calSchedule) {
      setDrafts((drafts) => drafts.map((d) => (d.id === draft.id ? calSchedule : d)));
      setCalendarSchedules((calendarSchedules) =>
        calendarSchedules.map((cs) => (cs.id === calSchedule.id ? draft : cs)),
      );
    } else {
      setCalendarSchedules((calendarSchedules) => [...calendarSchedules, draft]);
      removeDraft(draft);
    }
  };

  if (draftsAreLoading) {
    return <></>;
  }
  if (!scheduleSetData.length && user?.uuid !== user_uuid) {
    return <NotFound />;
  }

  return (
    <Container>
      <PageTitle headTitle={t('scheduler:draft_schedules_title')}>
        {t('scheduler:draft_schedules_title')}
      </PageTitle>
      {scheduleSetData.length ? (
        scheduleSetData
          .sort(TermScheduleSetData.compareByTermDateReverse)
          .map((termScheduleSetData) => (
            <DraftTermSchedules
              key={termScheduleSetData.term.id}
              termScheduleSetData={termScheduleSetData}
              calendarSchedule={calendarSchedulesByTerm?.get(termScheduleSetData.term.id)}
              removeDraft={removeDraft}
              moveToCalendar={moveToCalendar}
            />
          ))
      ) : (
        <IconAlert data-cy="val:no-drafts">
          <Trans
            t={t}
            i18nKey="scheduler:no_drafts_message"
            components={{ link_scheduler: <IconAlert.Link as={Link} to="/" /> }}
          />
        </IconAlert>
      )}
    </Container>
  );
};
