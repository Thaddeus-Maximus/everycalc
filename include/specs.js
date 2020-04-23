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
}

// '1 of this unit to <base unit>'
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
	'in^4': Math.pow(0.0254, 4)

}

// converting between things is for suckers. Just convert to base units, always.
function convert(number, from_unit) {
	return number*unit_conversions[from_unit];
}

function convert_to(number, to_unit) {
	uconv = unit_conversions[to_unit];
	if (typeof number == 'object') {
		for (var i=0;i<number.length;i++)
			number[i] = number[i]/uconv;
		return number;
	}
	return number/uconv;
}


function get_motor_data(motor,key){
	return motor_data[motor][key];
}