let intervalId: NodeJS.Timeout | null = null;

export const keepAlive = (() => {
  return (state: boolean) => {
    if (state && !intervalId) {
      if (performance.now() > 20000) {
        chrome.runtime.getPlatformInfo();
      }
      intervalId = setInterval(() => {
        chrome.runtime.getPlatformInfo();
      }, 20000);
    } else if (!state && intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
})();
