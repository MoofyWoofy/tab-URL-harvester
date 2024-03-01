// popup.js
document.getElementById('collect-urls').addEventListener('click', async () => {
  const tabs = await browser.tabs.query({});
  const urlList = document.getElementById('url-list');
  urlList.innerHTML = '';
  tabs.forEach(tab => {
    const li = document.createElement('li');
    li.textContent = tab.url;
    urlList.appendChild(li);
  });
});
