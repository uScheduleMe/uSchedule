import React, { useState } from 'react';
import TermSchedule from './TermSchedule';
import './schedules.css';
import { Term } from '@models/Term';
import { useScheduleBuilderStore, TermData } from '@stores/ScheduleBuilderStore';
import IconAlert from '@components/IconAlert/IconAlert';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

/**
 * A component that renders a set of schedules for terms
 * @param props a SchedulesProps object used to render the component
 * @return a JSX element containing the components to render
 */
export const Schedules: React.FC = () => {
  const { coursesByTerm, termList, updateSettings, settings } = useScheduleBuilderStore();
  const [showRemoteSchedulerAlert, setShowRemoteSchedulerAlert] = useState<boolean>(false);
  const { t } = useTranslation(['scheduler']);

  const setRemoteSchedulerSetting = () => {
    updateSettings({ use_remote_scheduler: true });
  };

  return (
    <>
      {!settings.use_remote_scheduler && showRemoteSchedulerAlert && (
        <IconAlert data-cy="val:scheduler-uses-local-scheduler">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <div>{t('scheduler:scheduler_module.slow_info')}</div>
              <div className="text-muted small">
                {t('scheduler:scheduler_module.slow_options_tip')}
              </div>
            </div>
            <Button size="sm" className="ml-3" onClick={setRemoteSchedulerSetting}>
              {t('scheduler:scheduler_module.switch_back')}
            </Button>
          </div>
        </IconAlert>
      )}
      {Object.values(coursesByTerm)
        .sort((a: TermData, b: TermData) => {
          return Term.compareByDate(termList[a.termId], termList[b.termId]);
        })
        .map((termData: TermData) => (
          <TermSchedule
            termData={termData}
            key={termData.termId}
            enableRemoteSchedulerAlert={() => setShowRemoteSchedulerAlert(true)}
          />
        ))}
    </>
  );
};
