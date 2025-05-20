import { ModalProps } from 'react-bootstrap/Modal';

export interface ShareSheetProps extends ModalProps {
  title?: string;
  closeButton?: boolean;
}
