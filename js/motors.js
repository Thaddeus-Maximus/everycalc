/*
 * Motor Module (MOTOR)
 */

function MOTOR_setupMotorSelect(select_id) {
	let select = document.getElementById(select_id);
	let i=0;
	for(motor in MOTOR_specs) {
		i++;
		let opt = document.createElement('option');
		opt.innerHTML = MOTOR_specs[motor]["plain_name"];
		opt.value = motor;
		select.appendChild(opt);
	}
}

function MOTOR_getSpecs(motor,key){
	if (key=="max_rpm")
		return convertFrom(MOTOR_specs[motor][key], 'RPM');
	else
		return MOTOR_specs[motor][key];
}

var MOTOR_specs = {
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