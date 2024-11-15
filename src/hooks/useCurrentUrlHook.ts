import { useEffect, useState } from "react";

const useCurrentUrl = () => {
  const [currentUrl, setCurrentUrl] = useState<string>("");

  useEffect(() => {
    const updateUrl = async () => {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (tab.url && tab.url !== currentUrl) {
          setCurrentUrl(tab.url);
        }
      } catch (error) {
        console.error("Failed to get current tab URL: ", error);
      }
    };

    updateUrl();

    chrome.tabs.onUpdated.addListener(updateUrl);
    chrome.tabs.onActivated.addListener(updateUrl);

    return () => {
      chrome.tabs.onUpdated.removeListener(updateUrl);
      chrome.tabs.onActivated.removeListener(updateUrl);
    };
  }, [currentUrl]);

  return currentUrl;
};

export default useCurrentUrl;
