import React, { useState, useRef } from 'react';
import { Tabs, Tab, Container, Overlay, Popover, Button } from 'react-bootstrap';
import { Courses } from './Courses/Courses';
import { Options } from './Options/Options';
import { Schedules } from './Schedules/Schedules';
import { SelectCallback } from 'react-bootstrap/esm/helpers';
import { PageTitle } from '@components/PageTitle/PageTitle';
import { Link } from 'react-router-dom';
import { useScheduleBuilderStore } from '@stores/ScheduleBuilderStore';
import { useTranslation } from 'react-i18next';

/**
 * A component that renders a set of schedules for terms
 * @param props a SchedulesProps object used to render the component
 * @return a JSX element containing the components to render
 */
export const Scheduler: React.FC = () => {
  const { t } = useTranslation(['scheduler', 'common']);
  const [popoverIsVisible, setPopoverIsVisible] = useState<boolean>(false);
  const [popoverText, setPopoverText] = useState<string>('');
  const [popoverTarget, setPopoverTarget] = useState<
    EventTarget | React.RefObject<HTMLElement> | null
  >(null);
  const popoverContainerRef = useRef(null);
  const onHideOverlay = (): void => setPopoverIsVisible(false);
  const showSimplePopover = (
    text: string,
    target: EventTarget | React.RefObject<HTMLElement> | HTMLElement | null,
  ): void => {
    setPopoverText(text);
    setPopoverTarget(target);
    setPopoverIsVisible(true);
  };

  const [activeKey, setActiveKey] = useState<string>('courses');
  const [courseIsLoading, setCourseIsLoading] = useState<boolean>(false);
  const { coursesByTerm } = useScheduleBuilderStore();
  const pageTitle = t('common:schedule_builder');

  const moveToSchedulesTab = async (): Promise<void> => {
    if (courseIsLoading) {
      return;
    }

    if (!Object.values(coursesByTerm).length) {
      showSimplePopover(
        t('scheduler:error.please_add_course'),
        document.getElementById('schedule-builder-tab-schedule'),
      );
      return;
    }

    setActiveKey('schedule');
  };

  const handleTabSelect: SelectCallback = (eventKey: string | null): void => {
    if (!eventKey || eventKey === activeKey) {
      return;
    }
    if (eventKey === 'schedule') {
      moveToSchedulesTab();
    } else {
      setActiveKey(eventKey);
    }
  };

  return (
    <Container ref={popoverContainerRef}>
      <PageTitle headTitle={pageTitle}>
        {pageTitle}
        <Button
          as={Link}
          to="/feedback"
          variant="outline-info"
          className="btn-sm float-right ml-2 mt-1"
        >
          {t('common:feedback')}
        </Button>
      </PageTitle>
      <div id="schedule_builder_container">
        <Tabs activeKey={activeKey} onSelect={handleTabSelect} id="schedule-builder">
          <Tab eventKey="courses" title={t('common:courses')} className="pt-3">
            <Courses
              moveToSchedulesTab={moveToSchedulesTab}
              setCourseIsLoading={setCourseIsLoading}
              courseIsLoading={courseIsLoading}
              showSimplePopover={showSimplePopover}
            />
          </Tab>
          <Tab
            eventKey="options"
            title={t('common:options')}
            className="pt-3"
            unmountOnExit
            disabled={courseIsLoading}
          >
            <Options moveToSchedulesTab={moveToSchedulesTab} courseIsLoading={courseIsLoading} />
          </Tab>
          <Tab
            eventKey="schedule"
            title={t('common:schedules')}
            className="pt-3"
            unmountOnExit
            disabled={courseIsLoading}
          >
            <Schedules />
          </Tab>
        </Tabs>
      </div>
      <Overlay
        show={popoverIsVisible}
        target={popoverTarget as HTMLElement}
        placement="bottom"
        container={popoverContainerRef}
        rootClose={true}
        onHide={onHideOverlay}
      >
        <Popover id="alert-tip-message" content>
          {popoverText}
        </Popover>
      </Overlay>
    </Container>
  );
};
