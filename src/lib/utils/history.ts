export const fetchBrowsingHistory = (startTime: number, endTime: number, maxResults: number = 5000): Promise<chrome.history.HistoryItem[]> => {
  return new Promise((resolve, reject) => {
    chrome.history.search({
      text: '',
      startTime,
      endTime,
      maxResults: maxResults
    }, (historyItems) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(historyItems);
    });
  });
};
