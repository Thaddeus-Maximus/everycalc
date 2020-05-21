/*
 * EveryCalc general purpose library
 */

VERSION = 0.5;

function EC_onload() {
	document.getElementById('topbar_version').innerHTML = VERSION;
	setError(1);
}

/* Recommend placing a call to setError in your handler. */
/*
	function(e) {
    	let key = e.keyCode ? e.keyCode : e.which;
	   	let input = e.target;
		setError(1);
    	if (key==13) { // enter key
    		compute(true);
    	} else {
    		compute(false);
    	}
    }
*/
function EC_setOnInputChange(fn) {
	let inputs = document.getElementsByTagName('input');
	for (index = 0; index < inputs.length; ++index) {
	    inputs[index].onkeyup = fn;
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

function NaNto1(x) {
	if (isNaN(x))
		return 1;
	return x;
}

function bitTest(num, bit){
    return ((num>>bit) % 2 != 0)
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


// Collapsing Functions

function collapseDiv(id) {
	el = document.getElementById('detail_'+id);
	btn = document.getElementById('toggle_detail_'+id);
	
	if(el.style['display'] != 'none') {
		el.style['display'] = 'none';
		btn.innerHTML = "&#9660";
		if (id=='gratio') document.getElementById('G').readOnly = false;
	} else {
		el.style['display'] = 'inherit';
		btn.innerHTML = "&#9650";
		if (id=='gratio'){ document.getElementById('G').readOnly = true; calcRatio(); }
	}
}

function collapseTable(id) {
	tbl = document.getElementById('table_'+id);

	btn = document.getElementById('toggle_detail_'+id);
	if(tbl.rows[1].style['display'] != 'none') {
		for(i=1;i<tbl.rows.length;i++) tbl.rows[i].style['display'] = 'none';
		btn.innerHTML = "&#9660";
	} else {
		for(i=1;i<tbl.rows.length;i++) tbl.rows[i].style['display'] = 'table-row';
		btn.innerHTML = "&#9650";
	}
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