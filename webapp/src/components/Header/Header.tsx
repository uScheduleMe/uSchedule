import React, { useState } from 'react';
import './header.css';
import logo from '@src/logo.png';
import Navbar, { NavbarProps } from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import { ThemeDropdown } from '@components/ThemeDropdown/ThemeDropdown';
import { Link } from 'react-router-dom';
import { LanguageDropdown } from '@components/LanguageDropdown/LanguageDropdown';
import { UserIndicator } from '@components/UserIndicator/UserIndicator';
import { Alert, Button, Nav, OverlayTrigger, Popover } from 'react-bootstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faMinus, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { useEnvironmentStore } from '@stores/EnvironmentStore';
import { useTranslation } from 'react-i18next';
import i18n from '@src/i18n';

export const Header: React.FC<NavbarProps> = (props: NavbarProps) => {
  const { t } = useTranslation(['common', 'donate']);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const toggleCollapsed = (): void => setIsCollapsed(!isCollapsed);
  const {
    vars: { ENABLE_USER_ACCOUNTS },
  } = useEnvironmentStore();
  const [showDonateBanner, setShowDonateBanner] = useState(true);

  return (
    <>
      <Navbar bg="dark" variant="dark" expand={true} fixed="top" className="main-nav" {...props}>
        <Container className="px-sm-3">
          <Navbar.Brand as={Link} to="/">
            <img src={logo} className="site-icon mr-2" alt={t('common:uschedule_logo')} />
            <span className="site-title">
              uSchedule
              <span className="domain-suffix text-white-50">.me</span>
            </span>
          </Navbar.Brand>
          <Navbar.Toggle
            as="span"
            className={`menu-icon text-light ml-2 ${isCollapsed ? 'collapsed' : 'active'}`}
            aria-controls="main-navbar-nav"
            onClick={toggleCollapsed}
          >
            <Icon icon={faMinus} className="sub-icon top-left" />
            <Icon icon={faMinus} className="sub-icon top-right" />
            <Icon icon={faMinus} className="sub-icon middle-left" />
            <Icon icon={faMinus} className="sub-icon middle-right" />
            <Icon icon={faMinus} className="sub-icon bottom-left" />
            <Icon icon={faMinus} className="sub-icon bottom-right" />
          </Navbar.Toggle>
          <Navbar.Collapse id="main-navbar-nav">
            <Nav className="ml-auto">
              <ThemeDropdown className="control-icon px-1 ml-3 mr-0" />
              <LanguageDropdown className="control-icon px-1 ml-3 mr-0" />
              {ENABLE_USER_ACCOUNTS === 'true' && (
                <UserIndicator className="control-icon px-1 ml-3 mr-0" />
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {
        <Alert
          show={showDonateBanner}
          variant="info"
          className="donate-banner d-flex align-items-center justify-content-center rounded-0"
          onClose={() => setShowDonateBanner(false)}
          dismissible
        >
          {t('donate:banner_title')}
          <OverlayTrigger
            trigger="click"
            rootClose
            placement="bottom"
            overlay={
              <Popover id="popover-donate-info" content={true}>
                {t('donate:banner_info')}
              </Popover>
            }
          >
            <Icon icon={faInfoCircle} className="ml-2" role="button" fixedWidth />
          </OverlayTrigger>
          <Button
            variant="info"
            className="btn-sm ml-4"
            onClick={() =>
              window.open(
                `https://www.paypal.com/donate/?hosted_button_id=L3GURR8W25VNQ&locale.x=${i18n.language}`,
                '_blank',
                'location=no,height=700,width=550,scrollbars=yes,status=yes',
              )
            }
          >
            {t('common:donate')}
          </Button>
        </Alert>
      }
    </>
  );
};
