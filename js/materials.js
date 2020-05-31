var MATERIAL_DATA = { // 1 g/cm^3 = 1000 kg/m^3
	'4140N Steel': { 
		'Ef': 190e9,
		'E':  190e9,
		'UTS': 660e6,
		'Sy':  590e6,
		'density': 7.8e3
	}, 
	'1018 Hot-Rolled Steel': {
		'Ef': 190e9,
		'E':  190e9,
		'UTS': 430e6,
		'Sy':  240e6,
		'density': 7.8e3
	},
	'7075-T6 Aluminum': {
		'Ef': 70e9,
		'E':  70e9,
		'UTS': 560e6,
		'Sy': 480e6,
		'density': 3.0e3
	},
	'6061-T6 Aluminum': {
		'Ef': 69e9,
		'E':  69e9,
		'UTS': 310e6,
		'Sy': 270e6,
		'density': 2.7e3
	},
	'Titanium': {
		'Ef': 110e9,
		'E':  110e9,
		'density': 4.4e3
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