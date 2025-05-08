const OFFSCREEN_DOCUMENT_PATH = "/offscreen.html";

chrome.webNavigation.onCompleted.addListener(async () => {
  // console.info("onCompleted");
  await sendMessage();
});

chrome.webNavigation.onHistoryStateUpdated.addListener(async () => {
  // console.info("onHistoryStateUpdated");
  await sendMessage();
});

chrome.runtime.onMessage.addListener(handleMessages);

async function handleMessages(message) {
  if (message.target !== "background") {
    return;
  }

  switch (message.type) {
    case "page-data-result":
      await handlePageDataResult(message.data);
      break;
    default:
      console.warn(`Unexpected message type received: '${message.type}'.`);
  }
}

async function getNotesfromCurrentPin() {
  const currentTab = await getCurrentTab();

  if (!(await hasDocument())) {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: [chrome.offscreen.Reason.DOM_PARSER],
      justification: "Parse DOM",
    });
  }

  const url = currentTab.url;
  const pinId = url.match(/\/pin\/(\d+)/)[1];
  const htmlString = await fetch(url).then((data) => data.text());

  // console.debug("Sending message to offscreen.js");
  await chrome.runtime.sendMessage({
    type: "parse-page",
    target: "offscreen",
    data: { pinId, htmlString },
  });
}

async function getCurrentTab() {
  const queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

async function sendMessage() {
  const currentTab = await getCurrentTab();
  if (currentTab && currentTab.url) {
    // console.log("Current tab URL:", currentTab.url);
    if (currentTab.url.includes("/pin/")) {
      await getNotesfromCurrentPin();
    } else {
      await chrome.tabs.sendMessage(currentTab.id, {
        target: "content",
        type: "hideNotes",
      });
    }
  }
}

async function handlePageDataResult(data) {
  const pinData = {
    note: data.props.pin_note?.text,
  };
  closeOffscreenDocument();
  // console.log(pinData);
  // Send the pinData to the content script
  const currentTab = await getCurrentTab();
  await chrome.tabs.sendMessage(currentTab.id, {
    target: "content",
    type: "showNotes",
    data: pinData,
  });
}

async function closeOffscreenDocument() {
  if (!(await hasDocument())) {
    return;
  }
  await chrome.offscreen.closeDocument();
}

async function hasDocument() {
  const matchedClients = await clients.matchAll();
  for (const client of matchedClients) {
    if (client.url.endsWith(OFFSCREEN_DOCUMENT_PATH)) {
      return true;
    }
  }
  return false;
}
