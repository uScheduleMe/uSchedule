import React from 'react';
import { DownloadScheduleButtonProps } from './types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faFileCode,
  faFileCsv,
  faDownload,
} from '@fortawesome/free-solid-svg-icons';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { SchedulerService } from '@services/Scheduler/Scheduler';
import { useService } from '@hooks/useService';
import { useTranslation } from 'react-i18next';
import { mergeClassNames } from '@utils/mergeClassNames';
import { ScheduleDownloadFormats } from '@services/Scheduler/types';
import { useEnvironmentStore } from '@stores/EnvironmentStore';

export const DownloadScheduleButton: React.FC<DownloadScheduleButtonProps> = ({
  schedule,
  term,
  className,
  disabled = false,
  ...props
}: DownloadScheduleButtonProps) => {
  const { t } = useTranslation(['common', 'scheduler']);
  const classes = mergeClassNames('dropdown-toggle-no-arrow', className);
  const schedulerService = useService(SchedulerService);
  const { eventTracker } = useEnvironmentStore();

  const downloadSchedule = (format: ScheduleDownloadFormats) => (): void => {
    if (disabled) {
      return;
    }
    const start_time = Date.now();
    schedulerService.downloadSchedule(schedule, format, term);
    const load_time = Date.now() - start_time;

    eventTracker.downloadSchedule(term, format, load_time);
  };

  return (
    <DropdownButton
      as={ButtonGroup}
      variant="outline-secondary"
      title={<Icon icon={faDownload} title={t('scheduler:download_schedule')} />}
      data-cy="clk:download"
      className={classes}
      alignRight
      {...props}
    >
      <Dropdown.Header>
        <strong>{t('common:download')}...</strong>
      </Dropdown.Header>
      <Dropdown.Item
        onClick={downloadSchedule(ScheduleDownloadFormats.ICAL)}
        data-cy="clk:download-ical"
        disabled={disabled}
      >
        <Icon icon={faCalendarAlt} fixedWidth className="text-secondary mr-2" />
        {t('common:ical')}
      </Dropdown.Item>
      <Dropdown.Item
        onClick={downloadSchedule(ScheduleDownloadFormats.JSON)}
        data-cy="clk:download-json"
        disabled={disabled}
      >
        <Icon icon={faFileCode} fixedWidth className="text-secondary mr-2" />
        {t('common:json')}
      </Dropdown.Item>
      <Dropdown.Item
        onClick={downloadSchedule(ScheduleDownloadFormats.CSV)}
        data-cy="clk:download-csv"
        disabled={disabled}
      >
        <Icon icon={faFileCsv} fixedWidth className="text-secondary mr-2" />
        {t('common:csv')}
      </Dropdown.Item>
    </DropdownButton>
  );
};
