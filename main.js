/*!
Copyright 2022 ChromeHack Team

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/**
 * @typedef {import("../../../types").WhiteSpider} WhiteSpider
 */

import contents from "./contents.js";
import TestGameDB from "./testgamedb.js";

const searchBar = document.getElementById("search-bar");

const html5GameGrid = document.getElementById("html5-game-grid");
const flashGameGrid = document.getElementById("flash-game-grid");
const dosGameGrid = document.getElementById("dos-game-grid");
const userGameGrid = document.getElementById("user-game-grid");

const html5GameCount = document.getElementById("html5-game-count");
const flashGameCount = document.getElementById("flash-game-count");
const dosGameCount = document.getElementById("dos-game-count");
const userGameCount = document.getElementById("user-game-count");

/**
 * @param {{readonly name: string; readonly path?: string; readonly url?: string; readonly preview?: string}[]} contents 
 * @param {HTMLElement} grid 
 * @param {HTMLElement} gridCounter 
 * @param {boolean | undefined} noPreview 
 */
function updateContents(contents, grid, gridCounter, noPreview) {
	grid.innerHTML = "";
	gridCounter.innerHTML = contents.length;

	for (const content of contents) {
		const name = content.name;
		const path = content.path;
		const url = content.url;

		const item = document.createElement("div");
		item.className = "game-item";

		const preview = document.createElement("div");
		preview.className = "game-preview";
		if (!noPreview) {
			preview.setAttribute("style", `background-image: url("./preview/${encodeURIComponent(name)}.jpg");`);
		}
		item.appendChild(preview);

		const label = document.createElement("div");
		label.className = "game-label";
		label.textContent = name;
		item.appendChild(label);

		item.onclick = () => context.popup(path != null ? path: url, name, {});
		grid.appendChild(item);
	}
}

/**
 * @param {{readonly name: string; readonly path?: string; readonly url?: string; readonly preview?: string}[]} contents 
 * @param {string} input 
 */
function match(contents, input) {
	const list = [];
	for (const content of contents) {
		if (content.name.toLowerCase().includes(input))
			list.push(content);
	}
	return list;
}

function loadDefaultContent() {
	updateContents(contents.html5Games, html5GameGrid, html5GameCount);
	updateContents(contents.flashGames, flashGameGrid, flashGameCount);
	updateContents(contents.dosGames, dosGameGrid, dosGameCount);
}

TestGameDB.load().then(() => {
	updateContents(TestGameDB.data, userGameGrid, userGameCount, true);
});

for (let item of document.getElementsByClassName("expand")) {
	item.onclick = () => {
		const gridElem = item.parentElement.getElementsByClassName("game-grid")[0];
		if (gridElem.hasAttribute("expanded")) {
			gridElem.removeAttribute("expanded");
			item.innerHTML = "Show more";
		} else {
			gridElem.setAttribute("expanded", "true");
			item.innerHTML = "Show less";
		}
	};
}

searchBar.oninput = () => {
	const value = searchBar.value.toLowerCase();
	if (value.length == 0) {
		loadDefaultContent();
		return;
	}

	updateContents(match(contents.html5Games, value), html5GameGrid, html5GameCount);
	updateContents(match(contents.flashGames, value), flashGameGrid, flashGameCount);
	updateContents(match(contents.dosGames, value), dosGameGrid, dosGameCount);
};

document.getElementById("game-submission-button").onclick = async () => {
	const result = await form("", "Submit a game", {
		"Name": {
			tagName: "input",
			attributes: { type: "text", placeholder: "Game Name" }
		},
		"URL": {
			tagName: "input",
			attributes: { type: "text", placeholder: "https://example.com/example" }
		}
	});

	if (result == null)
		return; // canceled

	const name = result["Name"].value;
	const url = result["URL"].value;

	if (name.length == 0) {
		alert("Name cannot be empty.", "Error");
		return;
	}

	if (url.length == 0) {
		alert("URL cannot be empty.", "Error");
		return;
	}

	try {
		const o = new URL(url);
		if (o.protocol != "http:" && o.protocol != "https:") {
			alert("Invalid URL protocol", "Error");
			return;
		}
	} catch (e) {
		alert("Invalid URL", "Error");
		return;
	}

	await TestGameDB.append({
		name: name,
		url: url
	});
	window.location.reload();
};

loadDefaultContent();document.getElementById("loading").style.display="none",document.getElementById("main").style.display="block";
