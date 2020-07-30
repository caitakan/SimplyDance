import React from 'react';
import { Route, Switch } from 'react-router';
import { hot } from 'react-hot-loader';
import { SimplyDanceContainer } from './containers/SimplyDance/SimplyDanceContainer';
import { SimplyDanceHomePage } from './containers/SimplyDance/SimplyDanceHomePage';

export const App = hot(module)(() => (
  <Switch>
    <Route exact path="/" component={SimplyDanceHomePage} />
    <Route path="/:mode" exact component={SimplyDanceContainer} />
  </Switch>
));
