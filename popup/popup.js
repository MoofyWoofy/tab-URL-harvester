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
  const { includeBookmark, tags } = await browser.storage.local.get({ includeBookmark: false, tags: [] });

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
