import React from 'react';
import { useScheduleBuilderStore } from '@stores/ScheduleBuilderStore';
import {
  Col,
  Form,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  OverlayTrigger,
  Popover,
} from 'react-bootstrap';
import {
  allowTimeConflictsTxKeys,
  AllowTimeConflicts,
  ScheduleFilterData,
} from '@models/ScheduleFilterData';
import {
  TWELVE_HOUR_FORMAT,
  TWENTY_FOUR_HOUR_FORMAT,
  THIRTY_MINUTES,
  TEN_MINUTES,
} from './constants';
import { OptionsProps } from './types';
import { FilterTimeDropdown } from './FilterTimeDropdown';
import { SettingsData } from '@models/SettingsData';
import { Trans, useTranslation } from 'react-i18next';
import { noopSubmit } from '@utils/helpers';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';

export const Options: React.FC<OptionsProps> = (props: OptionsProps) => {
  const { t } = useTranslation(['scheduler', 'common']);
  const { moveToSchedulesTab, courseIsLoading } = props;

  const { filters, settings, coursesByTerm, updateFilters, updateSettings } =
    useScheduleBuilderStore();
  const {
    minimize_before_time,
    minimize_after_time,
    lunch_is_enabled,
    lunch_start,
    lunch_end,
    lunch_size,
    evening_is_enabled,
    evening_start,
    evening_end,
    evening_size,
    allow_closed_components,
    allow_time_conflicts,
  } = filters;
  const { format_time_as_military, use_remote_scheduler } = settings;
  const timeDisplayFormat: string = format_time_as_military
    ? TWENTY_FOUR_HOUR_FORMAT
    : TWELVE_HOUR_FORMAT;
  const durationDisplayFormat: string = 'H[h] mm[m]';

  const handleFilterChange =
    (attributeName: keyof ScheduleFilterData, toBoolean: boolean = false) =>
    (value: string | boolean | AllowTimeConflicts): void => {
      updateFilters({ [attributeName]: toBoolean ? value === 'true' : value });
    };

  const handleSettingChange =
    (attributeName: keyof SettingsData) =>
    (value: string): void => {
      updateSettings({ [attributeName]: value === 'true' });
    };

  const handleFilterCheckChange =
    (attributeName: keyof ScheduleFilterData) =>
    (event: React.ChangeEvent<HTMLInputElement>): void =>
      handleFilterChange(attributeName)(event.target.checked);

  const schedulerModuleInfoPopover = (
    <Popover id="popover-basic">
      <Popover.Content>
        <div className="mb-2">{t('scheduler:scheduler_module.info')}</div>
        <div>
          <Trans
            t={t}
            i18nKey="scheduler:scheduler_module.feedback"
            components={{ link_feedback: <Link to="/feedback" /> }}
          />
        </div>
      </Popover.Content>
    </Popover>
  );

  return (
    <Form onSubmit={noopSubmit}>
      <h3 className="h4">{t('common:filters')}</h3>
      <Form.Row>
        <Col md={6}>
          <FilterTimeDropdown
            id="minimize_before_time"
            prependText={`${t('scheduler:minimize_before')}`}
            startTime="06:00"
            endTime="12:00"
            interval={THIRTY_MINUTES}
            displayFormat={timeDisplayFormat}
            value={minimize_before_time}
            onChange={handleFilterChange('minimize_before_time')}
          />
        </Col>
        <Col md={6}>
          <FilterTimeDropdown
            id="minimize_after_time"
            prependText={`${t('scheduler:minimize_after')}`}
            startTime="12:00"
            endTime="23:30"
            interval={THIRTY_MINUTES}
            displayFormat={timeDisplayFormat}
            value={minimize_after_time}
            onChange={handleFilterChange('minimize_after_time')}
          />
        </Col>
      </Form.Row>
      <Form.Check
        id="lunch_is_enabled"
        className="mb-1"
        type="checkbox"
        label={t('scheduler:lunch_break')}
        checked={lunch_is_enabled}
        onChange={handleFilterCheckChange('lunch_is_enabled')}
      />
      <Form.Row>
        <Col md={4}>
          <FilterTimeDropdown
            id="lunch_start"
            prependText={`${t('common:start')}`}
            startTime="06:00"
            endTime="14:00"
            interval={THIRTY_MINUTES}
            displayFormat={timeDisplayFormat}
            value={lunch_start}
            onChange={handleFilterChange('lunch_start')}
          />
        </Col>
        <Col md={4}>
          <FilterTimeDropdown
            id="lunch_end"
            prependText={`${t('common:end')}`}
            startTime="6:00"
            endTime="14:00"
            interval={THIRTY_MINUTES}
            displayFormat={timeDisplayFormat}
            value={lunch_end}
            onChange={handleFilterChange('lunch_end')}
          />
        </Col>
        <Col md={4}>
          <FilterTimeDropdown
            id="lunch_size"
            prependText={`${t('scheduler:min_time')}`}
            startTime="00:00"
            endTime="02:00"
            interval={TEN_MINUTES}
            displayFormat={durationDisplayFormat}
            value={lunch_size}
            onChange={handleFilterChange('lunch_size')}
          />
        </Col>
      </Form.Row>
      <Form.Check
        id="evening_is_enabled"
        className="mb-1"
        type="checkbox"
        label={t('scheduler:evening_break')}
        checked={evening_is_enabled}
        onChange={handleFilterCheckChange('evening_is_enabled')}
      />
      <Form.Row>
        <Col md={4}>
          <FilterTimeDropdown
            id="evening_start"
            prependText={`${t('common:start')}`}
            startTime="14:00"
            endTime="22:00"
            interval={THIRTY_MINUTES}
            displayFormat={timeDisplayFormat}
            value={evening_start}
            onChange={handleFilterChange('evening_start')}
          />
        </Col>
        <Col md={4}>
          <FilterTimeDropdown
            id="evening_end"
            prependText={`${t('common:end')}`}
            startTime="14:00"
            endTime="22:00"
            interval={THIRTY_MINUTES}
            displayFormat={timeDisplayFormat}
            value={evening_end}
            onChange={handleFilterChange('evening_end')}
          />
        </Col>
        <Col md={4}>
          <FilterTimeDropdown
            id="evening_size"
            prependText={`${t('scheduler:min_time')}`}
            startTime="00:00"
            endTime="02:00"
            interval={TEN_MINUTES}
            displayFormat={durationDisplayFormat}
            value={evening_size}
            onChange={handleFilterChange('evening_size')}
          />
        </Col>
      </Form.Row>
      <Form.Row>
        <Col xs={12} sm={5} md={4} lg={3} className="mb-3">
          <Form.Row>
            <Col xs={12}>
              <div className="mb-1">{t('scheduler:closed_components')}</div>
            </Col>
            <Col xs={12}>
              <ToggleButtonGroup
                name="ClosedComponentToggle"
                type="radio"
                value={allow_closed_components ? 'true' : 'false'}
                onChange={handleFilterChange('allow_closed_components', true)}
              >
                <ToggleButton variant="outline-secondary" value="true">
                  {t('common:show')}
                </ToggleButton>
                <ToggleButton variant="outline-secondary" value="false">
                  {t('common:hide')}
                </ToggleButton>
              </ToggleButtonGroup>
            </Col>
          </Form.Row>
        </Col>
        <Col xs={12} md={8} className="mb-3">
          <Form.Row>
            <Col xs={12}>
              <div className="mb-1">{t('scheduler:time_conflicts')}</div>
            </Col>
            <Col xs={12}>
              <ToggleButtonGroup
                name="TimeConflictToggle"
                type="radio"
                value={allow_time_conflicts}
                onChange={handleFilterChange('allow_time_conflicts')}
              >
                <ToggleButton variant="outline-secondary" value={AllowTimeConflicts.NONE}>
                  {t(`scheduler:${allowTimeConflictsTxKeys[AllowTimeConflicts.NONE]}` as const)}
                </ToggleButton>
                <ToggleButton variant="outline-secondary" value={AllowTimeConflicts.NON_LEC}>
                  {t(`scheduler:${allowTimeConflictsTxKeys[AllowTimeConflicts.NON_LEC]}` as const)}
                </ToggleButton>
                <ToggleButton variant="outline-secondary" value={AllowTimeConflicts.ALL}>
                  {t(`scheduler:${allowTimeConflictsTxKeys[AllowTimeConflicts.ALL]}` as const)}
                </ToggleButton>
              </ToggleButtonGroup>
            </Col>
          </Form.Row>
        </Col>
      </Form.Row>
      <h3 className="h4 mt-3">{t('common:settings')}</h3>
      <Form.Row>
        <Col xs={12} sm={5} md={4} lg={3} className="mb-3">
          <Form.Row>
            <Col xs={12}>
              <div className="mb-1">{t('scheduler:time_format')}</div>
            </Col>
            <Col xs={12}>
              <ToggleButtonGroup
                name="TimeFormatToggle"
                type="radio"
                value={format_time_as_military ? 'true' : 'false'}
                onChange={handleSettingChange('format_time_as_military')}
              >
                <ToggleButton variant="outline-secondary" value="false">
                  {t('common:hour12')}
                </ToggleButton>
                <ToggleButton variant="outline-secondary" value="true">
                  {t('common:hour24')}
                </ToggleButton>
              </ToggleButtonGroup>
            </Col>
          </Form.Row>
        </Col>
        <Col xs={12} sm={5} md={4} lg={3} className="mb-3">
          <Form.Row>
            <Col xs={12}>
              <div className="mb-1 c-pointer">
                <OverlayTrigger
                  trigger="click"
                  rootClose
                  placement="top"
                  overlay={schedulerModuleInfoPopover}
                >
                  <span>
                    <span className="mr-1">{t('scheduler:scheduler_module.title')}</span>
                    <FontAwesomeIcon icon={faQuestionCircle} size="1x" fixedWidth />
                  </span>
                </OverlayTrigger>
              </div>
            </Col>
            <Col xs={12}>
              <ToggleButtonGroup
                name="SchedulerModuleToggle"
                type="radio"
                value={use_remote_scheduler ? 'true' : 'false'}
                onChange={handleSettingChange('use_remote_scheduler')}
              >
                <ToggleButton variant="outline-secondary" value="false">
                  {t('common:new')}
                </ToggleButton>
                <ToggleButton variant="outline-secondary" value="true">
                  {t('common:legacy')}
                </ToggleButton>
              </ToggleButtonGroup>
            </Col>
          </Form.Row>
        </Col>
      </Form.Row>
      {Object.values(coursesByTerm).length > 0 && (
        <Button
          id="options-go_to_schedules"
          className="mt-3"
          variant={'primary'}
          onClick={moveToSchedulesTab}
          disabled={courseIsLoading}
        >
          {t('scheduler:go_to_schedules')}
        </Button>
      )}
    </Form>
  );
};
