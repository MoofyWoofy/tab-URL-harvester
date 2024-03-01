"use strict";

async function isURLBookmarked(url) {
  const bookmarkItems = await browser.bookmarks.search(url);
  return bookmarkItems.length ? true : false;
}

function returnUrlElement(title, url) {
  const label = document.createElement("label");
  label.style.width = "100%";
  label.classList.add("checkbox", "url");

  const input = document.createElement("input");
  input.dataset.title = title;
  input.dataset.url = url;
  input.type = "checkbox";
  input.checked = true;

  const text = document.createTextNode(` ${url}`);

  label.appendChild(input);
  label.appendChild(text);
  return label;
  return `<label style="width:100%" class="checkbox"><input class="url" data-title="${title}" data-url="${url}" type="checkbox" checked>&nbsp;${url}</label>`;
}

async function displayURLs() {
  const tabs = await browser.tabs.query({ currentWindow: true }); // Get all tabs in current window
  const urlList = document.getElementById("root");
  let templateString = "";
  const includeBookmarked = localStorage.getItem("includeBookmark") || false;

  for (const { title, url } of tabs) {
    if (includeBookmarked == "true") {
      templateString += returnUrlElement(title, url);
      urlList.appendChild(returnUrlElement(title, url)); //? Correct?
    } else {
      if (!(await isURLBookmarked(url))) {
        templateString += returnUrlElement(title, url);
        urlList.appendChild(returnUrlElement(title, url)); //? Correct?
      }
    }
  }
  // urlList.innerHTML = templateString;
  // TODO: ^ don't use innerHTML
}

// popup.js
document.getElementById("btnCopy").addEventListener("click", (e) => {
  let textToCopy = [];
  const urlElements = document.querySelectorAll(".url");
  for (const ele of urlElements) {
    if (ele.checked) {
      const title = ele.getAttribute("data-title");
      const url = ele.getAttribute("data-url");

      // Get format type from storage
      // TODO: ^^^^
      const format = localStorage.getItem("format") || "basic"; // Basic,JSON, Markdown, URL only
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
        case "url-only":
          textToCopy.push(`${url}`);
          break;
        default:
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
  // https://www.freecodecamp.org/news/innerhtml-vs-innertext-vs-textcontent/
});

displayURLs();
