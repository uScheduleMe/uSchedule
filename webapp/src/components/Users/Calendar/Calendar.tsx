import React, { useState } from 'react';
import { PageTitle } from '@components/PageTitle/PageTitle';
import { useUserStore } from '@stores/UserStore';
import { useAsync } from '@hooks/useAsync';
import { useService } from '@hooks/useService';
import { SchedulerService } from '@services/Scheduler/Scheduler';
import Container from 'react-bootstrap/Container';
import { Trans, useTranslation } from 'react-i18next';
import CalendarSchedule from './CalendarSchedule';
import { CourseScheduleExtended } from '@models/CourseScheduleExtended';
import { Link, useParams } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faShareAlt } from '@fortawesome/free-solid-svg-icons';
import ShareSheet from '@components/ShareSheet/ShareSheet';
import { curry } from '@utils/helpers';
import IconAlert from '@components/IconAlert/IconAlert';

export const Calendar = (): JSX.Element => {
  const { t } = useTranslation(['scheduler', 'common']);
  const { user_uuid } = useParams();
  const { user } = useUserStore();
  const userOwnsCalendar = user?.uuid === user_uuid;
  const schedulerService = useService(SchedulerService);

  const [schedules, setSchedules, schedulesAreLoading] = useAsync(
    () => schedulerService.getCalendar(user_uuid ?? ''),
    [],
    t('scheduler:error.get_calendar'),
    { enabled: !!user, dependencies: [user_uuid] },
  );

  const removeSchedule = (schedule: CourseScheduleExtended): void =>
    setSchedules((schedules) => schedules.filter((d) => d.id !== schedule.id));

  const [showShareSheet, setShowShareSheet] = useState<boolean>(false);

  if (schedulesAreLoading) {
    return <></>;
  }

  return (
    <Container>
      <PageTitle headTitle={t('common:calendar')}>
        {t('common:calendar')}
        {userOwnsCalendar && (
          <Button
            variant="outline-primary"
            className="float-right ml-2 mt-1"
            onClick={curry(setShowShareSheet, true)}
            data-cy="clk:share-schedule"
          >
            <Icon icon={faShareAlt} className="mr-2" />
            {t('common:share')}
          </Button>
        )}
      </PageTitle>
      {schedules.length ? (
        schedules
          .sort(CourseScheduleExtended.compareByTermDateReverse)
          .map((schedule) => (
            <CalendarSchedule
              userOwnsSchedule={userOwnsCalendar}
              key={schedule.id}
              schedule={schedule}
              removeSchedule={removeSchedule}
            />
          ))
      ) : (
        <IconAlert data-cy="val:no-calendars">
          <Trans
            t={t}
            i18nKey={
              userOwnsCalendar
                ? 'scheduler:no_schedules_in_your_calendar'
                : 'scheduler:no_schedules_in_calendar'
            }
            components={{ link_scheduler: <IconAlert.Link as={Link} to="/" /> }}
          />
        </IconAlert>
      )}
      <ShareSheet
        data-cy="mod:share-sheet"
        title={t('scheduler:share_calendar')}
        show={showShareSheet}
        onHide={curry(setShowShareSheet, false)}
      />
    </Container>
  );
};
