function extractContent(mode: "content" | "headers"): string {
  if (mode === "headers") {
    const headers = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    let content = "";

    headers.forEach((header) => {
      content += (header as HTMLElement).innerText + "\n";
    });

    return content.trim();
  } else {
    return document.body.innerText;
  }
}

chrome.runtime.onMessage.addListener((message: any) => {
  if (message.type === "TAB_CHANGE") {
    const content = extractContent("content");
    const headers = extractContent("headers");

    const tabContentMessage = {
      type: "TAB_CONTENT",
      timestamp: new Date().toISOString(),
      details: {
        title: message.title || document.title,
        url: message.url || window.location.href,
        content,
        headers,
      },
    };

    chrome.runtime.sendMessage(tabContentMessage).catch(console.error);
  }
});

export {};
