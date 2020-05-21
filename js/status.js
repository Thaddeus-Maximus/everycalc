/*
Status Module (STAT).

Please define the following:

Please include the following in your onload script:
 STATUSOnload()
 
Depends on following:
 <div> with id "topbar_status".
*/ 

function setError(code, msg) {
	let topbar_box = document.getElementById('topbar_status');
	console.log(topbar_box);
	if (code) {
		topbar_box.children[0].innerHTML="ERROR";
		topbar_box.children[1].innerHTML=msg;
	} else {
		topbar_box.children[0].innerHTML="VALID/READY";
		topbar_box.children[1].innerHTML=msg;
	}
}