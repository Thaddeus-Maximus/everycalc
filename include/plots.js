/*
Plot Module (PLOT).

Please include the following in your onload script:
 PLOT_onload()
 
Depends on following:

References the following entities:
 unit_select: a <select> element containing
 	<option> elements with values corresponding to indices of the unit lists in the UNIT_MAP.

*/ 

// create chart_name UNIT_MAP entries

// IDEA: Make the chart element contain things for query tool! (Since 'globals' are needed)

/*
PLOT_example_config = {
	chartName: "chart_name",
	axes: {	
		x: {
			numTicks: 6,
			boxEnds: false,
			negativeHandling: 'posonly' //negonly, symmetric, fitzero
			margin: 0
		},
		y: {
			numTicks: 6
			boxEnds: false,
			negativeHandling: 'posonly'
		},
		z: {
			syncWithY: true // if you set this, doesn't matter what else you put- the zAxis just becomes yAxis. except margin
			margin: 4
		},
	}
	datasets: {
		"name": {
			axis: 'x', // only one can have x
			channel: 3,
			transform: Math.abs // optional, function
		},
		"name": {
			axis: '7', // only one can have x
			channel: 1,
			transform: Math.abs // optional, function
			// scaling will be added
		}
	},
	queries: [
		{name: 'x',
		 number: 3, //set to 0 for single-queries without suffixes
		 channel: 0,
		 places: 4 }
	] // if queries is undefined just ignore the query aspect algotether
	// query boxes of format: `query_${config.chartName}_${name}_${number}`
}
*/

function PLOT_computeScaling(config, mins, maxs) {
	let H = [];
	let bases = [];
	let neg_mode = config.negativeHandling;
	let box_end = config.boxEnds;
	let ticks = [];
	let min_idx = 0;
	let max_idx = 0;
	let min_scaling = [];
	let max_scaling = [];

	// generate bases
	for(i in mins) {
		let h = 0;
		switch(neg_mode) {
			case 'posonly':
				h = maxs[i]/config.numTicks;
				break;
			case 'negonly':
				h = -mins[i]/config.numTicks;
				break;
			case 'symmetric':
				h = Math.max(
					+maxs[i]/config.numTicks*2,
					-mins[i]/config.numTicks*2
				);
				break;
			case 'fit':
				let span = maxs[i] - mins[i];
				h    = span/config.numTicks;
				break;
			case 'fitzero':
				let span = Math.max(0, maxs[i]) - Math.min(0, mins[i]);
				h    = span/config.numTicks;
				break;
		}

		let base = Math.floor(Math.log10(h)-Math.log10(5));
		bases.push(base);
		H.push(Math.round(h/Math.pow(10,base))*Math.pow(10,base));
		ticks.push([]);

		min_scaling.push(mins[i]/H[i]);
		max_scaling.push(max_rem, maxs[i]/H[i]);
	}

	// how many intervals to the end? (may be a float with non-boxed ends)
	let min_rem = Math.min(min_scaling);
	let max_rem = Math.min(max_scaling);
	switch(neg_mode) {
		case 'posonly':
			min_idx = 0;
			if (box_end)
				max_idx = Math.ceil (max_rem);
			else
				max_idx = Math.floor(max_rem);
			break;
		case 'negonly':
			max_idx = 0;
			if (box_end)
				min_idx = Math.floor(min_rem);
			else
				min_idx = Math.ceil (min_rem);
			break;
		case 'symmetric':
			if (box_end) {
				min_idx = Math.min(Math.floor(min_rem), Math.floor(-max_rem));
				max_idx = Math.max(Math.ceil (max_rem), Math.ceil (-min_rem));
			} else {
				min_idx = Math.min(Math.ceil (min_rem), Math.ceil (-max_rem));
				max_idx = Math.max(Math.floor(max_rem), Math.floor(-min_rem));
			}
			break;
		case 'fit':
			// This will result in multiple axes being scaled about zero. I _think_ this is for the best.
			if (box_end) {
				min_idx = Math.floor(min_rem);
				max_idx = Math.ceil (max_rem);
			} else {
				min_idx = Math.ceil (min_rem);
				max_idx = Math.floor(max_rem);
			}
			break;
		case 'fitzero':
			if (box_end) {
				min_idx = Math.min(0, Math.floor(min_rem));
				max_idx = Math.max(0, Math.ceil (max_rem));
			} else {
				min_idx = Math.min(0, Math.ceil (min_rem));
				max_idx = Math.max(0, Math.floor(max_rem));
			}
			break;
	}
	if (box_end) {
		min_rem = min_idx;
		max_rem = max_idx;
	}

	return {
		minIdx: min_idx,
		maxIdx: max_idx,
		minRem: min_rem,
		maxRem: max_rem,
		labelBases: bases,
		intervalHt: H
	};
}

function PLOT_drawTicks(chartName, axis, plotScaling, axisScaling, margin) {
	altaxis  = axis == 'x' ? 'y':'x';  // which axis am I opposed to?
	realaxis = axis == 'z' ? 'y':axis; // which axis does this really plot onto (in the x-y plane)

	grid = document.getElementById(`${chartName}_${axis}_grid`);
	while(grid.firstChild) grid.removeChild(grid.firstChild);
	labels = document.getElementById(`${chartName}_${axis}_axlabels`);
	while(labels.firstChild) labels.removeChild(labels.firstChild);

	let g = (axis=='z' ? plotScaling.xH:plotScaling.xL) + (axis=='y' ? -1:1)*margin;

	for (let i=min_idx; i<=max_idx; i++) {
		let labelstr = '';
		for (j in mins) {
			if (i==0) {
				ticks[j].push(0);
				labelstr = '0';
			} else {
				ticks[j].push(H[j]*i);
				labelstr += (H[j]*i).toFixed(bases[j] > 0 ? 0:-bases[j]);
				if (j != maxs.x.length-1)
					labelstr += ' / ';
			}
		}

		// draw ticks now
		let line = document.createElementNS('http://www.w3.org/2000/svg','line');
		line.setAttribute(altaxis+'1', xH); line.setAttribute(altaxis+'2', xL);
		let f = plotScaling.yL + (plotScaling.yH-plotScaling.yL)*(i-min_rem)/(max_rem-min_rem);
		line.setAttribute(realaxis+'1', f);
		line.setAttribute(realaxis+'2', f);
		line.setAttribute('class', 'grid');
		grid.append(line);

		label = document.createElementNS('http://www.w3.org/2000/svg','text');
		label.setAttribute(altaxis,  g);
		label.setAttribute(realaxis, f);
		label.innerHTML = labelstr;
		labels.append(label);
	}
}

function PLOT_makePoint(plotScaling, xScaling, yScaling, xq, yq) {
	var pt = svg.createSVGPoint();
	pt.x = plotScaling.xL + (plotScaling.xH-plotScaling.xL)/(xScaling.fH-yScaling.fL)*(xq-scaling.fL);
	pt.y = plotScaling.yL + (plotScaling.yH-plotScaling.yL)/(yScaling.fH-yScaling.fL)*(yq-scaling.fL);
	return pt;
}

/*
 * Draw a line plot
 * Line plots have an x axis, a y axis, and a z axis (the axis opposed to y, not an axis that is orthoganal to both x and y)
 * This actually doesn't handle plot labels at all. That's up to you (to let the UNIT module take care of it)
 */
function PLOT_drawLinePlot(config, channels) {
	/*[t, v_raw, d_raw, cur, F_raw, a_raw] = channels;
		d = convertTo(d_raw, UNIT_MAP['query_d'][UNIT_sys]);
		v = convertTo(v_raw, UNIT_MAP['query_v'][UNIT_sys]);
		f = convertTo(F_raw, UNIT_MAP['query_f'][UNIT_sys]);
		a = convertTo(a_raw, UNIT_MAP['query_a'][UNIT_sys]);*/

	let channels_conv = convertTo(channels); // TODO: Make this dream not a meme

	config.dom = {
		svg : document.getElementById(config.chartName),
		axes : {
			x : document.getElementById(`${config.chartName}_x_axis`),
			y : document.getElementById(`${config.chartName}_y_axis`),
			z : document.getElementById(`${config.chartName}_z_axis`)
		}
	};

	config.scaling = {};
	config.scaling.x0 = Math.min(config.dom.axes.y.x1.baseVal.value, config.dom.axes.y.x2.baseVal.value);
	config.scaling.xf = Math.max(config.dom.axes.y.x1.baseVal.value, config.dom.axes.y.x2.baseVal.value);
	config.scaling.y0 = Math.max(config.dom.axes.x.y1.baseVal.value, config.dom.axes.x.y2.baseVal.value);
	config.scaling.yf = Math.min(config.dom.axes.x.y1.baseVal.value, config.dom.axes.x.y2.baseVal.value);

	let lines = {};
	let mins  = {x:[],y:[],z:[]};
	let maxs  = {x:[],y:[],z:[]};
	let dsnames = {x:[],y:[],z:[]};
	for (name in config.datasets) {
		let axis = config.datasets[name].axis;
		mins[axis].push(
			Math.min(...channels_conv[config.datasets[name].channel]) );
		maxs[axis].push(
			Math.max(...channels_conv[config.datasets[name].channel]) );
		dsnames[axis].push(name);

		if (config.datasets[name].axis != 'x') {
			let line = document.getElementById(`${config.chartName}_${name}_line`);
			line.setAttribute("points","");
			lines[name] = line;
		}
	}

	config.axes.x.scaling = PLOT_computeScaling(config.axes.x, mins.x, maxs.x);
	if (config.axes.z.syncWithY) {
		let scaling = PLOT_computeScaling(config.axes.y, mins.y.concat(mins.z), maxs.y.concat(maxs.z));
		// deep copy
		config.axes.y.scaling = {...scaling};
		config.axes.z.scaling = {...scaling};
		// separate out the interval stuff
		config.axes.y.scaling.labelBases = scaling.labelBases.slice(0,mins.y.length);
		config.axes.z.scaling.labelBases = scaling.labelBases.slice(mins.y.length);
		config.axes.y.scaling.intervalHt = scaling.intervalHt.slice(0,mins.y.length);
		config.axes.z.scaling.intervalHt = scaling.intervalHt.slice(mins.y.length);
	} else {
		// stay independent and face catastrophe. boooooo-ring.
		config.axes.y.scaling = PLOT_computeScaling(config.axes.y, mins.y, maxs.y);
		config.axes.z.scaling = PLOT_computeScaling(config.axes.z, mins.z, maxs.z);
	}

	// unpack scaling into each dataset config
	for (axis in config.axes) {
		let cas = config.axes[axis].scaling;
		for (let i in dsnames[axis]) {
			let set = dsnames[axis][i];
			config.datasets[set].scaling = {
				fL: cas.intervalHt[i]*cas.minRem,
				fH: cas.intervalHt[i]*cas.maxRem
			}
		}
	}

	PLOT_drawTicks(config.chartName, 'x', config.scaling, config.axes.x.scaling, config.axes.x.margin);
	PLOT_drawTicks(config.chartName, 'y', config.scaling, config.axes.y.scaling, config.axes.y.margin);
	PLOT_drawTicks(config.chartName, 'z', config.scaling, config.axes.z.scaling, config.axes.z.margin);

	// reap your hard work

	let xScl  = config.axes[dsnames.x[0]].scaling;
	let xChnl = channels[config.datasets[dsnames.x[0]].channel];
	for (name in config.datasets) {
		if (config.datasets[name].axis == 'x') continue;

		let fChnl = channels[config.datasets[name].channel];
		let fScl  = config.datasets[name].scaling

		for (let i in xChnl.length) {
			lines[name].points.appendItem(PLOT_makePoint(
				config.scaling,
				xScl,
				fScl,
				xChnl[i],
				fChnl[i]
			));
		}
	}
}

/*
 * Draw an area plot
 * Area plots have an x axis, a y axis, and a z axis (the axis opposed to y, not an axis that is orthoganal to both x and y)
 * Area plots are closed; they fill in the zone between channels_a and channels_b
 * This actually doesn't handle plot labels at all. That's up to you (to let the UNIT module take care of it)
 */
function PLOT_drawAreaPlot(config, channels_a, channels_b) {
	// probably just process the channels and hand it off to drawLinePlot to have fun
}