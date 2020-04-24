var motor_data = {
		"neo": {
			"plain_name": "REV NEO",
			"max_rpm": 5880,
			"free_current": 1.3,
			"max_power": 516,
			"stall_torque": 3.36,
			"stall_current": 166
		},"neo550": {
			"plain_name": "REV NEO 550",
			"max_rpm": 11000,
			"free_current": 1.4,
			"max_power": 279,
			"stall_torque": 0.97,
			"stall_current": 100
		},

		"cim": {
			"plain_name": "CIM",
			"max_rpm": 5330,
			"free_current": 2.7,
			"max_power": 337,
			"stall_torque": 2.41,
			"stall_current": 131
		},

		"falcon500": {
			"plain_name":"VEX Falcon 500",
			"max_rpm": 6380,
			"free_current": 1.5,
			"max_power": 783,
			"stall_torque": 4.69,
			"stall_current": 257
		},

		"minicim": {
			"plain_name": "MiniCIM",
			"max_rpm": 5840,
			"free_current": 3,
			"max_power": 215,
			"stall_torque": 1.41,
			"stall_current": 89
		},

		"bag": {
			"plain_name": "BAG",
			"max_rpm": 13180,
			"free_current": 1.8,
			"max_power": 149,
			"stall_torque": 0.43,
			"stall_current": 53
		},

		"775pro": {
			"plain_name": "775Pro or AM Redline",
			"max_rpm": 18730,
			"free_current": 0.7,
			"max_power": 347,
			"stall_torque": 0.71,
			"stall_current": 134
		},

		"am9015": {
			"plain_name": "AndyMark 9015",
			"max_rpm": 14270,
			"free_current": 3.7,
			"max_power": 134,
			"stall_torque": 0.36,
			"stall_current": 71
		},

		"neverest": {
			"plain_name": "AndyMark NeveRest",
			"max_rpm": 5480,
			"free_current": 0.4,
			"max_power": 25,
			"stall_torque": 0.17,
			"stall_current": 10
		},

		"rs550": {
			"plain_name": "BaneBots RS550",
			"max_rpm": 19000,
			"free_current": 0.4,
			"max_power": 190,
			"stall_torque": 0.38,
			"stall_current": 84
		},

		"nxt_nimh": {
			"plain_name": "Mindstorms NXT Motor, NiMH",
			"max_rpm": 130,
			"free_current": 60e-3, 
			"max_power": 1.07,
			"stall_torque": 28e-2,
			"stall_current": 950e-3
			// from https://www.philohome.com/nxtmotor/nxtmotor.htm
		},

		"nxt_9v": {
			"plain_name": "Mindstorms NXT Motor, 9V",
			"max_rpm": 165,
			"free_current": 60e-3, 
			"max_power": 1.7,
			"stall_torque": 37e-2,
			"stall_current": 1350e-3
			// from https://www.philohome.com/nxtmotor/nxtmotor.htm
		}
	}

var belts_data = {
	"vex": {
		"5mm": [60,70,80,90,100,104,110,120,130,140,150,160,170,180,200,225,250],
		"3mm": [45,50,55,60,70,85,90,100,105,110,115,120,125,140,180]
	},
	"am": {
		"5mm": [40,45,48,93,55,85,104,107,110,117,120,131,140,151,160,170,180,200]
	}
};
var belt_mfrs = {"vex": "VexPro", "am": "AndyMark"};

// '1 of this unit to <base unit>'
var unit_bases = {
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
	'kg/m^3': ['kg/m^3', 'g/cm^3', 'lbm/in^3'] 
};

var unit_conversions = {
	"m":  1,
	"mm": 1e-3,
	"in": 0.0254,
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
	"ft/s^2": .09290,

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
	'lbm/in^3': 27679.9
}

// converting between things is for suckers. Just convert to base units, always.
function convert(number, from_unit) {
	return number*unit_conversions[from_unit];
}

function convert_to(number, to_unit) {
	uconv = unit_conversions[to_unit];
	newnumber = [];
	if (typeof number == 'object') {
		for (var i=0;i<number.length;i++)
			newnumber.push(number[i]/uconv);
		return newnumber;
	}
	return number/uconv;
}


function get_motor_data(motor,key){
	return motor_data[motor][key];
}

var materials = { // 1 g/cm^3 = 1000 kg/m^3
	'Aluminum': { // 6061
		'Ef': 69e9,
		'E':  69e9,
		'density': 2.7e3
	},
	'Steel': { // 4140
		'Ef': 190e9,
		'E':  190e9,
		'density': 7.8e3
	}, 
	'Titanium': {
		'Ef': 110e9,
		'E':  110e9,
		'density': 4.4
	},
	'Magnesium': { // AM100A-F
		'Ef': 46e9,
		'E':  46e9,
		'density': 1.7e3
	},
	'MF Onyx': { // https://support.markforged.com/hc/en-us/articles/209934486-Onyx
		'St': 36e6, // Tensile strength
		'E': 1.4e9,
		'Sf': 81e6, // Flexural Strength
		'Ef': 2.9e9, 
		'density': 1.18e3
	},
	'Nylon 6/6 (AKA 101)': {
		'density': 1.1e3,
		'E':  3.3e9,
		'Ef': 2.8e9,
		'Sf': 110e6,
		'St': 86e6
	},
	'PP Homopolymer': {
		'E': 1.4e9,
		'Ef': 1.5e9,
		'St': 36e6,
		'Sf': 41e6,
		'density': 0.91e3
	},
	'Polycarbonate': {
		'E':  2.3e9,
		'Ef': 2.3e9,
		'St': 66e6,
		'Sf': 92e6,
		'density': 1.2e3
	},
	'PLA': {
		'density': 1.3e3,
		'E': 3.5e9,
		'Ef': 4.0e9,
		'Sf': 80e6,
		'St': 50e6
	},
	'ABS': {
		'density': 1.1e3,
		'E': 2.0e9,
		'Ef': 2.1e9,
		'Sf': 97e6,
		'St': 41e6
	},
	'PET-G': {
		'density': 1.3e3,
		'E':  2.2e9,
		'Ef': 2.1e9,
		'Sf': 77e6,
		'St': 53e6
	}
}