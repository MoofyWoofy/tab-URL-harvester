"use strict";

/**
 * Checks if URL is in bookmarks
 * @param {string} url
 * @returns {boolean} true if URL is bookmarked
 */
async function isURLBookmarked(url) {
  // Firefox for Android doesn’t support the bookmarks API, so for Android always return false
  try {
    const bookmarkItems = await browser.bookmarks.search(url);
    return bookmarkItems.length ? true : false;
  } catch (err) {
    return false;
  }
}

/**
 * @param {string} title
 * @param {string} url
 */
function returnUrlElement(title, url) {
  const label = document.createElement("label");
  label.style.width = "100%";
  label.classList.add("checkbox", "url-container");

  const input = document.createElement("input");
  input.dataset.title = title;
  input.dataset.url = url;
  input.type = "checkbox";
  input.checked = true;
  input.classList.add("url");

  const text = document.createTextNode(` ${url}`);

  label.appendChild(input);
  label.appendChild(text);
  return label;
}

async function displayURLs() {
  const { includeBookmark, tags, copyWindow } = await browser.storage.local.get({
    includeBookmark: false,
    tags: [],
    copyWindow: "current",
  });

  // Get tab URL, depending on settings, current or all windows
  const tabs =
    copyWindow === "current"
      ? await browser.tabs.query({ currentWindow: true })
      : await browser.tabs.query({});

  const urlList = document.getElementById("root");

  for (const { title, url } of tabs) {
    const isURLInIgnoreList = tags.some((pattern) => RegExp(pattern).test(url));
    if (isURLInIgnoreList) continue;

    if (includeBookmark) {
      urlList.appendChild(returnUrlElement(title, url));
    } else {
      // If URL is not in bookmark
      if (!(await isURLBookmarked(url))) {
        urlList.appendChild(returnUrlElement(title, url));
      }
    }
  }
}

/**
 * Checks if URL is in bookmarks
 * @param {string} url
 * @returns {boolean} true if URL is valid
 */
function isUrlValid(url) {
  let foo;
  try {
    foo = new URL(url);
  } catch (err) {
    return false;
  }
  return foo.protocol === "http:" || foo.protocol === "https:";
}

document.getElementById("btnCopy").addEventListener("click", async (e) => {
  const textToCopy = [];
  const urlElements = document.querySelectorAll(".url");
  const { copyFormat } = await browser.storage.local.get({
    copyFormat: "basic",
  });
  for (const ele of urlElements) {
    if (ele.checked) {
      const title = ele.getAttribute("data-title");
      const url = ele.getAttribute("data-url");
      switch (copyFormat) {
        case "basic":
          textToCopy.push(`${title}: ${url}`);
          break;
        case "json":
          textToCopy.push(`{"title":"${title}","url":"${url}"}`);
          break;
        case "markdown":
          textToCopy.push(`[${title}](${url})`);
          break;
        case "url":
          textToCopy.push(`${url}`);
          break;
      }
    }
  }
  navigator.clipboard.writeText(textToCopy.join("\n"));
  // TODO: add animation to button when copying/copied to clipboard
  e.target.textContent = "Copied";
  setTimeout(() => {
    e.target.textContent = "Copy";
  }, 1000);
});

displayURLs();

// function to get each tab details
const tabs = document.querySelectorAll("[data-tab-url]");
const tabInfos = document.querySelectorAll("#tab_content > *");

tabs.forEach((tab) => {
  tab.addEventListener("click", (e) => {
    // Clear tabs
    tabs.forEach((e) => e.parentElement.classList.remove("is-active"));
    e.target.parentElement.classList.add("is-active");

    // Change navigation

    const target = document.querySelector(tab.dataset.tabUrl);

    tabInfos.forEach((tabInfo) => {
      tabInfo.dataset.tabContent = "";
    });
    target.dataset.tabContent = "active";
  });
});

document.getElementById("btnPaste").addEventListener("click", async (e) => {
  const urls = document.getElementById("paste-url").value.split("\n");
  const { isPasteSameAsCopy, pasteFormat, copyFormat } = await browser.storage.local.get({
    copyFormat: "basic",
    isPasteSameAsCopy: true,
    pasteFormat: "basic",
  });
  // Set format depending on options
  const format = isPasteSameAsCopy ? copyFormat : pasteFormat;
  const validUrls = [];
  const invalidUrls = [];

  for (const url of urls) {
    // filter format
    let cleanUrl;
    switch (format) {
      case "basic":
        cleanUrl = "http" + url.split(": http")[1];
        break;
      case "json":
        cleanUrl = JSON.parse(url).url;
        break;
      case "markdown":
        try {
          cleanUrl = url.match(/^\[(.+)\]\((https?:\/\/.+)\)$/)[2];
        } catch (err) {
          continue;
        }
        break;
      case "url":
        cleanUrl = url;
        break;
    }
    if (isUrlValid(cleanUrl)) {
      validUrls.push(cleanUrl);
    } else {
      // Only add URL if text has data (not empty)
      if (url.length !== 0) {
        invalidUrls.push(url);
      }
    }
  }
  // creates tabs with valid URLs
  validUrls.forEach((e) => {
    browser.tabs.create({ url: e });
  });

  if (invalidUrls.length !== 0) {
    document.getElementById("paste-url").value = invalidUrls.join("\n");
    alert(`URLs not valid:\n${invalidUrls.join("\n")}`);
  } else {
    // Clear text area field
    document.getElementById("paste-url").value = "";
  }
});
