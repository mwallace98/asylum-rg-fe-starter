import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import Auth0ProviderWithHistory from '../auth/auth0-provider-with-history';



const PrivateRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated } = Auth0ProviderWithHistory();

  return (
    <Route
      {...rest}
      render={props =>
        isAuthenticated ? <Component {...props} /> : <Redirect to="/" />
      }
    />
  );
};

export default PrivateRoute;