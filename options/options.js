"use strict";

const copyFormatElement = document.getElementById("copyFormat");
const includeBookmarkElement = document.getElementById("includeBookmark");
const isPasteSameAsCopyElement = document.getElementById("isPasteSameAsCopy");
const pasteFormatElement = document.getElementById("pasteFormat");
const copyWindowElement = document.getElementById("copyWindow");

copyFormatElement.addEventListener("change", (e) => {
  setBrowserExtensionLocalStorage({ copyFormat: e.target.value });
});

includeBookmarkElement.addEventListener("change", (e) => {
  setBrowserExtensionLocalStorage({ includeBookmark: e.target.checked });
});

isPasteSameAsCopyElement.addEventListener("change", (e) => {
  setBrowserExtensionLocalStorage({ isPasteSameAsCopy: e.target.checked });
});
pasteFormatElement.addEventListener("change", (e) => {
  setBrowserExtensionLocalStorage({ pasteFormat: e.target.value });
});

copyWindowElement.addEventListener("change", (e) => {
  setBrowserExtensionLocalStorage({ copyWindow: e.target.value });
});

window.addEventListener("DOMContentLoaded", async () => {
  const { copyFormat, includeBookmark, tags, isPasteSameAsCopy, pasteFormat, copyWindow } =
    await browser.storage.local.get({
      copyFormat: "basic",
      includeBookmark: false,
      tags: [],
      isPasteSameAsCopy: true,
      pasteFormat: "basic",
      copyWindow: "current",
    });

  switch (copyFormat) {
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

  // URL regex ignore list
  let tagsElement = document.querySelector("[data-type=tags]");
  new BulmaTagsInput(tagsElement); // Instantiate BulmaTagsInput
  let btiInstance = tagsElement.BulmaTagsInput(); // Create BulmaTagsInput instance
  for (const tag of tags) {
    btiInstance.add(tag); // Call BulmaTagsInput method
  }
  tagsElement.BulmaTagsInput().on("after.add", saveTagsToStorage); // Listen to event: Triggered once a tag has been added
  tagsElement.BulmaTagsInput().on("after.remove", saveTagsToStorage); // Listen to event: Triggered once a tag has been removed

  isPasteSameAsCopyElement.checked = isPasteSameAsCopy;

  switch (pasteFormat) {
    case "basic":
      pasteFormatElement.selectedIndex = 0;
      break;
    case "json":
      pasteFormatElement.selectedIndex = 1;
      break;
    case "markdown":
      pasteFormatElement.selectedIndex = 2;
      break;
    case "url":
      pasteFormatElement.selectedIndex = 3;
      break;
  }

  // copy window
  switch (copyWindow) {
    case "current":
      copyWindowElement.selectedIndex = 0;
      break;
    case "all":
      copyWindowElement.selectedIndex = 1;
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

function saveTagsToStorage(data) {
  const tags = document.querySelector("[data-type=tags]").BulmaTagsInput().items;
  setBrowserExtensionLocalStorage({ tags: tags });
}
