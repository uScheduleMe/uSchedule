import React from 'react';
import './AccountSettings.Accounts.css';
import { Card, ListGroup } from 'react-bootstrap';
import { AccountsProps } from './AccountSettings.Accounts.types';
import { mergeClassNames } from '@utils/mergeClassNames';
import { identityProviders } from './AccountSettings.Accounts.constants';
import { useTranslation } from 'react-i18next';

export const Accounts: React.FC<AccountsProps> = (props: AccountsProps) => {
  const { user, className, ...cardProps } = props;
  const { t } = useTranslation(['account']);
  const classes = mergeClassNames('connected-accounts', className);
  const providers = user?.providers ?? [];
  return (
    <Card {...cardProps} className={classes}>
      <Card.Header as="h4">
        {t('account:connected_account', { count: providers.length })}
      </Card.Header>
      <Card.Body className="py-0">
        <ListGroup variant="flush">
          {providers.map(({ provider }) => (
            <ListGroup.Item className="px-0" key={provider}>
              <img
                src={identityProviders[provider].imageSrc}
                alt={identityProviders[provider].name}
                className="mr-3"
              />
              {identityProviders[provider].name}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};
