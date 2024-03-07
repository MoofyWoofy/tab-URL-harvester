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
  const { format, includeBookmark, tags } = await browser.storage.local.get({
    format: "basic",
    includeBookmark: false,
    tags: [],
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

  // URL regex ignore list
  let tagsElement = document.querySelector("[data-type=tags]");
  new BulmaTagsInput(tagsElement); // Instantiate BulmaTagsInput
  let btiInstance = tagsElement.BulmaTagsInput(); // Create BulmaTagsInput instance
  for (const tag of tags) {
    btiInstance.add(tag); // Call BulmaTagsInput method
  }
  tagsElement.BulmaTagsInput().on("after.add", saveTagsToStorage); // Listen to event: Triggered once a tag has been added
  tagsElement.BulmaTagsInput().on("after.remove", saveTagsToStorage); // Listen to event: Triggered once a tag has been removed
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
  // console.log(data.item);
  const tags = document.querySelector("[data-type=tags]").BulmaTagsInput().items;
  setBrowserExtensionLocalStorage({ tags: tags });
}
