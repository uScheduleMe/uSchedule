import React, { RefObject, ChangeEvent, useEffect, useRef, useState, LegacyRef } from 'react';
import { Button, Col, Container, Form, Overlay, Popover, Spinner } from 'react-bootstrap';
import { PageTitle } from '@components/PageTitle/PageTitle';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { FeedbackService } from '@services/Feedback/Feedback';
import { useTranslation } from 'react-i18next';
import { useService } from '@hooks/useService';
import { noopSubmit } from '@utils/helpers';
import { useUserStore } from '@stores/UserStore';
import IconAlert from '@components/IconAlert/IconAlert';
import ReCAPTCHA from 'react-google-recaptcha';
import { useEnvironmentStore } from '@stores/EnvironmentStore';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

export const Feedback = (): JSX.Element => {
  const { t, i18n } = useTranslation(['feedback', 'common']);
  const { user, userIsSignedIn } = useUserStore();
  const {
    vars: { RECAPTCHA_SITE_KEY },
    env_is_loaded,
    theme,
  } = useEnvironmentStore();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [feedbackIsSending, setFeedbackIsSending] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [popoverIsVisible, setPopoverIsVisible] = useState<boolean>(false);
  const [popoverText, setPopoverText] = useState<string>('');
  const [popoverTarget, setPopoverTarget] = useState<EventTarget | RefObject<HTMLElement> | null>(
    null,
  );
  const pageTitle = t('common:feedback');
  const feedbackService = useService(FeedbackService);
  const g_recaptcha_is_enabled = !!RECAPTCHA_SITE_KEY;

  useEffect(() => {
    if (user) {
      setName(user.display_name);
      setEmail(user.email);
    }
  }, [user]);

  const subjectRef = useRef(null);
  const messageRef = useRef(null);
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
  const recaptchaContainerRef = useRef(null);
  const popoverContainerRef = useRef(null);

  const onHideOverlay = (): void => setPopoverIsVisible(false);

  const showSimplePopover = (
    text: string,
    target: EventTarget | RefObject<HTMLElement> | HTMLElement | null,
  ): void => {
    setPopoverText(text);
    setPopoverTarget(target);
    setPopoverIsVisible(true);
  };

  const updateValue =
    (setter: (v: string) => void) =>
    (event: ChangeEvent<HTMLInputElement>): void => {
      setter(event.target.value);
    };

  const sendFeedback = async (): Promise<void> => {
    if (feedbackIsSending) {
      return;
    }

    setShowSuccess(false);
    setShowError(false);
    const g_recaptcha_response = recaptchaRef.current?.getValue() ?? undefined;

    if (subject.trim().length < 1) {
      showSimplePopover(t('feedback:error.subject_required'), subjectRef);
      return;
    }

    if (message.trim().length < 1) {
      showSimplePopover(t('feedback:error.message_required'), messageRef);
      return;
    }

    if (g_recaptcha_is_enabled && !g_recaptcha_response) {
      showSimplePopover(t('feedback:error.recaptcha_required'), recaptchaContainerRef);
      return;
    }

    setFeedbackIsSending(true);

    try {
      await feedbackService.submit(
        name,
        email,
        userIsSignedIn,
        subject,
        message,
        g_recaptcha_response,
      );
      setSubject('');
      setMessage('');
      setShowSuccess(true);
      recaptchaRef.current?.reset();
    } catch (e: unknown) {
      setShowError(true);
    }

    setFeedbackIsSending(false);
  };

  return (
    <Container ref={popoverContainerRef}>
      <PageTitle headTitle={pageTitle}>{pageTitle}</PageTitle>
      <p className="mb-4">{t('feedback:report_bug')}</p>
      <IconAlert variant="success" show={showSuccess} className="mb-4">
        {t('feedback:success.message_sent')}
      </IconAlert>
      <IconAlert variant="danger" show={showError} className="mb-4">
        {t('feedback:error.message_sent_fail')}
      </IconAlert>
      <Form onSubmit={noopSubmit}>
        <Form.Row>
          <Form.Group as={Col} xs={12} md={6}>
            <Form.Label htmlFor="name">{t('feedback:first_and_last')}</Form.Label>
            <Form.Control
              id="name"
              type="text"
              value={name}
              onChange={updateValue(setName)}
              disabled={userIsSignedIn || feedbackIsSending}
            />
          </Form.Group>
          <Form.Group as={Col} xs={12} md={6}>
            <Form.Label htmlFor="email">{t('feedback:email_address')}</Form.Label>
            <Form.Control
              id="email"
              type="email"
              value={email}
              onChange={updateValue(setEmail)}
              disabled={userIsSignedIn || feedbackIsSending}
            />
          </Form.Group>
          <Form.Group as={Col} xs={12}>
            <Form.Label htmlFor="subject">
              <span className="text-danger mr-1">*</span>
              {t('common:subject')}
            </Form.Label>
            <Form.Control
              ref={subjectRef}
              id="subject"
              type="text"
              value={subject}
              onChange={updateValue(setSubject)}
              disabled={feedbackIsSending}
            />
          </Form.Group>
          <Form.Group as={Col} xs={12}>
            <Form.Label htmlFor="message">
              <span className="text-danger mr-1">*</span>
              {t('common:message')}
            </Form.Label>
            <Form.Control
              ref={messageRef}
              id="message"
              as="textarea"
              rows={10}
              value={message}
              onChange={updateValue(setMessage)}
              disabled={feedbackIsSending}
            />
          </Form.Group>
          {g_recaptcha_is_enabled && (
            <Form.Group as={Col} xs={12}>
              <span ref={recaptchaContainerRef}>
                <ReCAPTCHA
                  ref={recaptchaRef as LegacyRef<ReCAPTCHA>}
                  sitekey={RECAPTCHA_SITE_KEY}
                  hl={i18n.language}
                  theme={theme}
                />
              </span>
            </Form.Group>
          )}
          <Form.Group as={Col} xs={12}>
            <Button
              variant="primary"
              onClick={sendFeedback}
              disabled={feedbackIsSending || !env_is_loaded}
            >
              {feedbackIsSending ? (
                <>
                  <Spinner animation="border" size="sm" className="mr-2" role="status" />
                  {t('common:sending')}
                </>
              ) : (
                <>
                  <Icon icon={faPaperPlane} className="mr-2" />
                  {t('common:send')}
                </>
              )}
            </Button>
          </Form.Group>
        </Form.Row>
      </Form>
      <Overlay
        show={popoverIsVisible}
        target={popoverTarget as HTMLElement}
        placement="top-start"
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
