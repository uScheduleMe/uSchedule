import React, { useRef, useState } from 'react';
import { Overlay, OverlayProps, Popover } from 'react-bootstrap';

/**
 * A hook that displays a popover with only text content.
 * @typedef C the type of the container that the returned container ref will be attached to
 * @param id the id attribute of the popover component
 * @param overlayProps an object with props to be set on the Overlay component
 * @returns an Overlay component that needs to be rendered somewhere in the calling component,
 * a show function that is used to activate the popover with a given message and target,
 * a hide function which can be used to cose the popover programmatically,
 * an containerRef used to anchor the popover when scrolling (needs to be attached to a parent component: ref={spContainerRef})
 */
export const useSimplePopover = <C extends HTMLElement>(
  id: string,
  overlayProps: Partial<Omit<OverlayProps, 'children' | 'show' | 'target'>> = {},
): {
  SPOverlay: React.FC;
  containerRef: React.RefObject<C>;
  show: (text: string, target: OverlayProps['target']) => void;
  hide: () => void;
} => {
  const [show, setShow] = useState<boolean>(false);
  const [text, setText] = useState<string>('');
  const [target, setTarget] = useState<OverlayProps['target']>(null);
  const containerRef = useRef<C>(null);

  const { onHide: callerOnHide, onExited: callerOnExited, ...filteredOverlayProps } = overlayProps;

  const onExited = (node: HTMLElement): void => {
    setTarget(null);
    callerOnExited && callerOnExited(node);
  };

  const onHide = (e: Event): void => {
    callerOnHide && callerOnHide(e);
    setShow(false);
  };

  const hide = (): void => setShow(false);

  const mergedProps: Omit<OverlayProps, 'children'> = {
    placement: 'bottom',
    rootClose: true,
    container: containerRef,
    ...filteredOverlayProps,
    show,
    target,
    onHide,
    onExited,
  };

  const SPOverlay: React.FC = () => (
    <Overlay {...mergedProps}>
      <Popover id={id} content>
        {text}
      </Popover>
    </Overlay>
  );

  const showSimplePopover = (text: string, target: OverlayProps['target']): void => {
    setText(text);
    setTarget(target);
    setShow(true);
  };

  return { SPOverlay, show: showSimplePopover, containerRef, hide };
};
