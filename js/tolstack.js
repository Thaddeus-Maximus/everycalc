// spread library, TOLS
// what-for figuring out how tolerance stackups end up affecting results

// TODO: THIS



function TOLS_bitTest(num, bit){
    return ((num>>bit) % 2 != 0)
}

function TOLS_computeTolStack(fn, argsList, rankers) {
	// fn should take a list of arguments and return a run object, with stats as a key for an object containing... stats
	// argsList is a list of inputs that should be pulled in to make an object of arguments
	// returns the most extreme run and stats objects for all rankers (a ranker is an index for the stats object returned by fn)
	//  in format of {ranker: [lowRun, highRun], ...}
	let extrema = {};
	let extrema_vals = {};
	for (ranker of rankers) {
		extrema[ranker] = [{}, {}];
		extrema_vals[ranker] = [+Infinity, -Infinity];
	}

	let params_const = {};
	let params_var   = {};
	let nvars = 0;
	for (param of argsList) {
		if (document.getElementById(param+'_err') && getV(param+'_err')) {
			params_var[param]   = NaN;
			nvars++;
		} else {
			params_const[param] = getV(param);
		}
	}

	for (let i=0; i<Math.pow(2, nvars); i++) {
		for (let j=0; j<nvars; j++) {
			let key = Object.keys(params_var)[j];
			params_var[key] = getVE(key, TOLS_bitTest(i, j) ? 1:-1);
		}
		let params_pack = {...params_var, ...params_const};

		let run = fn(params_pack);
		for (ranker in extrema) {
			if (run.stats[ranker] < extrema_vals[ranker][0]) {
				extrema_vals[ranker][0] = run.stats[ranker];
				extrema[ranker][0] = run;
			}
			if (run.stats[ranker] > extrema_vals[ranker][1]) {
				extrema_vals[ranker][1] = run.stats[ranker];
				extrema[ranker][1] = run;
			}
		}
	}

	return [extrema_vals, extrema];
}