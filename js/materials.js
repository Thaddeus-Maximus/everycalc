let MATERIAL_DATA = { // 1 g/cm^3 = 1000 kg/m^3
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
	'Titanium Ti6Al4V': {
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
	'Nylon 6/6': {
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
	'PC': {
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

let MATERIAL_TYPES = {
	'Steel': ['4140N Steel', '1018 Hot-Rolled Steel'],
	'Aluminum': ['7075-T6 Aluminum', '6061-T6 Aluminum'],
	'Titanium': ['Titanium Ti6Al4V'],
	'Magnesium': ['Magnesium AM100A-F'],
	'Nylon': ["MF Onyx", "Nylon 6/6"],
	'Polypropylene': ["PP Homopolymer"],
	'Polycarbonate': ["PC"],
	'Printable': ["PLA", "ABS", "PET-G", "MF Onyx", "Nylon 6/6"]
}

function MATERIAL_populateSelect(id_base, no_custom) {
	let select    = document.getElementById(`${id_base}_base`);
	//let subselect = document.getElementById(`${id_base}_detail`);
	let old_val = select.value;
	select.innerHTML = '';
	for (base in MATERIAL_TYPES) {
		console.log(base, select.children);
		let opt = document.createElement('option');
		opt.innerHTML = base;
		opt.value = base;
		if (old_val == base) opt.selected = true;
		select.appendChild(opt);
	}
	if(!no_custom) {
		let opt = document.createElement('option');
		opt.innerHTML = 'Custom';
		opt.value = 'custom';
		if (old_val == base) opt.selected = true;
		select.appendChild(opt);
	}

	MATERIAL_selectBase(id_base);
}

function MATERIAL_selectBase(id_base) {
	let select    = document.getElementById(`${id_base}_base`);
	let subselect = document.getElementById(`${id_base}_detail`);
	let old_val = select.value;
	subselect.innerHTML = '';
	if (select.value == 'custom') {
		subselect.disabled = true;
		return true;
	}
	subselect.disabled = false;
	for (matl of MATERIAL_TYPES[select.value]) {
		console.log(matl);
		let opt = document.createElement('option');
		opt.innerHTML = matl;
		opt.value = matl;
		if (old_val == matl) opt.selected = true;
		subselect.appendChild(opt);
	}
	return false;
}