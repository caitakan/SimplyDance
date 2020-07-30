import * as React from 'react';
import { RouteComponentProps } from 'react-router';

export const SimplyDanceHomePage = (props: RouteComponentProps<{ [key: string]: string }>) => {
  const onExerciseClick = () => {
    props.history.push('/exercise');
  };
  const onplayClick = () => {
    props.history.push('/play');
  };
  return (
    <div className="home-page-button-container">
      <button className="mode-button" onClick={onExerciseClick}>
        Exercise
      </button>
      <button className="mode-button" onClick={onplayClick}>
        Play
      </button>
    </div>
  );
};
