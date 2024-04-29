"use strict";

/**
 * @type {HTMLFormElement}
 */
const form = document.getElementById("uv-form");
/**
 * @type {HTMLInputElement}
 */
const address = document.getElementById("uv-address");
/**
 * @type {HTMLInputElement}
 */
const searchEngine = document.getElementById("uv-search-engine");
/**
 * @type {HTMLParagraphElement}
 */
const error = document.getElementById("uv-error");
/**
 * @type {HTMLPreElement}
 */
const errorCode = document.getElementById("uv-error-code");

const input = document.querySelector("input");

class crypts { //xor encryption
  static encode(str) {
    return encodeURIComponent(
      str
        .toString()
        .split("")
        .map((char, ind) => (ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char))
        .join("")
    );
  }

  static decode(str) {
    if (str.charAt(str.length - 1) === "/") {
      str = str.slice(0, -1);
    }
    return decodeURIComponent(
      str
        .split("")
        .map((char, ind) => (ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char))
        .join("")
    );
  }
}

function search(input) {
  input = input.trim();
  const searchTemplate = 'https://google.com/search?q=%s'; //more customizable search engine set some sort of customizable var

  try {
    return new URL(input).toString();
  } catch (err) {
    try {
      const url = new URL(`http://${input}`);
      if (url.hostname.includes(".")) {
        return url.toString();
      }
      throw new Error('Invalid hostname');
    } catch (err) {
      return searchTemplate.replace("%s", encodeURIComponent(input));
    }
  }
}
if ('serviceWorker' in navigator) {
  var proxySetting = localStorage.getItem('proxy') || 'uv';
  let swConfig = {
    'uv': { file: '/@/sw.js', config: __uv$config }
    //add more proxies here like dynamic or DIP
  };

  let { file: swFile, config: swConfigSettings } = swConfig[proxySetting];

  navigator.serviceWorker.register(swFile, { scope: swConfigSettings.prefix })
    .then((registration) => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      form.addEventListener('submit', async (event) => {
        event.preventDefault();

        let encodedUrl = swConfigSettings.prefix + crypts.encode(search(address.value));
        location.href = encodedUrl;
      });
    })
    .catch((error) => {
      console.error('ServiceWorker registration failed:', error);
    });
}

const searchbar = document.getElementById("uv-address");

const suggestionList = document.getElementById('suggestion-list');

searchbar.addEventListener('input', async (event) => {
  const query = event.target.value.trim(); // Trim to remove leading and trailing whitespace
  if (query === '') {
    // Clear suggestion list if query is empty
    suggestionList.innerHTML = '';
    return;
  }

  const response = await fetch(`/search=${query}`).then(res => res.json());
  const suggestions = response.map(item => item.phrase);

  // Clear previous suggestions
  suggestionList.innerHTML = '';

  // Populate the suggestion list
  suggestions.forEach(suggestion => {
    const listItem = document.createElement('div');
    listItem.textContent = suggestion;
    listItem.addEventListener('click', () => {
      searchbar.value = suggestion;
    });
    suggestionList.appendChild(listItem);
  });
});

// Clear suggestion list when search bar is emptied via backspace
searchbar.addEventListener('keydown', (event) => {
  if (event.key === 'Backspace' && searchbar.value === '') {
    suggestionList.innerHTML = '';
  }
});