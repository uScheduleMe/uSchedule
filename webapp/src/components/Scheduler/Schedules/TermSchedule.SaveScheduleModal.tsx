import React, { ChangeEvent, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faCalendar } from '@fortawesome/free-regular-svg-icons';
import { useTranslation } from 'react-i18next';
import Modal from 'react-bootstrap/Modal';
import { maxScheduleNameLength } from './constants';
import Spinner from 'react-bootstrap/Spinner';
import { SaveScheduleModalProps } from './types';
import { noopSubmit } from '@utils/helpers';

/**
 * A component that renders a modal to prompt for schedule save options
 * @param props a ModalProps object used to render the component
 * @return a JSX element containing the components to render
 */
export const SaveScheduleModal: React.FC<SaveScheduleModalProps> = (
  props: SaveScheduleModalProps,
) => {
  const { t } = useTranslation(['scheduler', 'terms']);
  const { onSave: save, onHide, term, ...modalProps } = props;
  const [name, setName] = useState<string>('');
  const [isCalendar, setIsCalendar] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleNameFieldChange = (event: ChangeEvent<HTMLInputElement>): void =>
    setName(event.currentTarget.value);

  const handleSave = (inCalendar: boolean) => async (): Promise<void> => {
    setIsSaving(true);
    setIsCalendar(inCalendar);
    if (await save(name, inCalendar)) {
      setName('');
    }
    setIsSaving(false);
  };

  const onHideInternal = (): void => {
    onHide && onHide();
    setName('');
  };

  return (
    <Modal {...modalProps} onHide={onHideInternal} aria-labelledby="save-schedule-modal" centered>
      <Modal.Header closeButton>
        <Modal.Title as="h5" id="save-schedule-modal">
          {t('scheduler:save_schedule')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {term && <p>{t('terms:term_title', { term })}</p>}
        <Form onSubmit={noopSubmit}>
          <Form.Group controlId="schedule-save-name">
            <Form.Label>{t('scheduler:schedule_name_optional')}:</Form.Label>
            <Form.Control
              type="text"
              maxLength={maxScheduleNameLength}
              value={name}
              onChange={handleNameFieldChange}
              data-cy="txt:schedule-name"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          onClick={handleSave(true)}
          disabled={isSaving}
          data-cy="clk:save-calendar"
        >
          {isSaving && isCalendar ? (
            <Spinner animation="border" size="sm" className="mr-2" role="status" />
          ) : (
            <Icon icon={faCalendarAlt} className="mr-2" />
          )}
          {t('scheduler:save_to_calendar')}
        </Button>
        <Button onClick={handleSave(false)} disabled={isSaving} data-cy="clk:save-draft">
          {isSaving && !isCalendar ? (
            <Spinner animation="border" size="sm" className="mr-2" role="status" />
          ) : (
            <Icon icon={faCalendar} className="mr-2" />
          )}
          {t('scheduler:save_draft')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
