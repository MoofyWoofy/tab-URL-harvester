"use strict";

/**
 * Checks if URL is in bookmarks
 * @param {string} url
 */
async function isURLBookmarked(url) {
  const bookmarkItems = await browser.bookmarks.search(url);
  return bookmarkItems.length ? true : false;
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
  const tabs = await browser.tabs.query({ currentWindow: true }); // Get all tabs in current window
  const urlList = document.getElementById("root");
  const { includeBookmark, tags } = await browser.storage.local.get({
    includeBookmark: false,
    tags: [],
  });

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
  const { format } = await browser.storage.local.get({ format: "basic" });
  for (const ele of urlElements) {
    if (ele.checked) {
      const title = ele.getAttribute("data-title");
      const url = ele.getAttribute("data-url");
      switch (format) {
        case "basic":
          textToCopy.push(`${title}: ${url}`);
          break;
        case "json":
          textToCopy.push(`{title:"${title}",url:"${url}"}`);
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
console.log(tabs);
console.log(tabInfos);

tabs.forEach((tab) => {
  tab.addEventListener("click", (e) => {
    // Clear tabs
    tabs.forEach((e) => e.parentElement.classList.remove("is-active"));
    e.target.parentElement.classList.add("is-active");
    console.log(e);

    // Change navigation

    const target = document.querySelector(tab.dataset.tabUrl);
    console.log(target);

    tabInfos.forEach((tabInfo) => {
      tabInfo.dataset.tabContent = "";
    });
    target.dataset.tabContent = "active";
  });
});

document.getElementById("btnLoad").addEventListener("click", async (e) => {
  const urls = document.getElementById("load-url").value.split("\n");
  const { format } = await browser.storage.local.get({ format: "basic" });
  for (const url of urls) {
    // filter format
    let cleanUrl;
    switch (format) {
      case "basic":
        cleanUrl = url.split(":")[1];
        break;
      case "json":
        cleanUrl = url.split(",")[1].substring(4);
        break;
      case "markdown":
        cleanUrl = url.split("(")[1];
        break;
      case "url":
        cleanUrl = url;
        break;
    }
    if (isUrlValid(cleanUrl)) {
      browser.tabs.create({ url: cleanUrl });
    }
  }
  // Clear text area field
  document.getElementById("load-url").value = "";
});
