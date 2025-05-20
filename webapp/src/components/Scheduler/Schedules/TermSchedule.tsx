import React, { useEffect, useState, useRef } from 'react';
import { TermScheduleProps, GridProps } from './types';
import Header from './TermSchedule.Header';
import Grid from './TermSchedule.Grid';
import { CourseSchedule } from '@models/CourseSchedule';
import {
  useScheduleBuilderStore,
  TermMetaMapping,
  ScheduleBuilderContextType,
} from '@stores/ScheduleBuilderStore';
import { Term } from '@models/Term';
import { TermScheduleSetData } from '@models/TermScheduleSetData';
import { areShallowEqual } from '@utils/areShallowEqual';
import { SchedulerService } from '@services/Scheduler/Scheduler';
import {
  AllowTimeConflicts,
  getFilterPayload,
  ScheduleFilterData,
} from '@models/ScheduleFilterData';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAsync } from '@hooks/useAsync';
import { useService } from '@hooks/useService';
import { Button, Spinner } from 'react-bootstrap';
import StatusCodes from '@utils/StatusCodes';
import IconAlert from '@components/IconAlert/IconAlert';
import axios from 'axios';
import { responseSchema } from '@services/constants';
import { useConstant } from '@hooks/useConstant';
import { LocalSchedulerService } from '@services/LocalScheduler';
import { useEnvironmentStore } from '@stores/EnvironmentStore';

/**
 * Determine which terms need to be queried for new data and which data can be re-used
 * @param termId the id of the term to lookup
 * @param context the context for the data
 * @return a list of term data objects and a map of schedule set data by term
 */
const getTermScheduleDataCache = (
  termId: Term['id'],
  context: ScheduleBuilderContextType,
): TermScheduleSetData | null => {
  const { scheduleSetDataByTerm, filters, settings, previousState, getTermMeta } = context;

  const filtersHaveChanged: boolean = !areShallowEqual(filters, previousState.filters);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { format_time_as_military, ...generationSettings } = settings;
  const generationSettingsHaveChanged: boolean = !areShallowEqual(
    generationSettings,
    previousState.settings,
  );
  const termMeta: TermMetaMapping = getTermMeta();
  const termHasChanged: boolean = !areShallowEqual(
    termMeta[termId],
    previousState.termMeta[termId],
  );

  if (filtersHaveChanged || generationSettingsHaveChanged || termHasChanged) {
    return null;
  }
  return scheduleSetDataByTerm.get(termId) ?? null;
};

/**
 * A component that renders a list of schedules with controls for the provided term
 * @param props a TermScheduleProps object used to render the component
 * @return a JSX element containing the components to render
 */
const TermSchedule: React.FC<TermScheduleProps> = ({
  termData,
  enableRemoteSchedulerAlert,
}: TermScheduleProps) => {
  const minScheduleIdx = 0;
  const emptyScheduleIdx = -1;
  const remoteSchedulerAlertTimeoutInMs = 2000;
  const context = useScheduleBuilderStore();
  const { settings, termList } = context;
  const term = termList[termData.termId];
  const schedulerService = useService(SchedulerService);
  const cachedTermData = getTermScheduleDataCache(termData.termId, context);
  const [scheduleIdx, setScheduleIdx] = useState<number>(
    cachedTermData?.current_schedule_index ?? -1,
  );
  const { t } = useTranslation(['scheduler', 'terms', 'common']);
  const localSchedulerService = useConstant(() => new LocalSchedulerService(term.localScheduler));
  const { eventTracker } = useEnvironmentStore();

  const alertOnCatch =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (reason: any): void => {
      const message: string | undefined = reason?.response?.data?.messages[0]?.message;
      if (message) {
        toast.error(message);
      } else {
        toast.error(t('common:error.fetch_data'));
      }
    };

  const fetchAndUpdateScheduleData = async (
    filterOverrides: Partial<ScheduleFilterData> = {},
  ): Promise<TermScheduleSetData | null> => {
    if (cachedTermData) {
      return cachedTermData;
    }
    const { filters, settings, updateTermScheduleSet, memoizeState } = context;

    const filterData = getFilterPayload({ ...filters, ...filterOverrides });

    try {
      const service = settings.use_remote_scheduler ? schedulerService : localSchedulerService;

      const start_time = Date.now();
      const schedules = await service.generateSchedules(
        Object.values(termData.courses),
        filterData,
        term,
      );
      const load_time = Date.now() - start_time;

      eventTracker.generateSchedules(schedules, termData, load_time, settings.use_remote_scheduler);

      if (!schedules.schedules.length) {
        // The equivalent of catching the axios error below, but for the local scheduler
        return null;
      }

      if (schedules.limit_was_reached) {
        toast.warning(t('scheduler:warning.limit_reached', { term }));
      }

      updateTermScheduleSet(termData.termId, schedules);
      memoizeState();
      const newIdx = schedules?.current_schedule_index ?? -1;
      setScheduleIdx(newIdx);
      return schedules;
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.status === StatusCodes.NotFound) {
        const parsed = responseSchema.safeParse(e.response?.data);
        if (parsed.success && parsed.data.messages?.[0]?.code === 'sched.2001') {
          return null;
        }
      }
      throw e;
    }
  };

  const [termScheduleSetData, setTermScheduleSetData, isLoading, requestStatus] =
    useAsync<TermScheduleSetData | null>(fetchAndUpdateScheduleData, cachedTermData, alertOnCatch, {
      dependencies: [settings.use_remote_scheduler],
    });

  const generateWithConflicts = async (): Promise<void> => {
    const allowConflictsOverride = {
      allow_time_conflicts: AllowTimeConflicts.ALL,
    };
    const termWithOverride = await fetchAndUpdateScheduleData(allowConflictsOverride);
    if (termWithOverride) {
      termWithOverride.filter_overrides = allowConflictsOverride;
    }
    setTermScheduleSetData(termWithOverride);
  };

  const updateScheduleIdx = (requestedIdx: number): void => {
    let newIdx = requestedIdx;
    if (
      Number.isNaN(newIdx) ||
      newIdx < minScheduleIdx ||
      newIdx >= (termScheduleSetData?.schedules?.length ?? 0)
    ) {
      newIdx = emptyScheduleIdx;
    }
    setScheduleIdx(newIdx);
    if (termScheduleSetData) {
      termScheduleSetData.current_schedule_index = newIdx;
    }
  };

  const gridProps: GridProps = {
    schedule:
      !termScheduleSetData || scheduleIdx === emptyScheduleIdx
        ? new CourseSchedule()
        : termScheduleSetData.schedules[scheduleIdx],
  };

  // Store this state in a ref so that the timeout callback can access the latest values
  const shouldShowAlertRef = useRef<boolean>();
  shouldShowAlertRef.current = isLoading || requestStatus === 'error';

  useEffect(() => {
    if (!settings.use_remote_scheduler) {
      const timeoutHandle = setTimeout(() => {
        if (shouldShowAlertRef.current) {
          enableRemoteSchedulerAlert();
        }
      }, remoteSchedulerAlertTimeoutInMs);
      return () => clearTimeout(timeoutHandle);
    }
  }, [settings.use_remote_scheduler]);

  return (
    <div className="mb-4">
      {termScheduleSetData ? (
        <Header {...{ termScheduleSetData, scheduleIdx, updateScheduleIdx }} />
      ) : (
        <div className="h4 semester-title mb-0 mt-2 align-text-bottom">
          {t('terms:term_title', { term })}
        </div>
      )}
      <hr className="mt-0 mb-3" />
      {!isLoading && !termScheduleSetData && (
        <IconAlert variant="warning">
          <div className="d-flex flex-row">
            <div className="mr-1">{t('scheduler:no_schedules_found')}</div>
            <Button
              className="btn btn-warning"
              data-cy="clk:generate-with-conflicts"
              onClick={generateWithConflicts}
            >
              {t('scheduler:show_all_conflicts')}
            </Button>
          </div>
        </IconAlert>
      )}
      {termScheduleSetData && Object.keys(termScheduleSetData.filter_overrides).length > 0 && (
        <IconAlert variant="warning" data-cy="val:schedule-uses-different-filters">
          {t('scheduler:schedule_uses_different_filters')}
        </IconAlert>
      )}
      {isLoading ? (
        <div className="d-flex justify-content-center text-secondary mt-4">
          <Spinner animation="border" role="status" />
        </div>
      ) : (
        termScheduleSetData && <Grid {...gridProps} />
      )}
    </div>
  );
};

export default TermSchedule;
