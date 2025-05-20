import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { ModalProps } from 'react-bootstrap/Modal';

export interface ConfirmationModalProps extends ModalProps {
  onConfirm: () => Promise<void>;
  confirmationMessage: string;
  title: string;
  confirmationIcon?: IconDefinition;
  confirmButtonLabel?: string;
  cancelButtonLabel?: string;
  onHide: () => void;
}
