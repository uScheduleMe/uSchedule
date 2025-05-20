import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import { ConfirmationModalProps } from './types';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

/**
 * A component that renders a modal to prompt for schedule save options
 * @param props a ModalProps object used to render the component
 * @return a JSX element containing the components to render
 */
export const ConfirmationModal: React.FC<ConfirmationModalProps> = (
  props: ConfirmationModalProps,
) => {
  const { t } = useTranslation(['common']);
  const {
    onConfirm,
    title,
    confirmationMessage,
    icon,
    confirmButtonLabel,
    cancelButtonLabel,
    ...modalProps
  } = props;
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleConfirm = async (): Promise<void> => {
    setIsLoading(true);
    await onConfirm();
    setIsLoading(false);
  };

  return (
    <Modal {...modalProps} aria-labelledby="confirmation-modal" centered>
      <Modal.Header closeButton>
        <Modal.Title as="h5" id="confirmation-modal">
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{confirmationMessage}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={modalProps.onHide} disabled={isLoading}>
          {cancelButtonLabel ?? t('common:cancel')}
        </Button>
        <Button variant="danger" onClick={handleConfirm} disabled={isLoading} data-cy="clk:confirm">
          {isLoading ? (
            <Spinner animation="border" size="sm" className="mr-2" role="status" />
          ) : (
            <Icon icon={icon ?? faExclamationTriangle} className="mr-2" />
          )}
          {confirmButtonLabel ?? t('common:confirm')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
