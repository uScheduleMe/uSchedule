import React from 'react';
import { PageTitleProps } from './types';
import { Helmet } from 'react-helmet';

/**
 * A component that renders the page title
 * @param props a PageTitleProps object used to render the component
 * @return a JSX element containing the components to render
 */
export const PageTitle: React.FC<PageTitleProps> = (props: PageTitleProps) => {
  // Note: the head title will revert to the default if undefined or empty string is provided
  return (
    <>
      <Helmet>
        <title>{props.headTitle}</title>
      </Helmet>
      <h1 className="h2 pt-2 pb-3">{props.children}</h1>
    </>
  );
};
