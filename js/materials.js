// Se: uncorrected endurance limit / fatigue strength (rotating beam). Steels use Se' = 0.5·UTS (max 700 MPa);
// aluminums have no true endurance limit, so Se is the fatigue strength at 5e8 cycles.
let MATERIAL_DATA = { // 1 g/cm^3 = 1000 kg/m^3
	'4140N Steel': {
		'Ef': 190e9,
		'E':  190e9,
		'G':  80e9,
		'UTS': 660e6,
		'Sy':  590e6,
		'Se':  330e6,
		'density': 7.8e3
	},
	'1018 Hot-Rolled Steel': {
		'Ef': 190e9,
		'E':  190e9,
		'G':  80e9,
		'UTS': 430e6,
		'Sy':  240e6,
		'Se':  215e6,
		'density': 7.8e3
	},
	'A36 Steel': { // ASTM minimums
		'Ef': 200e9,
		'E':  200e9,
		'G':  79e9,
		'UTS': 400e6,
		'Sy':  250e6,
		'Se':  200e6,
		'density': 7.85e3
	},
	'A1008 CS Sheet': { // cold-rolled commercial sheet; typical values (spec: Sy 140-275 MPa, no UTS min)
		'Ef': 200e9,
		'E':  200e9,
		'G':  79e9,
		'UTS': 330e6,
		'Sy':  205e6,
		'Se':  165e6,
		'density': 7.85e3
	},
	'A1008 SS Gr 33 Sheet': { // ASTM minimums
		'Ef': 200e9,
		'E':  200e9,
		'G':  79e9,
		'UTS': 330e6,
		'Sy':  230e6,
		'Se':  165e6,
		'density': 7.85e3
	},
	'A1008 SS Gr 40 Sheet': { // ASTM minimums
		'Ef': 200e9,
		'E':  200e9,
		'G':  79e9,
		'UTS': 360e6,
		'Sy':  275e6,
		'Se':  180e6,
		'density': 7.85e3
	},
	'A500 Gr B Round Tube': { // ASTM minimums
		'Ef': 200e9,
		'E':  200e9,
		'G':  79e9,
		'UTS': 400e6,
		'Sy':  290e6,
		'Se':  200e6,
		'density': 7.85e3
	},
	'A500 Gr B Square/Rect Tube': { // ASTM minimums
		'Ef': 200e9,
		'E':  200e9,
		'G':  79e9,
		'UTS': 400e6,
		'Sy':  315e6,
		'Se':  200e6,
		'density': 7.85e3
	},
	'A513 DOM 1020 Tube': { // typical as-drawn
		'Ef': 200e9,
		'E':  200e9,
		'G':  79e9,
		'UTS': 552e6,
		'Sy':  483e6,
		'Se':  276e6,
		'density': 7.85e3
	},
	'1018 Cold-Drawn Steel': { // Shigley A-20
		'Ef': 200e9,
		'E':  200e9,
		'G':  79e9,
		'UTS': 440e6,
		'Sy':  370e6,
		'Se':  220e6,
		'density': 7.85e3
	},
	'1020 Hot-Rolled Steel': { // Shigley A-20
		'Ef': 200e9,
		'E':  200e9,
		'G':  79e9,
		'UTS': 380e6,
		'Sy':  210e6,
		'Se':  190e6,
		'density': 7.85e3
	},
	'1045 Hot-Rolled Steel': { // Shigley A-20
		'Ef': 200e9,
		'E':  200e9,
		'G':  79e9,
		'UTS': 570e6,
		'Sy':  310e6,
		'Se':  285e6,
		'density': 7.85e3
	},
	'1045 Cold-Drawn Steel': { // Shigley A-20
		'Ef': 200e9,
		'E':  200e9,
		'G':  79e9,
		'UTS': 630e6,
		'Sy':  530e6,
		'Se':  315e6,
		'density': 7.85e3
	},
	'1095 Hot-Rolled Steel': { // Shigley A-20
		'Ef': 200e9,
		'E':  200e9,
		'G':  79e9,
		'UTS': 830e6,
		'Sy':  460e6,
		'Se':  415e6,
		'density': 7.85e3
	},
	'12L14 Cold-Drawn Steel': { // typical
		'Ef': 200e9,
		'E':  200e9,
		'G':  79e9,
		'UTS': 540e6,
		'Sy':  415e6,
		'Se':  270e6,
		'density': 7.85e3
	},
	'4130 Normalized Steel': { // Shigley A-21
		'Ef': 200e9,
		'E':  200e9,
		'G':  79e9,
		'UTS': 670e6,
		'Sy':  430e6,
		'Se':  335e6,
		'density': 7.85e3
	},
	'4140 Annealed Steel': { // Shigley A-21
		'Ef': 200e9,
		'E':  200e9,
		'G':  79e9,
		'UTS': 655e6,
		'Sy':  417e6,
		'Se':  327.5e6,
		'density': 7.85e3
	},
	'4140 Normalized Steel': { // Shigley A-21
		'Ef': 200e9,
		'E':  200e9,
		'G':  79e9,
		'UTS': 1020e6,
		'Sy':  655e6,
		'Se':  510e6,
		'density': 7.85e3
	},
	'4140 Q&T 540C Steel': { // Shigley A-21, tempered 540 C (~30 HRC)
		'Ef': 200e9,
		'E':  200e9,
		'G':  79e9,
		'UTS': 950e6,
		'Sy':  840e6,
		'Se':  475e6,
		'density': 7.85e3
	},
	'4340 Annealed Steel': { // Shigley A-21
		'Ef': 200e9,
		'E':  200e9,
		'G':  79e9,
		'UTS': 745e6,
		'Sy':  470e6,
		'Se':  372.5e6,
		'density': 7.85e3
	},
	'4340 Q&T 540C Steel': { // Shigley A-21, tempered 540 C
		'Ef': 200e9,
		'E':  200e9,
		'G':  79e9,
		'UTS': 1170e6,
		'Sy':  1080e6,
		'Se':  585e6,
		'density': 7.85e3
	},
	'303 Stainless (Annealed)': { // typical
		'Ef': 193e9,
		'E':  193e9,
		'G':  77e9,
		'UTS': 620e6,
		'Sy':  240e6,
		'Se':  310e6,
		'density': 8.0e3
	},
	'304 Stainless (Annealed)': { // ASTM A240 minimums
		'Ef': 193e9,
		'E':  193e9,
		'G':  77e9,
		'UTS': 515e6,
		'Sy':  205e6,
		'Se':  257.5e6,
		'density': 8.0e3
	},
	'316 Stainless (Annealed)': { // ASTM A240 minimums
		'Ef': 193e9,
		'E':  193e9,
		'G':  77e9,
		'UTS': 515e6,
		'Sy':  205e6,
		'Se':  257.5e6,
		'density': 8.0e3
	},
	'17-4 PH H1150 Stainless': { // AMS 5643 minimums
		'Ef': 193e9,
		'E':  193e9,
		'G':  77e9,
		'UTS': 930e6,
		'Sy':  725e6,
		'Se':  465e6,
		'density': 8.0e3
	},
	'17-4 PH H900 Stainless': { // AMS 5643 minimums
		'Ef': 193e9,
		'E':  193e9,
		'G':  77e9,
		'UTS': 1310e6,
		'Sy':  1170e6,
		'Se':  655e6,
		'density': 8.0e3
	},
	'7075-T6 Aluminum': {
		'Ef': 70e9,
		'E':  70e9,
		'G':  26.9e9,
		'UTS': 560e6,
		'Sy': 480e6,
		'Se': 159e6,
		'density': 3.0e3
	},
	'6061-T6 Aluminum': {
		'Ef': 69e9,
		'E':  69e9,
		'G':  26e9,
		'UTS': 310e6,
		'Sy': 270e6,
		'Se': 96.5e6,
		'density': 2.7e3
	},
	'Titanium Ti6Al4V': {
		'Ef': 110e9,
		'E':  110e9,
		'G':  44e9,
		'UTS': 950e6, // annealed
		'Sy':  880e6,
		'Se':  510e6, // unnotched, 1e7 cycles
		'density': 4.4e3
	},
	'Magnesium AM100A-F': { // AM100A-F
		'Ef': 46e9,
		'E':  46e9,
		'G':  17e9,
		'UTS': 150e6,
		'Sy':  83e6,
		'density': 1.7e3
	},
	'MF Onyx': { // https://support.markforged.com/hc/en-us/articles/209934486-Onyx
		'St': 36e6, // Tensile strength
		'E': 1.4e9,
		'G': 0.5e9,
		'Sf': 81e6, // Flexural Strength
		'Ef': 2.9e9,
		'density': 1.18e3
	},
	'Nylon 6/6': {
		'density': 1.1e3,
		'E':  3.3e9,
		'G':  1.2e9,
		'Ef': 2.8e9,
		'Sf': 110e6,
		'St': 86e6
	},
	'PP Homopolymer': {
		'E': 1.4e9,
		'G': 0.5e9,
		'Ef': 1.5e9,
		'St': 36e6,
		'Sf': 41e6,
		'density': 0.91e3
	},
	'PC': {
		'E':  2.3e9,
		'G':  0.84e9,
		'Ef': 2.3e9,
		'St': 66e6,
		'Sf': 92e6,
		'density': 1.2e3
	},
	'PLA': {
		'density': 1.3e3,
		'E': 3.5e9,
		'G': 1.3e9,
		'Ef': 4.0e9,
		'Sf': 80e6,
		'St': 50e6
	},
	'ABS': {
		'density': 1.1e3,
		'E': 2.0e9,
		'G': 0.74e9,
		'Ef': 2.1e9,
		'Sf': 97e6,
		'St': 41e6
	},
	'PET-G': {
		'density': 1.3e3,
		'E':  2.2e9,
		'G':  0.8e9,
		'Ef': 2.1e9,
		'Sf': 77e6,
		'St': 53e6
	}
}

let MATERIAL_TYPES = {
	'Steel': ['4140N Steel', '1018 Hot-Rolled Steel', 'A36 Steel', 'A1008 CS Sheet', 'A1008 SS Gr 33 Sheet', 'A1008 SS Gr 40 Sheet', 'A500 Gr B Round Tube', 'A500 Gr B Square/Rect Tube', 'A513 DOM 1020 Tube', '1018 Cold-Drawn Steel', '1020 Hot-Rolled Steel', '1045 Hot-Rolled Steel', '1045 Cold-Drawn Steel', '1095 Hot-Rolled Steel', '12L14 Cold-Drawn Steel', '4130 Normalized Steel', '4140 Annealed Steel', '4140 Normalized Steel', '4140 Q&T 540C Steel', '4340 Annealed Steel', '4340 Q&T 540C Steel'],
	'Stainless': ['303 Stainless (Annealed)', '304 Stainless (Annealed)', '316 Stainless (Annealed)', '17-4 PH H1150 Stainless', '17-4 PH H900 Stainless'],
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
	let old_val = subselect.value;
	subselect.innerHTML = '';
	if (select.value == 'custom') {
		subselect.disabled = true;
		return true;
	}
	subselect.disabled = false;
	for (matl of MATERIAL_TYPES[select.value]) {
		let opt = document.createElement('option');
		opt.innerHTML = matl;
		opt.value = matl;
		if (old_val == matl) opt.selected = true;
		subselect.appendChild(opt);
	}
	return false;
}