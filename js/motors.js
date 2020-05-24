/*
 * Motor Module (MOTOR)
 */

function MOTOR_setupMotorSelect(id) {
	let select = document.getElementById(id + '_select');
	let i=0;
	let opt = null;
	for(motor in MOTOR_specs) {
		i++;
		opt = document.createElement('option');
		opt.innerHTML = MOTOR_specs[motor]["plain_name"];
		opt.value = motor;
		select.appendChild(opt);
	}

	opt = document.createElement('option');
	opt.innerHTML = "** Custom Values **"
	opt.value = 'custom';
	select.appendChild(opt);

	MOTOR_selectMotor(id, select.value);
}

function MOTOR_getSpec(motor, key){
	if (key=="max_speed")
		return convertFrom(MOTOR_specs[motor][key], 'RPM');
	else
		return MOTOR_specs[motor][key];
}

function MOTOR_computeState(motor, from, value) {
	// everything must be in base units here
	let state = {};
	let stall_torque = motor.count*motor.stall_torque*motor.efficiency*motor.pct_power;
	let max_speed = motor.max_speed*motor.pct_power;
	let stall_current = motor.count*motor.stall_current*motor.pct_power;
	let free_current  = motor.count*motor.free_current*motor.pct_power;
	switch(from) {
		case 'torque':
			state.current = (stall_current-free_current)*value/stall_torque + free_current;
			state.torque  = value;
			state.speed   = max_speed - value*max_speed/stall_torque;
			break;
		case 'speed':
			state.current = (stall_current-free_current)*(max_speed-value)/max_speed + free_current;
			state.torque  = (stall_torque)*(max_speed-value)/max_speed;
			state.speed   = value;
			break;
		case 'current':
			state.current = value;
			state.torque  = (value - free_current)*stall_torque/(stall_current-free_current);
			state.speed   = max_speed - state.torque*max_speed/stall_torque;
			break;
	}
	return state;
}

function MOTOR_computeIdleCurrent(motor, torque_target) {
	let stall_torque = motor.count*motor.stall_torque*motor.efficiency*motor.pct_power;
	let max_speed = motor.max_speed*motor.pct_power;
	let stall_current = motor.count*motor.stall_current*motor.pct_power;
	let free_current  = motor.count*motor.free_current*motor.pct_power;

	let cmd_pct = torque_target / stall_torque;
	return (stall_current*cmd_pct-free_current*cmd_pct)*torque_target/(stall_torque*cmd_pct) + free_current*cmd_pct;
}

let MOTOR_PROPS = ['max_speed', 'free_current', 'stall_torque', 'stall_current', 'count', 'pct_power', 'efficiency'];
let SELECTABLE_MOTOR_PROPS = ['max_speed', 'free_current', 'stall_torque', 'stall_current'];

function MOTOR_selectMotor(id, motorName) {
	if(typeof motorName == 'undefined')
		motorName = document.getElementById(id+"_select").value;
	else
		document.getElementById(id+"_select").value = motorName;

	if (motorName == 'custom') {
		SELECTABLE_MOTOR_PROPS.forEach(function(a){
			document.getElementById(id+"_"+a).readOnly = false;
		});
	} else if (motorName in MOTOR_specs) {
		SELECTABLE_MOTOR_PROPS.forEach(function(a) {
			document.getElementById(id+"_"+a).readOnly = true;
			setV(id+"_"+a, MOTOR_getSpec(motorName, a));
		});
	} else {
		SELECTABLE_MOTOR_PROPS.forEach(function(a) {
			document.getElementById(id+"_"+a).readOnly = true;
			setV(id+"_"+a, '***');
		});
	}
}

// build a motor object from inputs prefixed with id
function MOTOR_packMotor(id) {
	let motor = {};
	for (prop of MOTOR_PROPS) {
		motor[prop] = getV(id+'_'+prop);
	}
	/*motor.free_current  *= getV(id+'_count')*getV(id+'_pct_power');
	motor.stall_current *= getV(id+'_count')*getV(id+'_pct_power');
	motor.stall_torque  *= getV(id+'_count')*getV(id+'_pct_power');*/
	return motor;
}

function MOTOR_dumpMotor(id, motor) {
	for (prop of SELECTABLE_MOTOR_PROPS) {
		setV(id+'_'+prop, motor[prop]);
	}
	return motor;
}

var MOTOR_specs = {
	"neo": {
		"plain_name": "REV NEO",
		"max_speed": 5880,
		"free_current": 1.3,
		"max_power": 516,
		"stall_torque": 3.36,
		"stall_current": 166
	},"neo550": {
		"plain_name": "REV NEO 550",
		"max_speed": 11000,
		"free_current": 1.4,
		"max_power": 279,
		"stall_torque": 0.97,
		"stall_current": 100
	},

	"cim": {
		"plain_name": "CIM",
		"max_speed": 5330,
		"free_current": 2.7,
		"max_power": 337,
		"stall_torque": 2.41,
		"stall_current": 131
	},

	"falcon500": {
		"plain_name":"VEX Falcon 500",
		"max_speed": 6380,
		"free_current": 1.5,
		"max_power": 783,
		"stall_torque": 4.69,
		"stall_current": 257
	},

	"minicim": {
		"plain_name": "MiniCIM",
		"max_speed": 5840,
		"free_current": 3,
		"max_power": 215,
		"stall_torque": 1.41,
		"stall_current": 89
	},

	"bag": {
		"plain_name": "BAG",
		"max_speed": 13180,
		"free_current": 1.8,
		"max_power": 149,
		"stall_torque": 0.43,
		"stall_current": 53
	},

	"775pro": {
		"plain_name": "775Pro or AM Redline",
		"max_speed": 18730,
		"free_current": 0.7,
		"max_power": 347,
		"stall_torque": 0.71,
		"stall_current": 134
	},

	"am9015": {
		"plain_name": "AndyMark 9015",
		"max_speed": 14270,
		"free_current": 3.7,
		"max_power": 134,
		"stall_torque": 0.36,
		"stall_current": 71
	},

	"neverest": {
		"plain_name": "AndyMark NeveRest",
		"max_speed": 5480,
		"free_current": 0.4,
		"max_power": 25,
		"stall_torque": 0.17,
		"stall_current": 10
	},

	"rs550": {
		"plain_name": "BaneBots RS550",
		"max_speed": 19000,
		"free_current": 0.4,
		"max_power": 190,
		"stall_torque": 0.38,
		"stall_current": 84
	},

	"nxt_nimh": {
		"plain_name": "Mindstorms NXT Motor, NiMH",
		"max_speed": 130,
		"free_current": 60e-3, 
		"max_power": 1.07,
		"stall_torque": 28e-2,
		"stall_current": 950e-3
		// from https://www.philohome.com/nxtmotor/nxtmotor.htm
	},

	"nxt_9v": {
		"plain_name": "Mindstorms NXT Motor, 9V",
		"max_speed": 165,
		"free_current": 60e-3, 
		"max_power": 1.7,
		"stall_torque": 37e-2,
		"stall_current": 1350e-3
		// from https://www.philohome.com/nxtmotor/nxtmotor.htm
	}
}