import React from 'react';
import { Route, Switch } from 'react-router';
import { hot } from 'react-hot-loader';
import { SimplyDanceContainer } from './containers/SimplyDance/SimplyDanceContainer';

export const App = hot(module)(() => (
  <Switch>
    <Route path="/:filter" exact component={SimplyDanceContainer} />
    <Route path="/" component={SimplyDanceContainer} />
  </Switch>
));
