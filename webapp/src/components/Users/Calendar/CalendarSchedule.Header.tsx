import React, { KeyboardEvent, ChangeEvent, useState } from 'react';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { useTranslation } from 'react-i18next';
import { HeaderProps } from './types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCalendar, faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { SchedulerService } from '@services/Scheduler/Scheduler';
import { useService } from '@hooks/useService';
import { useServiceMessageHandler } from '@hooks/useServiceMessageHandler';
import { ConfirmationModal } from '@components/ConfirmationModal/ConfirmationModal';
import { DownloadScheduleButton } from '@components/DownloadScheduleButton/DownloadScheduleButton';
import { curry, noopSubmit } from '@utils/helpers';
import { toast } from 'react-toastify';
import { faCheck, faPencilAlt, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { maxScheduleNameLength } from '@components/Scheduler/Schedules/constants';
import { useFocus } from '@hooks/useFocus';
import { SaveScheduleModal } from '@components/Scheduler/Schedules/TermSchedule.SaveScheduleModal';

/**
 * A component that renders a the header for the provided schedule
 * @param props a HeaderProps object used to render the component
 * @return a JSX element containing the components to render
 */
const Header = (props: HeaderProps): JSX.Element => {
  const { t } = useTranslation(['scheduler', 'account', 'common', 'terms']);
  const { schedule, removeSchedule, userOwnsSchedule } = props;
  const [editName, setEditName] = useState<string>(schedule.name);
  const [asyncIsLoading, setAsyncIsLoading] = useState<boolean>(false);
  const [deleteModalIsShown, setDeleteModalIsShown] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const scheduleNameRef = useFocus<HTMLInputElement>(editMode);
  const schedulerService = useService(SchedulerService);
  const errorMsgHelper = useServiceMessageHandler();

  const handleEdit = (): void => {
    setEditName(schedule.name);
    setEditMode(true);
  };

  const handleDeleteSchedule = async (): Promise<void> => {
    try {
      setAsyncIsLoading(true);
      await schedulerService.deleteSchedule(schedule.id);
      toast.success(
        t('scheduler:success.schedule_delete', {
          term: schedule.term,
          context: schedule.name && 'with_name',
          name: schedule.name,
        }),
      );
      setDeleteModalIsShown(false);
      removeSchedule(schedule);
    } catch (e: unknown) {
      errorMsgHelper(e, t('scheduler:error.schedule_delete')).forEach((m) =>
        toast[m.type](m.message),
      );
    }
    setAsyncIsLoading(false);
  };

  const handleNameOnChange = (e: ChangeEvent<HTMLInputElement>) =>
    asyncIsLoading || setEditName(e.target.value);

  const handleCancel = (): void => setEditMode(false);

  const handleSave = async (): Promise<void> => {
    try {
      if (editName !== schedule.name) {
        setAsyncIsLoading(true);
        await schedulerService.renameSchedule(schedule.id, editName);
        // eslint-disable-next-line require-atomic-updates
        schedule.name = editName;
      }
      setEditMode(false);
    } catch (e: unknown) {
      errorMsgHelper(e, t('scheduler:error.change_schedule_name')).forEach((m) =>
        toast[m.type](m.message),
      );
    }
    setAsyncIsLoading(false);
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (asyncIsLoading) {
      return;
    }
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

  const [saveModalIsShown, setSaveModalIsShown] = useState<boolean>(false);
  const showSaveModal = (): void => setSaveModalIsShown(true);
  const hideSaveModal = (): void => setSaveModalIsShown(false);

  const onSaveSchedule = async (name: string, toCalendar: boolean): Promise<boolean> => {
    try {
      await schedulerService.saveSchedule(
        schedule.getCourseSkeletons(),
        schedule.term,
        toCalendar,
        name,
      );
      toast.success(t('account:success.schedule_saved'));
      hideSaveModal();
      return true;
    } catch (e: unknown) {
      errorMsgHelper(e, t('account:error.schedule_save')).forEach((m) => toast[m.type](m.message));
      return false;
    }
  };

  const handleMoveToDrafts = async (): Promise<void> => {
    setAsyncIsLoading(true);
    try {
      await schedulerService.moveScheduleToDrafts(schedule.id);
      toast.success(
        t('scheduler:success.move_to_drafts', {
          term: schedule.term,
          context: schedule?.name && 'with_name',
          name: schedule?.name,
        }),
      );
      removeSchedule(schedule);
    } catch (e: unknown) {
      errorMsgHelper(e, t('scheduler:error.move_to_drafts')).forEach((m) =>
        toast[m.type](m.message),
      );
    }
    setAsyncIsLoading(false);
  };

  return (
    <>
      <SaveScheduleModal
        show={saveModalIsShown}
        onHide={hideSaveModal}
        onSave={onSaveSchedule}
        term={schedule.term}
      />
      <ConfirmationModal
        onHide={curry(setDeleteModalIsShown, false)}
        onConfirm={handleDeleteSchedule}
        confirmationMessage={t('scheduler:delete_schedule_modal.message', {
          term: schedule.term,
          context: schedule.name && 'with_name',
          name: schedule.name,
        })}
        title={t('scheduler:delete_schedule_modal.title')}
        icon={faTrashAlt}
        confirmButtonLabel={t('common:delete')}
        show={deleteModalIsShown}
      />
      <Form onSubmit={noopSubmit}>
        <Form.Row className="term-schedule-header">
          <Col md={9} lg={10} className="mb-3">
            <div className="h4 semester-title mb-0 mt-2 align-text-bottom">
              {t('terms:term_title', { term: schedule.term })}
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
                  {schedule.name && (
                    <>
                      <span className="text-secondary">&nbsp;&ndash;&nbsp;</span>
                      <span className="small text-secondary" data-cy="val:schedule-name">
                        {schedule.name}
                      </span>
                    </>
                  )}
                  {userOwnsSchedule && (
                    <Button
                      onClick={handleEdit}
                      className="ml-2"
                      size="sm"
                      title={t('scheduler:edit_schedule_name')}
                      variant="outline-secondary"
                      disabled={asyncIsLoading}
                      data-cy="clk:edit-schedule-name"
                    >
                      <Icon icon={faPencilAlt} className="mr-sm-2" />
                      <span className="d-none d-sm-inline">
                        {t('scheduler:edit_schedule_name')}
                      </span>
                    </Button>
                  )}
                </>
              )}
            </div>
          </Col>
          <Col md={3} lg={2} className="mb-3">
            <InputGroup className="justify-content-end">
              <ButtonGroup>
                {userOwnsSchedule ? (
                  <Button
                    variant="outline-secondary"
                    onClick={handleMoveToDrafts}
                    title={t('scheduler:move_to_drafts')}
                    disabled={editMode || asyncIsLoading}
                    data-cy="clk:move-to-drafts"
                  >
                    <Icon icon={faCalendar} />
                  </Button>
                ) : (
                  <Button
                    variant="outline-secondary"
                    onClick={showSaveModal}
                    title={t('scheduler:save_schedule')}
                    data-cy="clk:save-schedule"
                  >
                    <Icon icon={faSave} />
                  </Button>
                )}
                <DownloadScheduleButton schedule={schedule} term={schedule.term} />
              </ButtonGroup>
              {userOwnsSchedule && (
                <Button
                  className="ml-2"
                  variant="outline-danger"
                  title={t('scheduler:delete_schedule_modal.title')}
                  onClick={curry(setDeleteModalIsShown, true)}
                  disabled={editMode || asyncIsLoading}
                  data-cy="clk:delete-schedule"
                >
                  <Icon icon={faTrashAlt} />
                </Button>
              )}
            </InputGroup>
          </Col>
        </Form.Row>
      </Form>
    </>
  );
};

export default Header;
