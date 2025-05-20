import React, { KeyboardEvent, ChangeEvent, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { HeaderProps } from './types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import {
  faCaretLeft,
  faCaretRight,
  faCalendarAlt,
  faCalendarDay,
  faPencilAlt,
  faCheck,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { useServiceMessageHandler } from '@hooks/useServiceMessageHandler';
import { toast } from 'react-toastify';
import { useService } from '@hooks/useService';
import { CourseScheduleExtended } from '@models/CourseScheduleExtended';
import { DownloadScheduleButton } from '@components/DownloadScheduleButton/DownloadScheduleButton';
import { Term } from '@models/Term';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { ConfirmationModal } from '@components/ConfirmationModal/ConfirmationModal';
import { SchedulerService } from '@services/Scheduler/Scheduler';
import { curry, noopSubmit } from '@utils/helpers';
import { maxScheduleNameLength } from '@components/Scheduler/Schedules/constants';
import { useFocus } from '@hooks/useFocus';

/**
 * A component that renders a the header for the provided schedule
 * @param props a HeaderProps object used to render the component
 * @return a JSX element containing the components to render
 */
const Header = (props: HeaderProps): JSX.Element => {
  const { t } = useTranslation(['scheduler', 'account', 'common', 'terms']);
  const {
    termScheduleSetData,
    updateScheduleIdx,
    scheduleIdx,
    showCalendar,
    setShowCalendar,
    calendarSchedule,
    removeDraft,
    moveToCalendar,
  } = props;

  const schedulerService = useService(SchedulerService);
  const errorMsgHelper = useServiceMessageHandler();

  const toggleShowCalendar = () => setShowCalendar(!showCalendar);

  const numSchedules: number = termScheduleSetData.schedules.length;
  const [scheduleNum, setScheduleNum] = useState<number>(scheduleIdx + 1);
  const schedule: CourseScheduleExtended | undefined = termScheduleSetData.schedules[scheduleIdx];
  const [asyncIsLoading, setAsyncIsLoading] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const scheduleNameRef = useFocus<HTMLInputElement>(editMode);
  // Save the term for when the user picks an invalid schedule
  const [term] = useState<Term>(() => schedule.term);
  const offset = 1;
  const emptyScheduleIdx = -1;

  const handleEdit = (): void => {
    setEditName(schedule?.name ?? '');
    setEditMode(true);
  };

  const handleScheduleNumChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const requestedValue = parseInt(event.currentTarget.value);
    // -1 to Adjust from human friendly schedule number to index number
    updateScheduleIdx(requestedValue - offset);
    setScheduleNum(requestedValue);
  };

  const decrementScheduleIdx = (): void => {
    const newValue =
      scheduleIdx === emptyScheduleIdx
        ? numSchedules - 1
        : (scheduleIdx - offset + numSchedules) % numSchedules;
    updateScheduleIdx(newValue);
    setScheduleNum(newValue + 1);
  };

  const incrementScheduleIdx = (): void => {
    const newValue = (scheduleIdx + offset) % numSchedules;
    updateScheduleIdx(newValue);
    setScheduleNum(newValue + 1);
  };

  const [deleteModalIsShown, setDeleteModalIsShown] = useState<boolean>(false);
  const handleDeleteSchedule = async (): Promise<void> => {
    setAsyncIsLoading(true);
    try {
      await schedulerService.deleteSchedule(schedule.id);
      toast.success(
        t('scheduler:success.schedule_delete', {
          term,
          context: schedule?.name && 'with_name',
          name: schedule?.name,
        }),
      );
      setDeleteModalIsShown(false);
      if (scheduleIdx > 0) {
        decrementScheduleIdx();
      }
      removeDraft(schedule);
    } catch (e: unknown) {
      errorMsgHelper(e, t('scheduler:error.schedule_delete')).forEach((m) =>
        toast[m.type](m.message),
      );
    }
    setAsyncIsLoading(false);
  };

  const handleMoveToCalendar = async (): Promise<void> => {
    setAsyncIsLoading(true);
    try {
      await schedulerService.moveScheduleToCalendar(schedule.id);
      toast.success(
        t('scheduler:success.move_to_calendar', {
          term,
          context: schedule?.name && 'with_name',
          name: schedule?.name,
        }),
      );
      if (!calendarSchedule && scheduleIdx === numSchedules - 1) {
        decrementScheduleIdx();
      }
      moveToCalendar(schedule);
    } catch (e: unknown) {
      errorMsgHelper(e, t('scheduler:error.move_to_calendar')).forEach((m) =>
        toast[m.type](m.message),
      );
    }
    setAsyncIsLoading(false);
  };

  const handleSave = async (): Promise<void> => {
    try {
      if (editName !== schedule.name) {
        setAsyncIsLoading(true);
        await schedulerService.renameSchedule(schedule.id, editName);
        // eslint-disable-next-line require-atomic-updates
        schedule.name = editName;
      }
    } catch (e: unknown) {
      errorMsgHelper(e, t('scheduler:error.change_schedule_name')).forEach((m) =>
        toast[m.type](m.message),
      );
    }
    setAsyncIsLoading(false);
    setEditMode(false);
  };

  const handleNameOnChange = (e: ChangeEvent<HTMLInputElement>) => setEditName(e.target.value);

  const handleCancel = (): void => setEditMode(false);

  const handleKeyUp = (event: KeyboardEvent<HTMLInputElement>): void => {
    // Key Values: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
    switch (event.key) {
      case 'Enter':
        handleSave();
        break;
      case 'Esc':
      case 'Escape':
        handleCancel();
        break;
      default:
    }
  };

  return (
    <>
      <ConfirmationModal
        onHide={curry(setDeleteModalIsShown, false)}
        onConfirm={handleDeleteSchedule}
        confirmationMessage={t('scheduler:delete_draft_modal.message', {
          term,
          context: schedule?.name && 'with_name',
          name: schedule?.name,
        })}
        title={t('scheduler:delete_draft_modal.title')}
        icon={faTrashAlt}
        confirmButtonLabel={t('common:delete')}
        show={deleteModalIsShown}
      />
      <Form onSubmit={noopSubmit}>
        <Form.Row className="term-schedule-header">
          <Col lg={6} xl={7} className="mb-3">
            <div className="h4 semester-title mb-0 mt-2 align-text-bottom">
              {t('terms:term_title', { term })}
              {editMode ? (
                <InputGroup className="mb-2 mt-2">
                  <Form.Control
                    ref={scheduleNameRef}
                    type="text"
                    onChange={handleNameOnChange}
                    onKeyUp={handleKeyUp}
                    value={editName}
                    placeholder={t('scheduler:schedule_name_optional')}
                    maxLength={maxScheduleNameLength}
                    disabled={asyncIsLoading}
                    data-cy="txt:schedule-name"
                  />
                  <InputGroup.Append>
                    <Button
                      onClick={handleSave}
                      size="sm"
                      variant="outline-primary"
                      title={t('common:save')}
                      disabled={asyncIsLoading}
                      data-cy="clk:save-schedule-name"
                    >
                      <Icon icon={faCheck} className="mr-sm-2" fixedWidth />
                      <span className="d-none d-sm-inline">{t('common:save')}</span>
                    </Button>
                    <Button
                      onClick={handleCancel}
                      size="sm"
                      variant="outline-secondary"
                      title={t('common:cancel')}
                      disabled={asyncIsLoading}
                      data-cy="clk:cancel-schedule-name"
                    >
                      <Icon icon={faTimes} className="mr-sm-1" fixedWidth />
                      <span className="d-none d-sm-inline">{t('common:cancel')}</span>
                    </Button>
                  </InputGroup.Append>
                </InputGroup>
              ) : (
                <>
                  {schedule?.name && (
                    <>
                      <span className="text-secondary">&nbsp;&ndash;&nbsp;</span>
                      <span className="small text-secondary" data-cy="val:schedule-name">
                        {schedule.name}
                      </span>
                    </>
                  )}
                  <Button
                    onClick={handleEdit}
                    className="ml-2"
                    size="sm"
                    variant="outline-secondary"
                    title={t('scheduler:edit_schedule_name')}
                    disabled={scheduleIdx < 0 || asyncIsLoading}
                    data-cy="clk:edit-draft-name"
                  >
                    <Icon icon={faPencilAlt} className="mr-sm-2" />
                    <span className="d-none d-sm-inline">{t('scheduler:edit_schedule_name')}</span>
                  </Button>
                </>
              )}
            </div>
          </Col>
          <Col md={{ offset: 4, span: 8 }} lg={{ offset: 0, span: 6 }} xl={5} className="mb-3">
            <InputGroup className="flex-fill justify-content-end">
              <InputGroup.Prepend>
                <InputGroup.Text>
                  <span className="d-sm-none d-md-inline d-lg-none">{t('common:sched')}</span>
                  <span className="d-none d-sm-inline d-md-none d-lg-inline">
                    {t('common:draft')}
                  </span>
                </InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control
                style={{ minWidth: '2.25rem' }}
                type="text"
                value={Number.isNaN(scheduleNum) ? '' : scheduleNum}
                onChange={handleScheduleNumChange}
                data-cy="txt:sched-id"
                disabled={editMode || asyncIsLoading}
              />
              <InputGroup.Append>
                <InputGroup.Text data-cy="val:course-count">
                  {t('common:of')}&nbsp;{numSchedules}
                </InputGroup.Text>
                <Button
                  variant="outline-secondary"
                  onClick={decrementScheduleIdx}
                  data-cy="clk:decr-sched"
                  disabled={editMode || asyncIsLoading}
                >
                  <Icon icon={faCaretLeft} size="lg" />
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={incrementScheduleIdx}
                  data-cy="clk:inc-sched"
                  className="rounded-right"
                  disabled={editMode || asyncIsLoading}
                >
                  <Icon icon={faCaretRight} size="lg" />
                </Button>
              </InputGroup.Append>
              <Dropdown as={ButtonGroup} className="ml-2">
                <Button
                  variant="outline-secondary"
                  title={t('scheduler:show_hide_calendar')}
                  onClick={toggleShowCalendar}
                  active={showCalendar}
                  disabled={!calendarSchedule}
                  data-cy="view-calendar-schedule-btn"
                >
                  <Icon icon={faCalendarAlt} />
                </Button>
                <Dropdown.Toggle
                  split
                  variant="outline-secondary"
                  data-cy="clk:open-calendar-options"
                />
                <Dropdown.Menu alignRight>
                  <Dropdown.Item
                    onClick={handleMoveToCalendar}
                    disabled={scheduleIdx < 0 || editMode || asyncIsLoading}
                    data-cy="clk:move-to-calendar"
                  >
                    <Icon icon={faCalendarDay} fixedWidth className="text-secondary mr-2" />
                    {t('scheduler:move_to_calendar')}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <DownloadScheduleButton
                className="ml-2"
                schedule={schedule}
                term={term}
                disabled={scheduleIdx < 0}
              />
              <Button
                className="ml-2"
                variant="outline-danger"
                title={t('scheduler:delete_draft_modal.title')}
                onClick={curry(setDeleteModalIsShown, true)}
                disabled={scheduleIdx < 0 || editMode || asyncIsLoading}
                data-cy="clk:delete-schedule"
              >
                <Icon icon={faTrashAlt} />
              </Button>
            </InputGroup>
          </Col>
        </Form.Row>
      </Form>
    </>
  );
};

export default Header;
