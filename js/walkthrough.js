/* Walkthrough Module (WALK)

How to use:

1. Put this SVG element in your document's body:

<svg id="walkthrough_overlay">
	<path id="walkthrough_frame" onclick="WALK_nextStep()" ></path>
	<text id="walkthrough_text" ></text>
	<text id="walkthrough_skip_button" onclick="WALK_disable();">Skip Tutorial</text>
</svg>

2. Define WALK_STEPS

WALK_STEPS = [
	{poi: element_id_to_spotlight,
	 desc: "description of what this bit does"},
	... continue adding steps
]

3. Call WALK_onload() in your init script

 */

function WALK_onload() {
	if (getLocalStorage('walkthrough') != VERSION)
		WALK_disable();
	else
		WALK_enable();
}

function WALK_disable() {
	WALK_ACT_STEP = NaN;
	WALK_nextStep();
}

function WALK_enable() {
	WALK_ACT_STEP = -1;
	WALK_nextStep();
}

let WALK_ACT_STEP = -1;
function WALK_nextStep() {
	let overlay = document.getElementById('walkthrough_overlay');
	let extent  = document.getElementById('walkthrough_frame');
	let text    = document.getElementById('walkthrough_text');
	let button = document.getElementById('walkthrough_skip_button');

	if (isNaN(WALK_ACT_STEP) || WALK_ACT_STEP >= WALK_STEPS.length){
		overlay.style.display = 'none';
		return;
	}
	var width = window.innerWidth
		|| document.documentElement.clientWidth
		|| document.body.clientWidth;

	var height = window.innerHeight
		|| document.documentElement.clientHeight
		|| document.body.clientHeight;

	overlay.setAttribute('viewBox', `0 0 ${width} ${height}`);
	if (WALK_ACT_STEP >= 0) {
		let poi = document.getElementById(WALK_STEPS[WALK_ACT_STEP].poi).getBoundingClientRect();

		extent.setAttribute('d',  `M0,0 H${width} V${height} H0   M${poi.left},${poi.top} H${poi.right} V${poi.bottom} H${poi.left}`);
		text.innerHTML = WALK_STEPS[WALK_ACT_STEP].desc;

		let halign = WALK_STEPS[WALK_ACT_STEP].halign;
		if (typeof halign == 'undefined') halign = 'left';

		let valign = WALK_STEPS[WALK_ACT_STEP].valign;
		if (typeof valign == 'undefined') valign = 'top';

		switch(halign) {
			case 'left':
			case 'start':
				text.setAttribute('x', (poi.left));
				text.setAttribute('text-anchor', 'start');
				break;
			case 'center':
			case 'middle':
				text.setAttribute('x', (poi.left+poi.right)/2);
				text.setAttribute('text-anchor', 'middle');
				break;
			case 'right':
			case 'end':
				text.setAttribute('x', (poi.right));
				text.setAttribute('text-anchor', 'end');
		}
		switch(valign) {
			case 'top':
			case 'above':
				text.setAttribute('y', (poi.top-6));
				break;
			case 'bot':
			case 'below':
			case 'bottom':
				text.setAttribute('y', (poi.bottom+26));
				break;
		}
		button.style.display='none';
	} else {
		extent.setAttribute('d',  `M0,0 H${width} V${height} H0`);
		text.innerHTML = "Welcome to EveryCalc. Click on the black for tutorial.";
		text.setAttribute('x', width/2);
		text.setAttribute('y', height/2);
		text.setAttribute('text-anchor', 'middle');
		button.setAttribute('x', width/2);
		button.setAttribute('y', height/2+30);
		button.style.display='';
	}
			
	overlay.style.display = 'block';
	WALK_ACT_STEP++;
}