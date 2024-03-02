"use strict";

const copyFormatElement = document.getElementById("copyFormat");
const includeBookmarkElement = document.getElementById("includeBookmark");

copyFormatElement.addEventListener("change", (e) => {
  setBrowserExtensionLocalStorage({ format: e.target.value });
});

includeBookmarkElement.addEventListener("change", (e) => {
  setBrowserExtensionLocalStorage({ includeBookmark: e.target.checked });
});

window.addEventListener("DOMContentLoaded", async () => {
  const { format, includeBookmark } = await browser.storage.local.get({
    format: "basic",
    includeBookmark: false,
  });

  switch (format) {
    case "basic":
      copyFormatElement.selectedIndex = 0;
      break;
    case "json":
      copyFormatElement.selectedIndex = 1;
      break;
    case "markdown":
      copyFormatElement.selectedIndex = 2;
      break;
    case "url":
      copyFormatElement.selectedIndex = 3;
      break;
  }

  switch (includeBookmark) {
    case true:
      includeBookmarkElement.checked = true;
      break;
    case false:
      includeBookmarkElement.checked = false;
      break;
  }
});

function setBrowserExtensionLocalStorage(obj) {
  browser.storage.local.set(obj).then(
    () => {
      // Updated Successfully
    },
    (err) => console.log(err)
  );
}
