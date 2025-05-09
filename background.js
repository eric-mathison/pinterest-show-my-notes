const OFFSCREEN_DOCUMENT_PATH = "/offscreen.html"
let currentTabId = null
let currentTabUrl = null

chrome.webNavigation.onCompleted.addListener(async () => {
  // console.info("onCompleted");
  const message = await sendMessage()
  // console.log("Message sent:", message)
})

chrome.webNavigation.onHistoryStateUpdated.addListener(async () => {
  // console.info("onHistoryStateUpdated");
  const message = await sendMessage()
  // console.log("Message sent:", message)
})

chrome.runtime.onMessage.addListener(handleMessages)

async function handleMessages(message) {
  if (message.target !== "background") {
    return
  }

  switch (message.type) {
    case "page-data-result":
      await handlePageDataResult(message.data)
      break
    default:
      console.warn(`Unexpected message type received: '${message.type}'.`)
  }
}

async function getNotesfromCurrentPin() {
  // const currentTab = await getCurrentTab()

  if (!(await hasDocument())) {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: [chrome.offscreen.Reason.DOM_PARSER],
      justification: "Parse DOM",
    })
  }

  const url = currentTabUrl
  const pinId = url.match(/\/pin\/(\d+)/)[1]
  const htmlString = await fetch(url).then((data) => data.text())

  // console.debug("Sending message to offscreen.js");
  try {
    await chrome.runtime.sendMessage({
      type: "parse-page",
      target: "offscreen",
      data: { pinId, htmlString },
    })
  } catch (error) {
    console.error("Error sending message to offscreen.js:", error)
  }
}

async function getCurrentTab() {
  const queryOptions = { active: true, lastFocusedWindow: true }
  let [tab] = await chrome.tabs.query(queryOptions)
  return tab
}

async function sendMessage() {
  const currentTab = await getCurrentTab()
  if (
    currentTab &&
    currentTab.url &&
    currentTab.url.includes("pinterest.com") &&
    currentTab.status === "complete"
  ) {
    // console.log("Current Tab:", currentTab)
    // console.log("Current tab URL:", currentTab.url);
    if (currentTab.url.includes("/pin/")) {
      currentTabId = currentTab.id
      currentTabUrl = currentTab.url
      await getNotesfromCurrentPin()
    } else {
      try {
        await chrome.tabs.sendMessage(currentTabId, {
          target: "content",
          type: "hideNotes",
        })
        return "success"
      } catch (error) {
        console.error("Error sending message to content script:", error)
        return false
      }
    }
  }
}

async function handlePageDataResult(data) {
  const pinData = {
    note: data.props.pin_note?.text,
  }
  closeOffscreenDocument()
  // console.log(pinData);
  // Send the pinData to the content script
  // const currentTab = await getCurrentTab()
  try {
    await chrome.tabs.sendMessage(currentTabId, {
      target: "content",
      type: "showNotes",
      data: pinData,
    })
  } catch (error) {
    console.error("Error sending message to content script:", error)
  }
}

async function closeOffscreenDocument() {
  if (!(await hasDocument())) {
    return
  }
  await chrome.offscreen.closeDocument()
}

async function hasDocument() {
  const matchedClients = await clients.matchAll()
  for (const client of matchedClients) {
    if (client.url.endsWith(OFFSCREEN_DOCUMENT_PATH)) {
      return true
    }
  }
  return false
}
