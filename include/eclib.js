VERSION = 0.5;

function EC_onload() {
	document.getElementById('topbar_version').innerHTML = VERSION;
}

function interp1D(xs, ys, xq) {
	let i=1;
	for (; i<xs.length-1 && !isNaN(xs[i]) && xq>xs[i]; i++) {}
	return ys[i-1] + (ys[i]-ys[i-1])/(xs[i]-xs[i-1])*(xq-xs[i-1]);
}

function interp2D(xs, ys, zs, xq, yq) { // x indexes rows, y indexes columns
	let i=1;
	for (; i<xs.length-1 && !isNaN(xs[i]) && xq>xs[i]; i++) {}
	let x1 = xs[i];
	let x2 = xs[i-1];
	let y1 = zs[i];
	let y2 = zs[i-1];
	let z1 = interp1D(ys, y1, yq);
	let z2 = interp1D(ys, y2, yq);
	return interp1D([x1,x2], [z1,z2], xq);
}