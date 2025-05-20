import React, { HTMLAttributes } from 'react';
import './footer.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';
import { useEnvironmentStore } from '@stores/EnvironmentStore';
import { useTranslation } from 'react-i18next';

export const Footer: React.FC<HTMLAttributes<HTMLElement>> = (
  props: HTMLAttributes<HTMLElement>,
) => {
  const {
    vars: { ENV, SHOW_ENV_NAME, ENABLE_USER_ACCOUNTS },
  } = useEnvironmentStore();
  const envName = SHOW_ENV_NAME === 'true' && ENV ? ` | ${ENV}` : null;
  const { t, i18n } = useTranslation(['common']);

  return (
    <footer
      id="page-footer"
      className="bg-dark text-white-50"
      itemProp="hasPart"
      itemScope={true}
      itemType="http://schema.org/WPFooter"
      {...props}
    >
      <Container>
        <Row>
          <Col sm={6} className="text-center text-sm-left mb-1">
            <Link className="footer-link text-light" to="/info">
              {t('common:info')}
            </Link>
            &nbsp;|&nbsp;
            <a
              className="footer-link text-light c-pointer"
              onClick={() =>
                window.open(
                  `https://www.paypal.com/donate/?hosted_button_id=L3GURR8W25VNQ&locale.x=${i18n.language}`,
                  '_blank',
                  'location=no,height=700,width=550,scrollbars=yes,status=yes',
                )
              }
            >
              {t('common:donate')}
            </a>
            &nbsp;|&nbsp;
            <Link className="footer-link text-light" to="/feedback">
              {t('common:feedback')}
            </Link>
            {ENABLE_USER_ACCOUNTS === 'true' && (
              <>
                &nbsp;|&nbsp;
                <Link className="footer-link text-light" to="/privacy">
                  {t('common:privacy')}
                </Link>
              </>
            )}
          </Col>
          <Col sm={6} className="text-center text-sm-right">
            <span className="footer-info">
              &copy; <Moment format="YYYY" /> | uSchedule v
              {process.env.REACT_APP_VERSION ?? 'X.Y.Z'}
              {envName}
            </span>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};
