"use strict";

const copyFormatElement = document.getElementById("copyFormat");
const includeBookmarkElement = document.getElementById("includeBookmark");

copyFormatElement.addEventListener("change", (e) => {
  localStorage.setItem("format", e.target.value);
});

includeBookmarkElement.addEventListener("change", (e) => {
  localStorage.setItem("includeBookmark", e.target.checked);
});

// TODO: on-document load?
switch (
  localStorage.getItem("format")
) {
  case "basic":
    copyFormatElement.selectedIndex = 0;
    break;
  case "json":
    copyFormatElement.selectedIndex = 1;
    break;
  case "markdown":
    copyFormatElement.selectedIndex = 2;
    break;
  case "url-only":
    copyFormatElement.selectedIndex = 3;
    break;
}

switch (localStorage.getItem("includeBookmark")) {
  case "true":
    includeBookmarkElement.checked = true;
    break;
  case "false":
    includeBookmarkElement.checked = false;
    break;
}
