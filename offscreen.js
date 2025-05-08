chrome.runtime.onMessage.addListener(handleMessages);

async function handleMessages(message) {
  if (message.target !== "offscreen") {
    return false;
  }

  switch (message.type) {
    case "parse-page":
      parsePage(message.data);
      break;
    default:
      console.warn(`Unexpected message type received: '${message.type}'.`);
      return false;
  }
}

async function parsePage({ pinId, htmlString }) {
  try {
    const parser = new DOMParser();
    const document = parser.parseFromString(htmlString, "text/html");
    const data = {
      props: JSON.parse(
        document.getElementById("__PWS_INITIAL_PROPS__")?.innerText
      )?.initialReduxState?.pins[pinId],
    };
    chrome.runtime.sendMessage({
      type: "page-data-result",
      target: "background",
      data,
    });
  } catch (e) {
    throw Error(e);
  }
}
