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
	let state = {};

	// everything must be in base units here
	if (motor.battery_voltage != undefined) {
		let stall_torque = motor.count*motor.stall_torque*motor.efficiency;
		let max_speed = motor.max_speed;
		let stall_current = motor.count*motor.stall_current;
		let free_current  = motor.count*motor.free_current;
		let vfrac = null; let spdfrac = null;
		switch(from) {
			case 'speed':
				state.speed   = value;
				state.voltage = (motor.battery_voltage + motor.wire_resistance*(stall_current-free_current)*value/max_speed)/(1+motor.wire_resistance*stall_current/motor.voltage);
				vfrac     = state.voltage/motor.voltage;
				spdfrac   = (max_speed*vfrac-value)/max_speed/vfrac;
				state.current = ((stall_current-free_current)*spdfrac + free_current);
				if (state.current > motor.current_limit) {
					// solve forwards now
					state.current = motor.current_limit;
					state.voltage = motor.battery_voltage - motor.wire_resistance*state.current;
					vfrac   = state.voltage/motor.voltage;
					spdfrac = (max_speed*vfrac-value)/max_speed/vfrac;
				}
				state.torque  = (state.current-free_current*vfrac)/(stall_current-free_current)*stall_torque;
				break;
			case 'torque':
				state.torque  = value;
				state.current = ((state.torque-0)/(stall_torque)*(stall_current-free_current) + free_current);
				state.voltage = motor.battery_voltage - motor.wire_resistance*state.current;
				vfrac = state.voltage/motor.voltage;
				state.speed   = (state.voltage/motor.voltage*stall_torque-state.torque)/stall_torque*max_speed;
				break;
			case 'current':
				state.current = Math.min(motor.current_limit, value);
				state.voltage = motor.battery_voltage - motor.wire_resistance*state.current;
				vfrac = state.voltage/motor.voltage;
				state.torque  = (state.current-free_current*vfrac)/(stall_current-free_current)*stall_torque;
				state.speed   = (state.voltage/motor.voltage*stall_torque-state.torque)/stall_torque*max_speed;
				break;
		}
	} else {
		let stall_torque = motor.count*motor.stall_torque*motor.efficiency;
		let max_speed = motor.max_speed;
		let stall_current = motor.count*motor.stall_current;
		let free_current  = motor.count*motor.free_current;
		switch(from) {
			case 'speed':
				state.voltage = motor.voltage;
				state.current = (stall_current-free_current)*(max_speed-value)/max_speed + free_current;
				state.torque  = (stall_torque)*(max_speed-value)/max_speed;
				state.speed   = value;
				break;
			case 'torque':
				state.voltage = motor.voltage;
				state.current = (stall_current-free_current)*value/stall_torque + free_current;
				state.torque  = value;
				state.speed   = max_speed - value*max_speed/stall_torque;
				break;
			case 'current':
				state.voltage = motor.voltage;
				state.current = value;
				state.torque  = (value - free_current)*stall_torque/(stall_current-free_current);
				state.speed   = max_speed - state.torque*max_speed/stall_torque;
				break;
		}
	}

	return state;
}

function MOTOR_computeElectricalState(motor, from, value) {

}

function MOTOR_computeIdleCurrent(motor, torque_target) {
	let stall_torque = motor.count*motor.stall_torque*motor.efficiency;
	let max_speed = motor.max_speed;
	let stall_current = motor.count*motor.stall_current;
	let free_current  = motor.count*motor.free_current;

	let cmd_pct = torque_target / stall_torque;
	return (stall_current*cmd_pct-free_current*cmd_pct)*torque_target/(stall_torque*cmd_pct) + free_current*cmd_pct;
}

let MOTOR_PROPS = ['max_speed', 'free_current', 'stall_torque', 'stall_current', 'count', 'efficiency'];
let SELECTABLE_MOTOR_PROPS = ['max_speed', 'free_current', 'stall_torque', 'stall_current'];

function MOTOR_selectMotor(id, motorName) {
	if(typeof motorName == 'undefined')
		motorName = document.getElementById(id+"_select").value;
	else
		document.getElementById(id+"_select").value = motorName;
	let nomVoltsInp = document.getElementById(id+"_voltage");

	if (motorName == 'custom') {
		SELECTABLE_MOTOR_PROPS.forEach(function(a){
			document.getElementById(id+"_"+a).readOnly = false;
		});
		if (nomVoltsInp) nomVoltsInp.readOnly = false;
	} else if (motorName in MOTOR_specs) {
		SELECTABLE_MOTOR_PROPS.forEach(function(a) {
			document.getElementById(id+"_"+a).readOnly = true;
			setV(id+"_"+a, MOTOR_getSpec(motorName, a));
		});
		if (nomVoltsInp) {
			nomVoltsInp.readOnly = true;
			nomVoltsInp.value = MOTOR_getSpec(motorName, 'voltage');
		}
	} else {
		SELECTABLE_MOTOR_PROPS.forEach(function(a) {
			document.getElementById(id+"_"+a).readOnly = true;
			setV(id+"_"+a, '***');
		});
		if (nomVoltsInp) {
			nomVoltsInp.readOnly = true;
			nomVoltsInp.value = '***';
		}
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


//let MOTOR_ELEC_PROPS = ['max_speed', 'free_current', 'stall_torque', 'stall_current', 'count', 'efficiency', 'current_limit', 'battery_voltage', 'voltage', 'wire_resistance'];

function MOTOR_packElectricalMotor(id) {
	let motor = {};
	for (prop of MOTOR_PROPS) {
		motor[prop] = getV(id+'_'+prop);
	}
	motor.current_limit   = getV(id+'_current_limit',   +Infinity);
	motor.voltage         = getV(id+'_voltage',         1);
	motor.battery_voltage = getV(id+'_battery_voltage', motor.voltage);
	motor.wire_resistance = getV(id+'_wire_resistance',  0);
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
		"stall_current": 166,
		"voltage": 12
	},"neo550": {
		"plain_name": "REV NEO 550",
		"max_speed": 11000,
		"free_current": 1.4,
		"max_power": 279,
		"stall_torque": 0.97,
		"stall_current": 100,
		"voltage": 12
	},

	"cim": {
		"plain_name": "CIM",
		"max_speed": 5330,
		"free_current": 2.7,
		"max_power": 337,
		"stall_torque": 2.41,
		"stall_current": 131,
		"voltage": 12
	},

	"falcon500": {
		"plain_name":"VEX Falcon 500",
		"max_speed": 6380,
		"free_current": 1.5,
		"max_power": 783,
		"stall_torque": 4.69,
		"stall_current": 257,
		"voltage": 12
	},

	"minicim": {
		"plain_name": "MiniCIM",
		"max_speed": 5840,
		"free_current": 3,
		"max_power": 215,
		"stall_torque": 1.41,
		"stall_current": 89,
		"voltage": 12
	},

	"bag": {
		"plain_name": "BAG",
		"max_speed": 13180,
		"free_current": 1.8,
		"max_power": 149,
		"stall_torque": 0.43,
		"stall_current": 53,
		"voltage": 12
	},

	"775pro": {
		"plain_name": "775Pro or AM Redline",
		"max_speed": 18730,
		"free_current": 0.7,
		"max_power": 347,
		"stall_torque": 0.71,
		"stall_current": 134,
		"voltage": 12
	},

	"am9015": {
		"plain_name": "AndyMark 9015",
		"max_speed": 14270,
		"free_current": 3.7,
		"max_power": 134,
		"stall_torque": 0.36,
		"stall_current": 71,
		"voltage": 12
	},

	"neverest": {
		"plain_name": "AndyMark NeveRest",
		"max_speed": 5480,
		"free_current": 0.4,
		"max_power": 25,
		"stall_torque": 0.17,
		"stall_current": 10,
		"voltage": 12
	},

	"rs550": {
		"plain_name": "BaneBots RS550",
		"max_speed": 19000,
		"free_current": 0.4,
		"max_power": 190,
		"stall_torque": 0.38,
		"stall_current": 84,
		"voltage": 12
	},

	"nxt_nimh": {
		"plain_name": "Mindstorms NXT Motor, NiMH",
		"max_speed": 130,
		"free_current": 60e-3, 
		"max_power": 1.07,
		"stall_torque": 28e-2,
		"stall_current": 950e-3,
		"voltage": 7.2
		// from https://www.philohome.com/nxtmotor/nxtmotor.htm
	},

	"nxt_9v": {
		"plain_name": "Mindstorms NXT Motor, 9V",
		"max_speed": 165,
		"free_current": 60e-3, 
		"max_power": 1.7,
		"stall_torque": 37e-2,
		"stall_current": 1350e-3,
		"voltage": 9.0
		// from https://www.philohome.com/nxtmotor/nxtmotor.htm
	}
}