/*
Plot Module (PLOT).

This is trying to be a suckless plotting library. I think I've accomplished that? From an eagle-eye view this is what you do:
- Make a svg element of the appropriate structure in your HTML file
- Define all the styles and pretty stuff you want there. This library does NOTHING AESTETHIC. It's all up to you.
  Which if you ask me is great, because you can easily merge with your css....
- Pass in a config object (see below for examples) and a channels object to the appropriate PLOT_draw function
- Achieve plot
 
Depends on following:
- General library
- SVG(s) with elements of appropriate ids

To use units:
- Include the UNIT library
- Create UNIT_MAP entries with keys of form chartName_channelName

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
				h    = (maxs[i] - mins[i])/config.numTicks;
				break;
			case 'fitzero':
				h    = (Math.max(0, maxs[i]) - Math.min(0, mins[i]))/config.numTicks;
				break;
		}

		let base = Math.floor(Math.log10(h)-Math.log10(5));
		bases.push(base);
		H.push(Math.round(h/Math.pow(10,base))*Math.pow(10,base));
		ticks.push([]);

		min_scaling.push(mins[i]/H[i]);
		max_scaling.push(maxs[i]/H[i]);
	}

	// how many intervals to the end? (may be a float with non-boxed ends)
	let min_rem = Math.min(...min_scaling);
	let max_rem = Math.max(...max_scaling);
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
	let isx = axis == 'x';
	let altaxis  = axis == 'x' ? 'y':'x';  // which axis am I opposed to?
	let realaxis = axis == 'z' ? 'y':axis; // which axis does this really plot onto (in the x-y plane)

	grid = document.getElementById(`${chartName}_${axis}_grid`);
	while(grid.firstChild) grid.removeChild(grid.firstChild);
	labels = document.getElementById(`${chartName}_${axis}_axlabels`);
	while(labels.firstChild) labels.removeChild(labels.firstChild);

	let g = (isx ? plotScaling.yL : (axis=='z' ? plotScaling.xH:plotScaling.xL)) + (axis=='y' ? -1:1)*margin;

	for (let i=axisScaling.minIdx; i<=axisScaling.maxIdx; i++) {
		let labelstr = '';
		for (j in axisScaling.intervalHt) {
			if (i==0) {
				labelstr = '0';
			} else {
				labelstr += (axisScaling.intervalHt[j]*i).toFixed(axisScaling.labelBases[j] > 0 ? 0:-axisScaling.labelBases[j]);
				if (j != axisScaling.intervalHt.length-1)
					labelstr += ' / ';
			}
		}

		// draw grid
		let line = document.createElementNS('http://www.w3.org/2000/svg','line');
		line.setAttribute(altaxis+'1', isx ? plotScaling.yH : plotScaling.xH);
		line.setAttribute(altaxis+'2', isx ? plotScaling.yL : plotScaling.xL);

		// draw ticks
		let f = isx ? 
				plotScaling.xL + (plotScaling.xH-plotScaling.xL)*(i-axisScaling.minRem)/(axisScaling.maxRem-axisScaling.minRem):
				plotScaling.yL + (plotScaling.yH-plotScaling.yL)*(i-axisScaling.minRem)/(axisScaling.maxRem-axisScaling.minRem);
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

function PLOT_makePoint(svg, plotScaling, xScaling, yScaling, xq, yq) {
	var pt = svg.createSVGPoint();
	pt.x = plotScaling.xL + (plotScaling.xH-plotScaling.xL)/(xScaling.fH-xScaling.fL)*(xq-xScaling.fL);
	pt.y = plotScaling.yL + (plotScaling.yH-plotScaling.yL)/(yScaling.fH-yScaling.fL)*(yq-yScaling.fL);
	return pt;
}

/*
 * Draw a line plot
 * Line plots have an x axis, a y axis, and a z axis (the axis opposed to y, not an axis that is orthoganal to both x and y)
 * This actually doesn't handle axis labels at all- just data labels. That's up to you (to let the UNIT module take care of it)

Your SVG element should have an id (herein referred to as SVGid as it will be the prefix of its children) and the following elements:
- SVGid_background: a <rect> that is the background of the actual chart area
- SVGid_x_axis: a <line>
- SVGid_y_axis: a <line>
- SVGid_z_axis: a <line>
- SVGid_x_grid: a <g>
- SVGid_y_grid: a <g>
- SVGid_z_grid: a <g>
- SVGid_querybar: a <line> spanning from top to bottom
- <polylines> with ids SVGid_channelName_line for each channel you wish to plot

@var channels = {channelName: [list,of,datapoints], ... }

@var config = {
	chartName: "chart_name", // corresponds to the id of the svg element
	axes: {	
		x: {
			numTicks: 6, 				// number of ticks on the axis
			boxEnds: false,				// should the ticks end abruptly, or close out the plot?
			negativeHandling: 'posonly',// how to place data with respect to zero.
										// posonly: always show zero, only show positive values (zero on bottom)
										// negonly: always show zero, only show negative values (zero on top)
										// symmetric: always show zero, show positive and negative values, but center on zero (zero on center)
										// fit: (EXPERIMENTAL): fit data. ignore that zero is a special number (???? zero)
										// fitzero: (EXPERIMENTAL): fit data, but always shown the zero bar (floating zero)
			margin: 15 					// padding for tick labels
		},
		y: {
			numTicks: 6,
			boxEnds: false,
			negativeHandling: 'posonly',
			margin: 5
		},
		z: {
			margin: 5,
			syncWithY: true // setting this to true will effectively copy the tick settings of the y axis, and make sure that the ticks line up.
		},
	}
	datasets: {
		"name": {
			axis: 'x' // which axis to plot on. Only one dataset can have x
		},
		"name": {
			axis: 'z'
		}
	},
	queries: {
		INDEX: {}, // this is a special one
		x: {
		 number: 3, //set to 0 for single-queries without suffixes
		 places: 4 }
	} // if queries is undefined just ignore the query aspect algotether
	// query boxes of format: `query_${config.chartName}_${name}_${number}`
}
 */
function PLOT_drawLinePlot(config, channels, handler) {
	channels_conv = {};
	for (name in channels) {
		let unit = UNIT_MAP ? UNIT_MAP[`${config.chartName}_${name}`] : undefined;
		if (unit){
			channels_conv[name] = convertFrom(channels[name], unit[UNIT_sys]);
		}
		else{
			channels_conv[name] = channels[name];
		}
	}

	// this is silly but whatever
	config.dom = {
		svg : document.getElementById(config.chartName),
		axes : {
			x : document.getElementById(`${config.chartName}_x_axis`),
			y : document.getElementById(`${config.chartName}_y_axis`),
			z : document.getElementById(`${config.chartName}_z_axis`)
		}
	};

	config.scaling = {};
	config.scaling.xL = Math.min(config.dom.axes.y.x1.baseVal.value, config.dom.axes.y.x2.baseVal.value);
	config.scaling.xH = Math.max(config.dom.axes.y.x1.baseVal.value, config.dom.axes.y.x2.baseVal.value);
	config.scaling.yL = Math.max(config.dom.axes.x.y1.baseVal.value, config.dom.axes.x.y2.baseVal.value);
	config.scaling.yH = Math.min(config.dom.axes.x.y1.baseVal.value, config.dom.axes.x.y2.baseVal.value);

	let lines = {};
	let mins  = {x:[],y:[],z:[]};
	let maxs  = {x:[],y:[],z:[]};
	let dsnames = {x:[],y:[],z:[]};
	for (name in config.datasets) {
		let axis = config.datasets[name].axis;
		mins[axis].push(
			Math.min(...channels_conv[name]) );
		maxs[axis].push(
			Math.max(...channels_conv[name]) );
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
		config.axes.y.scaling.labelBases = config.axes.y.scaling.labelBases.slice(0,mins.y.length);
		config.axes.z.scaling.labelBases = config.axes.z.scaling.labelBases.slice(mins.y.length);
		config.axes.y.scaling.intervalHt = config.axes.y.scaling.intervalHt.slice(0,mins.y.length);
		config.axes.z.scaling.intervalHt = config.axes.z.scaling.intervalHt.slice(mins.y.length);
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
		config.axes[axis].datasets = dsnames[axis];
	}

	PLOT_drawTicks(config.chartName, 'x', config.scaling, config.axes.x.scaling, config.axes.x.margin);
	PLOT_drawTicks(config.chartName, 'y', config.scaling, config.axes.y.scaling, config.axes.y.margin);
	PLOT_drawTicks(config.chartName, 'z', config.scaling, config.axes.z.scaling, config.axes.z.margin);

	// reap your hard work

	let xScl  = config.datasets[dsnames.x[0]].scaling;
	let xChnl = channels_conv[dsnames.x[0]];
	for (name in config.datasets) {
		if (config.datasets[name].axis == 'x') continue;

		let fChnl = channels_conv[name];
		let fScl  = config.datasets[name].scaling

		for (i in xChnl) {
			lines[name].points.appendItem(PLOT_makePoint(
				config.dom.svg,
				config.scaling,
				xScl,
				fScl,
				xChnl[i],
				fChnl[i]
			));
		}
	}

	config.dom.svg.PLOT_config = config;
	config.dom.svg.PLOT_channels = channels;
	config.dom.svg.PLOT_channelsConv = channels_conv;

	if (!handler) {
		handler = function(e) {
			PLOT_focusHandler(config.dom.svg, e);
		}
	}
	
	config.dom.svg.addEventListener('mousemove', handler);
	config.dom.svg.addEventListener('mousedown', handler);
}

function PLOT_focusHandler(chart, event) {
	let config    = chart.PLOT_config;
	let channels  = chart.PLOT_channels;

	let plotScale = config.scaling;
	let xScale    = config.datasets[config.axes.x.datasets[0]].scaling;
	let xChannel  = channels[config.axes.x.datasets[0]];
	let xUnit     = UNIT_MAP ? UNIT_MAP[config.axes.x.datasets[0]] : '-';
	    xUnit     = xUnit ? xUnit[UNIT_sys] : '-';

	let bg        = document.getElementById(config.chartName);
	let querybar  = document.getElementById(`${config.chartName}_querybar`);

	let xq=0, tq=0;
	if (!isNaN(event)) {
		tq = parseFloat(event);
		xq = plotScale.xL + (plotScale.xH-plotScale.xL)*(tq - xScale.fL)/(xScale.fH - xScale.fL);
	} else {
		if (event.buttons != 1) return;
		xq = event.clientX - bg.getBoundingClientRect().left;
		tq = convertFrom(xScale.fL + (xScale.fH-xScale.fL)*(xq - plotScale.xL)/(plotScale.xH-plotScale.xL), xUnit);
		if (tq < xScale.fL) {
			tq = xScale.fL;
			xq = convertFrom(plotScale.xL, xUnit);
		}
		if (tq > xScale.fH) {
			tq = xScale.fH;
			xq = convertFrom(plotScale.xL, xUnit);
		}
	}
	
	for (q in config.queries) {

		let query_conf = config.queries[q];

		if (q == 'INDEX') {
			setV(`${config.chartName}_INDEX`, interpIdx(xChannel, tq), query_conf.places);
		} else {
			setV(`${config.chartName}_${q}`, interp1D(xChannel, channels[q], tq), query_conf.places);
		}
	}

	querybar.setAttribute('opacity', 1);
	querybar.setAttribute('x1', xq);
	querybar.setAttribute('x2', xq);

	document.getElementById(`${config.chartName}_querytable`).style.display = '';

	document.getElementById(config.chartName).lastQuery = tq;
	return xq; // helpful for further processing upstream
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