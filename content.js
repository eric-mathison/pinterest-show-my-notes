chrome.runtime.onMessage.addListener(handleMessages);

let showNotes = false;

function handleMessages(message) {
  if (message.target !== "content") {
    return;
  }

  switch (message.type) {
    case "showNotes":
      showPinNotes(message.data);
      break;
    case "hideNotes":
      hideNotes();
      break;
    default:
      console.log("Unknown message type:", message.type);
  }
}

function hideNotes() {
  const button = document.getElementById("pin-note-button");
  const overlay = document.getElementById("pin-note-overlay");
  const modal = document.getElementById("pin-note-modal");
  if (button) {
    button.remove();
    console.log("Hide notes");
  }
  if (overlay) {
    overlay.remove();
    modal.remove();
    console.log("Hide overlay");
  }
  showNotes = false;
}

function showPinNotes(data) {
  if (document.location.pathname.includes("/pin/")) {
    const pathname = document.location.pathname;
    const pinId = pathname.match(/\d+/g)[0];
    // console.log("Pin ID:", pinId);

    const pinNote = data.note;

    if (pinNote && !showNotes) {
      const pinNoteText = pinNote;
      showNotes = true;
      // console.log("Pin Note Text:", pinNoteText);

      // Create absolute button with svg image on body
      const button = document.createElement("button");
      button.id = "pin-note-button";
      button.innerHTML = `<svg width="34px" height="34px" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 10.25C8 9.83579 8.33579 9.5 8.75 9.5H18.75C19.1642 9.5 19.5 9.83579 19.5 10.25C19.5 10.6642 19.1642 11 18.75 11H8.75C8.33579 11 8 10.6642 8 10.25Z" fill="#212121"/>
<path d="M8 14.75C8 14.3358 8.33579 14 8.75 14H18.75C19.1642 14 19.5 14.3358 19.5 14.75C19.5 15.1642 19.1642 15.5 18.75 15.5H8.75C8.33579 15.5 8 15.1642 8 14.75Z" fill="#212121"/>
<path d="M8.75 18.5C8.33579 18.5 8 18.8358 8 19.25C8 19.6642 8.33579 20 8.75 20H13.25C13.6642 20 14 19.6642 14 19.25C14 18.8358 13.6642 18.5 13.25 18.5H8.75Z" fill="#212121"/>
<path d="M14 2C14.4142 2 14.75 2.33579 14.75 2.75V4H18.5V2.75C18.5 2.33579 18.8358 2 19.25 2C19.6642 2 20 2.33579 20 2.75V4H20.75C21.9926 4 23 5.00736 23 6.25V19.2459C23 19.4448 22.921 19.6356 22.7803 19.7762L17.2762 25.2803C17.1355 25.421 16.9447 25.5 16.7458 25.5H6.75C5.50736 25.5 4.5 24.4926 4.5 23.25V6.25C4.5 5.00736 5.50736 4 6.75 4H8V2.75C8 2.33579 8.33579 2 8.75 2C9.16421 2 9.5 2.33579 9.5 2.75V4H13.25V2.75C13.25 2.33579 13.5858 2 14 2ZM6 6.25V23.25C6 23.6642 6.33579 24 6.75 24H15.9958V20.7459C15.9958 19.5032 17.0032 18.4959 18.2458 18.4959H21.5V6.25C21.5 5.83579 21.1642 5.5 20.75 5.5H6.75C6.33579 5.5 6 5.83579 6 6.25ZM18.2458 19.9959C17.8316 19.9959 17.4958 20.3317 17.4958 20.7459V22.9394L20.4393 19.9959H18.2458Z" fill="#212121"/>
</svg>`;
      button.style.position = "fixed";
      button.style.bottom = "100px";
      button.style.right = "22px";
      button.style.backgroundColor = "#fff";
      button.style.border = "none";
      button.style.cursor = "pointer";
      button.style.width = "60px";
      button.style.height = "60px";
      button.style.zIndex = "0";
      button.style.borderRadius = "100%";
      button.style.boxShadow = "0 0 15px -6px rgba(0, 0, 0, 0.75)";
      button.onclick = () => {
        alert(pinNoteText);
      };
      document.body.appendChild(button);

      // create modal with pinNoteText and close button
      const overlay = document.createElement("div");
      overlay.id = "pin-note-overlay";
      overlay.style.display = "none";
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.backgroundColor = "rgba(0,0,0,0.5)";
      overlay.style.zIndex = "999";

      const modal = document.createElement("div");
      modal.id = "pin-note-modal";
      modal.style.display = "none";
      modal.style.position = "fixed";
      modal.style.left = "15%";
      modal.style.top = "20%";
      modal.style.width = "70%";
      modal.style.maxHeight = "60vh";
      modal.style.backgroundColor = "#fff";
      modal.style.padding = "20px";
      modal.style.borderRadius = "8px";
      modal.style.boxShadow = "0 0 20px rgba(0,0,0,0.2)";
      modal.style.zIndex = "1000";
      modal.style.overflowY = "auto";

      const closeBtn = document.createElement("button");
      closeBtn.innerHTML = "×";
      closeBtn.style.position = "absolute";
      closeBtn.style.right = "10px";
      closeBtn.style.top = "10px";
      closeBtn.style.border = "none";
      closeBtn.style.background = "none";
      closeBtn.style.fontSize = "24px";
      closeBtn.style.cursor = "pointer";

      const heading = document.createElement("h2");
      heading.textContent = "Pin Notes";
      heading.style.marginTop = "0";
      heading.style.fontSize = "20px";
      heading.style.fontWeight = "bold";

      const content = document.createElement("p");
      content.textContent = pinNoteText;
      content.style.marginTop = "20px";
      content.style.fontSize = "16px";
      content.style.lineHeight = "1.5";

      modal.appendChild(closeBtn);
      modal.appendChild(heading);
      modal.appendChild(content);
      document.body.appendChild(overlay);
      document.body.appendChild(modal);

      button.onclick = () => {
        modal.style.display = "block";
        overlay.style.display = "block";
      };

      closeBtn.onclick = () => {
        modal.style.display = "none";
        overlay.style.display = "none";
      };

      overlay.onclick = () => {
        modal.style.display = "none";
        overlay.style.display = "none";
      };
    }
  }
}
