import {startInteractionLogger, stopInteractionLogger} from './pageLogger';

export const handleBrowserIdleState = (startFn: () => void, stopFn: () => void): void => {
  chrome.idle.onStateChanged.addListener((newState) => {
    if (newState === 'idle' || newState === 'locked') {
      console.log('User is idle or screen is locked, stopping activities.');
      stopFn();
    } else if (newState === 'active') {
      console.log('User is active, starting activities.');
      startFn();
    }
  });
};

export const startAllBackgroundJobs = (): void => {
  startInteractionLogger();
};

export const stopAllBackgroundJobs = (): void => {
  stopInteractionLogger();
};
