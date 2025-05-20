import React, { useState } from 'react';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { HeaderProps } from './types';
import { useScheduleBuilderStore } from '@stores/ScheduleBuilderStore';
import { useUserStore } from '@stores/UserStore';
import { CourseSchedule } from '@models/CourseSchedule';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { faSave } from '@fortawesome/free-regular-svg-icons';
import { useTranslation } from 'react-i18next';
import { SaveScheduleModal } from './TermSchedule.SaveScheduleModal';
import { SchedulerService } from '@services/Scheduler/Scheduler';
import { useServiceMessageHandler } from '@hooks/useServiceMessageHandler';
import { toast } from 'react-toastify';
import { useService } from '@hooks/useService';
import { Term } from '@models/Term';
import { DownloadScheduleButton } from '@components/DownloadScheduleButton/DownloadScheduleButton';

/**
 * A component that renders a the header for the provided schedule
 * @param props a HeaderProps object used to render the component
 * @return a JSX element containing the components to render
 */
const Header: React.FC<HeaderProps> = (props: HeaderProps) => {
  const { t } = useTranslation(['scheduler', 'account', 'common', 'terms']);
  const { termScheduleSetData, updateScheduleIdx, scheduleIdx } = props;

  const { userIsSignedIn } = useUserStore();
  const { termList } = useScheduleBuilderStore();

  const numSchedules: number = termScheduleSetData.schedules.length;
  const [scheduleNum, setScheduleNum] = useState<number>(scheduleIdx + 1);
  const schedule: CourseSchedule = termScheduleSetData.schedules[scheduleIdx];
  const term: Term = termList[termScheduleSetData.term.id];
  const offset = 1;
  const emptyScheduleIdx = -1;

  const handleScheduleNumChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
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

  const [saveModalIsShown, setSaveModalIsShown] = useState<boolean>(false);
  const showSaveModal = (): void => setSaveModalIsShown(true);
  const hideSaveModal = (): void => setSaveModalIsShown(false);

  const schedulerService = useService(SchedulerService);
  const errorMsgHelper = useServiceMessageHandler();

  const onSaveSchedule = async (name: string, toCalendar: boolean): Promise<boolean> => {
    try {
      await schedulerService.saveSchedule(schedule.getCourseSkeletons(), term, toCalendar, name);
      toast.success(t('account:success.schedule_saved'));
      hideSaveModal();
      return true;
    } catch (e: unknown) {
      errorMsgHelper(e, t('account:error.schedule_save')).forEach((m) => toast[m.type](m.message));
      return false;
    }
  };

  return (
    <>
      <SaveScheduleModal
        show={userIsSignedIn && saveModalIsShown}
        onHide={hideSaveModal}
        onSave={onSaveSchedule}
        term={term}
      />
      <Form.Row className="term-schedule-header">
        <Col md={6} lg={7} xl={7} className="mb-3">
          <div className="h4 semester-title mb-0 mt-2 align-text-bottom">
            {t('terms:term_title', { term })}
          </div>
        </Col>
        <Col md={6} lg={5} xl={5} className="mb-3">
          <InputGroup className="flex-fill justify-content-end">
            <InputGroup.Prepend>
              <InputGroup.Text>
                <span className="d-sm-none d-md-inline d-lg-none">{t('common:sched')}</span>
                <span className="d-none d-sm-inline d-md-none d-lg-inline">
                  {t('common:schedule')}
                </span>
              </InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              style={{ minWidth: '2.25rem' }}
              type="text"
              value={Number.isNaN(scheduleNum) ? '' : scheduleNum}
              onChange={handleScheduleNumChange}
              data-cy="txt:sched-id"
            />
            <InputGroup.Append>
              <InputGroup.Text data-cy="val:course-count">
                {t('common:of')}&nbsp;{numSchedules}
              </InputGroup.Text>
              <Button
                variant="outline-secondary"
                onClick={decrementScheduleIdx}
                data-cy="clk:decr-sched"
              >
                <Icon icon={faCaretLeft} size="lg" />
              </Button>
              <Button
                variant="outline-secondary"
                onClick={incrementScheduleIdx}
                data-cy="clk:inc-sched"
                className="rounded-right"
              >
                <Icon icon={faCaretRight} size="lg" />
              </Button>
            </InputGroup.Append>
            <ButtonGroup className="ml-2">
              {userIsSignedIn && (
                <Button
                  variant="outline-secondary"
                  onClick={showSaveModal}
                  title={t('scheduler:save_schedule')}
                  data-cy="clk:save-schedule"
                >
                  <Icon icon={faSave} />
                </Button>
              )}
              <DownloadScheduleButton
                schedule={schedule}
                term={termScheduleSetData.term}
                disabled={scheduleIdx < 0}
              />
            </ButtonGroup>
          </InputGroup>
        </Col>
      </Form.Row>
    </>
  );
};

export default Header;
