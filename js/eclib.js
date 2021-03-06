/*
 * EveryCalc general purpose library
 */

VERSION = 0.6;

function EC_onload() {
	document.getElementById('topbar_version').innerHTML = VERSION;
	setError(1);
}

function EC_setOnInput(fn) {
	let inputs = document.getElementsByTagName('input');
	for (index = 0; index < inputs.length; ++index) {
	    inputs[index].oninput = typeof fn == 'undefined' ?
	    	function(e) {
		    	var key = e.keyCode ? e.keyCode : e.which;
	    		let input = e.target;
	    		if(input.id.startsWith('toggle')) return; // ignore these, just css stuff
		    	if(key!=13) setError(1);
			}
		: fn;
	}
}
function EC_setOnKeyUp(fn) {
	let inputs = document.getElementsByTagName('input');
	for (index = 0; index < inputs.length; ++index) {
	    inputs[index].onkeyup = typeof fn == 'undefined' ? 
		    function(e) {
		    	let key = e.keyCode ? e.keyCode : e.which;
				if (key == 13) compute();
			} 
		: fn; // default handler calls compute if you press enter
	}
}

function selectItemByValue(elmnt, value){
  for(var i=0; i < elmnt.options.length; i++)
  {
    if(elmnt.options[i].value === value) {
      elmnt.selectedIndex = i;
      break;
    }
  }
}

function roundToZero(x) {
	return x < 0 ? Math.ceil(x) : Math.floor(x);
}

function interp1D(xs, ys, xq) {
	let i=1;
	for (; i<xs.length-1 && !isNaN(xs[i]) && xq>xs[i]; i++) {}
	return ys[i-1] + (ys[i]-ys[i-1])/(xs[i]-xs[i-1])*(xq-xs[i-1]);
}

function interp2D(xs, ys, zs, xq, yq) { // x indexes rows, y indexes columns
	let i=1;
	for (; i<xs.length-1 && !isNaN(xs[i]) && xq>xs[i]; i++) {}
	let x1 = xs[i];
	let x2 = xs[i-1];
	let y1 = zs[i];
	let y2 = zs[i-1];
	let z1 = interp1D(ys, y1, yq);
	let z2 = interp1D(ys, y2, yq);
	return interp1D([x1,x2], [z1,z2], xq);
}

function interpIdx(xs, xq) {
	i;
	for (i=1; i<xs.length-1 && !isNaN(xs[i]) && xq>xs[i]; i++) {}
	return i;
}

function interp1DSlope(xs, ys, xq) {
	i;
	for (i=1; i<xs.length-1 && !isNaN(xs[i]) && xq>xs[i]; i++) {}
	return (ys[i]-ys[i-1])/(xs[i]-xs[i-1]);
}

function NaNTo(to, x) {
	if (isNaN(x))
		return to;
	return x;
}

function posatan2(X,Y) {
	atn = Math.atan2(X,Y);
	if (atn < 0) atn += Math.PI*2;
	return atn;
}

function avg(arr) {
	sum = 0;
	for (X of arr) { sum+=X; }
	return sum/arr.length;
}

/*
Status Module (STAT).

Depends on following:
- <div> with id "topbar_status".
*/ 

ERR_CODES = ['Up-To-Date', 'Waiting on Computation...', 'ERROR'];
DEFAULT_ERR_MSGS = [
	'Results are valid and up-to-date with current inputs.',
	'Waiting on user to prompt computation (please press enter, or the compute button)',
	'DEFAULT ERROR MESSAGE<br/>Please submit a bug ticket.'
]

function setError(code, msg) {
	let topbar_box = document.getElementById('topbar_status');
	let topbar_ttl = document.getElementById('topbar_title');
	if (code) {
		topbar_box.classList.add('error');
		topbar_ttl.classList.add('error');
	}
	else{
		topbar_box.classList.remove('error');
		topbar_ttl.classList.remove('error');
	}
	if (typeof msg === 'undefined')
		msg = DEFAULT_ERR_MSGS[code];
	topbar_box.children[0].innerHTML=ERR_CODES[code];
	topbar_box.children[1].innerHTML=msg;
}

function parseMath(expr, variables) {
	for (variable in variables) {
		expr = expr.replace(variable, variables[variable]);
	}
	try{
		let res = 0;
		if (expr != '')
			res = eval(expr);
		//console.log(expr, res);
		return res;
	}catch(err){
		throw 'Failed to parse mathematical expression.'
	}
}

function sign(x) {
	if(x>0) return 1;
	if(x<0) return -1;
	return 0;
}