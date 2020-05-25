/*
 * Export and Persistence Module (EXP).
 *
 *	Please define the following:
 *	 EXP_FN_BASE = <string>
 *
 *	Please include the following in your onload script:
 *	  EXP_onload()
 *	 
 *	Depends on following:
 *	 element with id = EXP_inputs_frame: a script element where variables can be written/dumped to.
 *	 element with id = topbar_filename: a div element to place the filename
 *	 element with id = download_frame: a dummy (hidden) div element that enables downloading
 *
 *	References the following entities:
 *	 All <input> elements
 *	 All <select> elements
 *
 */ 

function EXP_onload() {
	if (typeof EXP_inputs !== 'undefined'){
		unpackInputs();
		return 1;
	} else if(getLocalStorage('version') == VERSION) {
		EXP_loadPersistence();
		return 2;
	} else {
		return 0;
	}
}

function packInputs() {
	/*
	 *	Gathers all input and select tags, and dumps them into one massive object (called EXP_inputs) placed inside a script tag.
	 */
	packed_inputs = {};
	for (input of document.getElementsByTagName('input')) {
		if (input.type == "text") {
			packed_inputs[input.id] = input.value;
		}
		if (input.type == "radio") {
			packed_inputs[input.id] = input.checked;
		}
	}
	for (input of document.getElementsByTagName('select')) {
		packed_inputs[input.id] = input.value;
	}

	document.getElementById("EXP_inputs_frame").innerHTML = "EXP_inputs="+JSON.stringify(packed_inputs)+";";
}

function unpackInputs() {
	/*
	 *	Takes data from EXP_inputs and fills it into the elements on page. 
	 */
	for (key in EXP_inputs) {
		if (typeof EXP_inputs[key] == "boolean")
			document.getElementById(key).checked = EXP_inputs[key];
		else
			document.getElementById(key).value   = EXP_inputs[key];
	}
}

if (!String.prototype.decodeHTML) {
  String.prototype.decodeHTML = function () {
    return this.replace(/&apos;/g, "'")
               .replace(/&quot;/g, '"')
               .replace(/&gt;/g, '>')
               .replace(/&lt;/g, '<')
               .replace(/&amp;/g, '&');
  };
}

function readTextFile(file) {
	/* Fetches data from a text file so it can be put into a tag */
	var allText = null;
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                allText = rawFile.responseText;
            }
        }
    }
    rawFile.send(null);
    return allText;
}


function downloadPage() {
	/*
	 *	Gathers all referenced files, all inputs, dumps them into tags, and exports the DOM
	 */

	// Prompt user for a filename
	months=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
	today = new Date();
	var fileName = EXP_FN_BASE + '_' + today.getFullYear()+months[today.getMonth()]+today.getDate();
	fileName = prompt("Enter a filename. (.html will be appended)", fileName)
	if (!fileName) return; // If cancel, stop this

	document.getElementById('topbar_filename').innerHTML = fileName;
	fileName += '.html';

	// Pack up all the inputs, dump them into the relevant tag
	packInputs();

	// Migrate referenced files into this HTML file
	head = document.head || document.getElementsByTagName('head')[0];
	scripts   = document.getElementsByTagName('script');
	for (script of scripts) {
		if (script.src) {
			scr = readTextFile(script.src);
			script.innerHTML = scr;
			script.removeAttribute('src');
		}
	}
	links = document.getElementsByTagName('link');
	for (link of links) {
		if (link.href) {
			scr = readTextFile(link.href);
			style = document.createElement('style');
			style.type='text/css';
			if(style.styleSheet) {
				style.styleSheet.cssText = scr;
			} else {
				style.appendChild(document.createTextNode(scr));
			}
			head.prepend(style);
			link.parentElement.removeChild(link);
		}
	}
	/*imgs = document.getElementsByTagName('img');
	for (img of imgs) {
		if (img.src) {
			scr = readTextFile(img.src);
			img.innerHTML = scr;
			img.removeAttribute('src');
		}
	}*/

	// Create the download
	var fileContent = new XMLSerializer().serializeToString(document).decodeHTML();
	var myFile = new Blob([fileContent], {type: 'text/html'});
	window.URL = window.URL || window.webkitURL;
	dlurl = window.URL.createObjectURL(myFile);
	document.getElementById('download_frame').download = fileName;
	document.getElementById('download_frame').href = dlurl;
	document.getElementById('download_frame').click();
}

function printPage() {
	/* Page print
	   Currently just a passthrough for builtin system page printing */
	window.print();
}

function setLocalStorage(key, value, domain) {
	if (typeof domain == 'undefined') domain = EXP_FN_BASE;
	localStorage[`${domain}/${key}`] = value;
}

function getLocalStorage(key, domain) {
	if (typeof domain == 'undefined') domain = EXP_FN_BASE;
	return localStorage[`${domain}/${key}`];
}

// use localStorage
function EXP_dumpPersistence() {
	if (typeof EXP_inputs !== 'undefined') return false; // no persistence for exported files
	let inputs  = document.getElementsByTagName('input');
	let selects = document.getElementsByTagName('checkbox');

	let dumped = {};
	for (input of document.getElementsByTagName('input')) {
		if (input.classList.contains("dynamic-input")) continue; // deal with dynamic inputs outside of here
		
		if (input.type == "text") {
			setLocalStorage(`inputs/${input.id}`, input.value);
		}
		if (input.type == "radio" || input.type == "checkbox") {
			setLocalStorage(`inputs/${input.id}`, input.checked);
		}
	}
	for (input of document.getElementsByTagName('select')) {
		if (input.classList.contains("dynamic-input")) continue; // deal with dynamic inputs outside of here
		
		setLocalStorage(`inputs/${input.id}`, input.value);
	}
	setLocalStorage('version', VERSION);
	return true;
}

function EXP_loadPersistence() {
	let inputs  = document.getElementsByTagName('input');
	let selects = document.getElementsByTagName('checkbox');

	for (input of document.getElementsByTagName('input')) {
		if (input.classList.contains("dynamic-input")) continue; // deal with dynamic inputs outside of here
		if (input.type == "text") {
			input.value = getLocalStorage(`inputs/${input.id}`);
		}
		if (input.type == "radio" || input.type == "checkbox") {
			input.checked = getLocalStorage(`inputs/${input.id}`);
		}
	}
	for (input of document.getElementsByTagName('select')) {
		if (input.classList.contains("dynamic-input")) continue; // deal with dynamic inputs outside of here
		input.value = getLocalStorage(`inputs/${input.id}`);
	}
}