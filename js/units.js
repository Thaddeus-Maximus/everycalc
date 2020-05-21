/*
Unit Module (UNIT).

Please define the following:
 UNIT_MAP = <object> of structure 'input_id' => ['list','of','unit','names']
 UNIT_PLACES = <integer> (number of places)

Please include the following in your onload script:
 UNIT_onload()
 
Depends on following:

References the following entities:
 unit_select: a <select> element containing
 	<option> elements with values corresponding to indices of the unit lists in the UNIT_MAP.

*/ 

// Active unit system
UNIT_sys = 0;

function UNIT_onload() {
	UNIT_change();
}

function UNIT_change() {
	UNIT_sys = document.getElementById('unit_select').value;

	labels = document.getElementsByClassName('unit');
	for (label of labels) {
		let varname = label.dataset.unit;
		if (varname && UNIT_MAP[varname] ){
			let brktunit = '['+UNIT_MAP[varname][UNIT_sys]+']';
			let oldstr = label.innerHTML;
			let start = oldstr.indexOf('[');
			if (start < 0)
				label.innerHTML = brktunit;
			else
				label.innerHTML = oldstr.substring(0, start) + brktunit;
		}
	}
}

function getV(id, default_value, pct_err_en) {
	/*
		Get the value of the input with given id, converted as per the unit map.
		default_value: the value to return when the input is empty.
		pct_err_en: enable processing of percentage errors.
			If enabled, will presume that the queried id ends in _err, strip off the _err, query the element, and return getV(non_errored_entry) times the percentage.
	*/
	let unit = document.getElementById(id).dataset.unit;
	let v =  document.getElementById(id).value;
	if (pct_err_en && typeof v === 'string' && v.slice(-1) == '%') {
		return getV(id.slice(0,-4), default_value, 0)*eval(v.slice(0,-1)/100);
	} else if (v=='') {
		v = default_value;
	} else {
		v = eval(v); // I trust you to not abuse this power.
	}
	
	if (typeof UNIT_MAP[unit] !== 'undefined') {
		v = convertFrom(v, UNIT_MAP[unit][UNIT_sys]);
	}
	return v;
}

// IDEA: Associate variables not by element id but by associated dimension/unit
// This would cut down drastically on the unit sprawl phenomenon.... not sure if it makes the DOM bigger... does increase flexibility... some impact to plotting... no efficiency impacts

function setV(id, value, places) {
	let unit = document.getElementById(id).dataset.unit;
	if (typeof places === 'undefined')
		places = (typeof UNIT_PLACES ==='undefined') ? 3:UNIT_PLACES;
	if (typeof value === 'string') {
		document.getElementById(id).value = value;
	} else {
		if (typeof UNIT_MAP[unit] !== 'undefined'){
			value = convertTo(value, UNIT_MAP[unit][UNIT_sys]);
		}
		document.getElementById(id).value = value.toFixed(places);
	}
}

function getVE(id, dir) {
	// Get the value, with error in the specified direction (+1 or -1).
	return getV(id, NaN, false) + dir*getV(id+'_err', 0, true);
}

// converting between things is for suckers. Just convert to base units, always.
function convertFrom(number, from_unit) {
	let uconv = UNIT_CONVERSIONS[from_unit];
	let newnumber = [];
	if (typeof number == 'object') {
		for (var i=0;i<number.length;i++)
			newnumber.push(number[i]*uconv);
		return newnumber;
	}
	return number*uconv;
}

function convertTo(number, to_unit) {
	let uconv = UNIT_CONVERSIONS[to_unit];
	let newnumber = [];
	if (typeof number == 'object') {
		for (var i=0;i<number.length;i++)
			newnumber.push(number[i]/uconv);
		return newnumber;
	}
	return number/uconv;
}

function convertFromTo(number, from_unit, to_unit) {
	return convertTo(convertFrom(number, from_unit), to_unit);
}

// '1 of this unit to <base unit>'
var UNIT_BASES = {
	'm': ['m', 'mm', 'in', 'ft'],
	'N-m': ['ft-lbf', 'in-lbf', 'ozf-in', 'N-m', 'N-mm'],
	'N': ['N', 'lbf', 'kgf', 'ozf'],
	'kg': ['kg', 'g', 'lbm', 'slug'],
	'm/s': ['m/s', 'ft/s', 'in/s', 'mm/s'],
	'm/s^2': ['m/s^2', 'ft/s^2'],
	'c/m': ['c/ft', 'c/m'],
	'kg m^2': ['kg m^2', 'lbm in^2', 'kg mm^2'],
	'Pa': ['kPa', 'MPa', 'GPa', 'Pa', 'psi', '10^6 psi'],
	'J': ['J'],
	'C': ['C'],
	'rad': ['rad', 'radian', 'revolutions', 'rev', 'degrees', 'deg'],
	'rad/s': ['rad/s', 'RPM'],
	'rad/s^2': ['rad/s^2', 'RPM/s'],
	'm^4': ['mm^4', 'in^4'],
	'm^2': ['mm^2', 'in^2'],
	'kg/m^3': ['kg/m^3', 'g/cm^3', 'lbm/in^3'],
	'N/m': ['lbf/in']
};

var UNIT_CONVERSIONS = {
	'': 1, // bypass
	'-': 1,
	's': 1,
	
	"m":  1,
	"mm": 1e-3,
	"in": 0.0254,
	"thou": 0.0254e-3,
	"ft": 0.3048,

	"ft-lbf": 1.356,
	"in-lbf": 0.113,
	"ozf-in": 0.007062,
	"N-m": 1,
	"N-mm": 1e-3,

	"N": 1,
	"lbf": 4.448,
	"kgf": 9.807,
	"ozf": .278,

	"kg": 1,
	"g": 1e-3,
	"lbm": .4536,
	"slug": 14.59,

	"m/s": 1,
	"ft/s": 0.3048,
	"in/s": 0.0254,
	"mm/s": 1e-3,

	"m/s^2": 1,
	"ft/s^2": 0.3048,

	"c/ft": 3.280,
	"c/m": 1,

	"kg m^2": 1,
	"lbm in^2": 2.926e-4,
	"kg mm^2": 1e-6,

	'kPa': 1000,
	'MPa': 1e6,
	'GPa': 1e9,
	'Pa': 1,
	'psi': 6894.76,
	'10^6 psi': 6894.76e+6,

	'J': 1, //note: ft-lbf is covered by the torque section; and conversion factor is the same.

	'C': 1,

	'rad': 1,
	'radian': 1,
	'revolutions': Math.PI*2,
	'rev': Math.PI*2,
	'degrees': Math.PI/180,
	'deg': Math.PI/180,

	'rad/s': 1,
	'RPM': Math.PI*2/60,

	'rad/s^2': 1,
	'RPM/s': Math.PI*2/60,

	'mm^4': 1e-12,
	'in^4': Math.pow(0.0254, 4),

	'mm^2': 1e-6,
	'in^2': Math.pow(0.0254, 2),

	'kg/m^3': 1,
	'g/cm^3': 1000,
	'lbm/in^3': 27679.9,

	'N/m': 1,
	'lbf/in': 4.448/0.0254,

	'N-m/RPM': 60/Math.PI/2,
	'in-lbf/RPM': 60/Math.PI/2*0.113,
	'N-m/kRPM': 60/Math.PI/2/1000,
	'in-lbf/kRPM': 60/Math.PI/2*0.113/1000
}