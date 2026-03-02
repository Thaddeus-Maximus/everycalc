# EveryCalc — CLAUDE.md

Engineering calculator suite built as standalone, exportable HTML files. No build step, no server required — everything runs client-side.

---

## Project Philosophy

- **Self-contained pages**: every calculator can be exported as a single HTML file with all CSS/JS embedded and current inputs baked in, then shared or re-imported with state intact
- **No external network dependencies**: MathJS is vendored locally; all other libs live in `js/`
- **Dual unit systems**: every calculator supports SI (metric) and English (imperial) via a unified unit map, switched live without recomputing
- **Uncertainty propagation**: the tolerance stacking library (`tolstack.js`) brute-forces all 2ⁿ combinations of ± error inputs so min/max outputs can be shown alongside nominal
- **Interactive tutorials**: `walkthrough.js` shows a spotlight overlay on first visit to guide new users through each calculator's inputs/outputs
- **localStorage persistence**: inputs survive browser close and reload, versioned by eclib's `VERSION` constant

---

## Directory Layout

```
/
├── index.html              ← navigation menu (voucher grid)
├── *.html                  ← one file per calculator
├── include/
│   ├── style.css           ← master stylesheet (W3.CSS base + custom)
│   ├── fonts/              ← Lexend, Oxanium, Thadscript, PT Serif
│   ├── logo.svg
│   ├── menu_*.svg          ← 250×250 icons used in index.html vouchers
│   └── section_*.svg       ← cross-section illustrations for beamcalc
├── js/
│   ├── eclib.js            ← core utilities, error state, math helpers
│   ├── units.js            ← getV/setV, UNIT_MAP, all conversions
│   ├── export.js           ← downloadPage, printPage, localStorage persistence
│   ├── walkthrough.js      ← tutorial spotlight overlay
│   ├── motors.js           ← motor database + electrical simulation
│   ├── materials.js        ← material property database
│   ├── belts.js            ← belt geometry + Gates torque rating tables
│   ├── orings.js           ← o-ring dash size lookup tables
│   ├── plots.js            ← SVG 2D/3D plotting library
│   ├── tolstack.js         ← tolerance stackup brute-force
│   ├── isofits.js          ← ISO 286 hole/shaft tolerance zones (large)
│   └── math.js             ← MathJS (vendored, used by beamcalc for FEA)
├── static/                 ← reference sheets (pipesizes, tap charts, speeds)
│   └── index.html
├── docs/                   ← PDF whitepapers explaining the underlying models
└── README.md, CONTRIBUTING.md, LICENSE.md, CNAME
```

---

## Calculator Pages

| File | Title | Key Libraries |
|---|---|---|
| `generalmech.html` | General Motorized Mechanism | motors, plots, tolstack |
| `dualwheel_launcher.html` | Dual-Wheel Pitcher | motors, plots, tolstack |
| `hooded_launcher.html` | Hood-Wheel Pitcher | motors, plots, tolstack |
| `trajectory.html` | Ballistic Trajectory | plots |
| `rockerpod.html` | Rocker Pod | motors |
| `beltsize.html` | Belt Sizing & Strength | belts |
| `beamcalc.html` | Beam Deflection & Stress | plots, math (MathJS FEA) |
| `transstrength.html` | Transmission Strength | materials |
| `oring.html` | O-Ring Calculator | orings |
| `fit_tolerance.html` | ISO Fit & Tolerance | isofits |
| `cutopt.html` | 1-D Cut Optimizer | *(none)* |
| `vdrop.html` | Wire Voltage Drop | *(none)* |
| `pneu_trans_cyl.html` | Pneumatic Cylinder | *(partial)* |
| `specview.html` | Spec Viewer | *(none)* |

---

## JavaScript Libraries

### eclib.js — Core Utilities

Always included. Must call `EC_onload()` first in `init()`.

```javascript
EC_onload()                         // set topbar version number, set error=1
EC_setOnInput(fn)                   // attach oninput handler to all <input>s
EC_setOnKeyUp(fn)                   // attach onkeyup handler (default: Enter → compute())
setError(code, msg)                 // 0=OK, 1=Waiting, 2=ERROR — reflects in topbar
selectItemByValue(elmnt, value)     // programmatically select a <select> option
interp1D(xs, ys, xq)               // linear interpolation
interp2D(xs, ys, zs, xq, yq)      // bilinear interpolation
interpIdx(xs, xq)                   // get interpolation index
parseMath(expr, variables)          // evaluate a math expression with substitution
NaNTo(to, x)                        // NaN fallback value
avg(arr)
sign(x)
```

### units.js — Unit Conversion

The most important library. Provides `getV`/`setV` which are the standard read/write interface for all inputs/outputs.

**Setup:**
```javascript
UNIT_MAP = {
    'force':     ['N', 'lbf'],
    'dimension': ['mm', 'in'],
    'torque':    ['N-m', 'in-lbf'],
    // ... any quantity that switches with the unit selector
};
// In topbar HTML:
<select id="unit_select" onchange="UNIT_change(); compute();">
    <option value=0>Millimeters</option>
    <option value=1 selected>Inches</option>
</select>
```

**Reading inputs:**
```javascript
let x = getV('input_id');           // reads value, converts to base SI unit
let x = getV('id', default_val);    // use default_val when field is empty
let x = getV('id', NaN, true);      // enable %-error parsing (e.g. "5%" → 0.05×nominal)
let x = getVE('id', +1);           // get value + error tolerance (for stackups)
let x = getVE('id', -1);           // get value − error tolerance
```

**Writing outputs:**
```javascript
setV('output_id', value);           // auto-determines decimal places by magnitude
setV('output_id', value, 4);        // force 4 decimal places
setV('output_id', value, 4, true);  // show leading + sign
setV('output_id', value, 64, false, false, true);  // fractional display (e.g. 3/8)
```

**Unit labels:** any element with `class="unit" data-unit="force"` auto-updates its text to `[N]` or `[lbf]` on `UNIT_change()`.

**Inputs with units:** `<input data-unit="force" id="my_force" />` — `getV` automatically reads the displayed value and converts to the base unit (N); `setV` converts back to the display unit.

**UNIT_CONVERSIONS** keys (all convert to SI):
`m mm in ft thou`, `N lbf kgf ozf`, `N-m in-lbf ft-lbf ozf-in N-mm`,
`kg g lbm slug`, `m/s ft/s in/s mm/s`, `kPa MPa GPa Pa psi`,
`rad deg RPM RPM/s`, `mm^4 in^4 mm^2 in^2`, `kg/m^3 g/cm^3 lbm/in^3`, etc.

### export.js — Persistence & Export

```javascript
EXP_FN_BASE = 'my_calc';   // set before calling EXP_onload()
// requires: <script id="EXP_inputs_frame"></script> in HTML
// requires: <a id="download_frame" hidden></a> in HTML

EXP_onload()               // returns 0 (fresh), 1 (exported HTML loaded), 2 (localStorage loaded)
EXP_dumpPersistence()      // save all inputs to localStorage (call at end of compute())
downloadPage()             // inline all JS/CSS, bake inputs, trigger download
printPage()                // browser print
```

`packInputs()` / `unpackInputs()` handle all `<input type="text">`, `<input type="radio">`, and `<select>` elements by their `id`. **Every persistent element needs a unique id.**

### walkthrough.js — Tutorial Overlay

```javascript
WALK_STEPS = [
    {poi: 'element_id', desc: 'Explanatory text for this step.', valign: 'bottom', halign: 'right'},
    // valign: 'top' | 'bottom', halign: 'left' | 'center' | 'right'
];
WALK_onload()       // auto-enable on first visit (suppressed on exported pages)
WALK_enable()       // manual enable (wire to a "Tutorial" button)
WALK_disable()      // skip/exit
WALK_nextStep()     // advance (wire to walkthrough_overlay onclick)
```

Required SVG in body:
```html
<svg id="walkthrough_overlay" onclick="WALK_nextStep()">
    <path id="walkthrough_frame"></path>
    <text id="walkthrough_text"></text>
    <text id="walkthrough_skip_button" onclick="WALK_disable();">Skip Tutorial</text>
</svg>
```

### motors.js — Motor Database

FRC-oriented motor library (CIM, MiniCIM, NEO, Falcon 500, 775pro, etc.).

```javascript
MOTOR_setupMotorSelect('select_id')             // populate dropdown
MOTOR_selectMotor('select_id', motorName)       // load motor specs into inputs
MOTOR_packMotor('select_id')                    // → motor object from current inputs
MOTOR_computeState(motor, from, value)          // solve operating point
  // from: 'speed' | 'torque' | 'current'
  // returns: {speed, torque, current, voltage}
MOTOR_packElectricalMotor('select_id')          // full electrical simulation variant
MOTOR_computeIdleCurrent(motor, torque_target)
```

Motor spec shape: `{max_speed, stall_torque, stall_current, free_current, efficiency, count, voltage}`

### materials.js — Material Properties

```javascript
MATERIAL_populateSelect('select_id')    // populate category dropdown
MATERIAL_selectBase('select_id')        // load materials in chosen category into sub-select
```

`MATERIAL_DATA` keys: UTS, Sy, E, Ef (fatigue), density. Covers steels, aluminums, PLA, etc.

### belts.js — Belt Geometry & Ratings

```javascript
BELT_calculateLength(cc, d1t, d2t, crossed)              // → belt length in teeth
BELT_calculateCenterDist(length_teeth, d1, d2, crossed)  // → center distance (mm)
BELT_calculateWrap1/2(d1, d2, cc, pitch)                 // → wrap angle (rad)
BELT_computeBeltTorqueCapacity(bdata, rpm, teeth, width, length)  // → torque (N-m)
```

`BELT_RATINGS` object: `{htd_3mm, htd_5mm, gt3_2mm, gt3_3mm, gt3_5mm, gt2_2mm, gt2_3mm, gt2_5mm}` — each has teeth array, rpms array, torque matrix, length correction factors.

### plots.js — SVG Plotting

```javascript
PLOT_2D_create(chartName, config, channels)   // render 2D line/area chart into SVG #chartName
PLOT_3D_create(chartName, config, channels)   // render 3D surface
PLOT_computeScaling(config, mins, maxs)       // compute axis scales
PLOT_query_setup()                            // enable click-to-probe
```

Config: `{negativeHandling: 'posonly'|'negonly'|'symmetric'|'fit'|'fitzero', numTicks, pan, scale, boxEnds}`

Channels: `{ 'series_name': {data: [x1,y1,x2,y2,...], color, width, ...}, ... }`

### tolstack.js — Tolerance Stackup

```javascript
TOLS_computeTolStack(fn, argsList, rankers)
// fn: function taking args array → returns array of outputs
// argsList: array of id strings (read via getVE with ±1 directions)
// rankers: indices into fn output to maximize/minimize
// returns: {extrema_vals, extrema} for all combinations
```

### isofits.js — ISO 286 Fit Tolerances

```javascript
ISOFIT_computeZone(nominal_mm, zone_code)          // e.g. 'h7', 'H8' → {upper, lower} deviations (mm)
ISOFIT_getStandardFitClass(nominal_mm, basis, intent)  // suggest zone codes for clearance/transition/interference
```

---

## HTML Patterns

### Minimal Calculator Template

```html
<!DOCTYPE html>
<meta content="text/html;charset=utf-8" http-equiv="Content-Type">
<meta content="utf-8" http-equiv="encoding">

<link rel="stylesheet" href="include/style.css">
<script type="text/javascript" src="js/eclib.js"></script>
<script type="text/javascript" src="js/units.js"></script>
<script type="text/javascript" src="js/export.js"></script>
<script type="text/javascript" src="js/walkthrough.js"></script>
<script id="EXP_inputs_frame"></script>

<script type="text/javascript">
EXP_FN_BASE = 'mycalc';
UNIT_MAP = { 'dimension': ['mm', 'in'] };
WALK_STEPS = [{ poi: 'my_input', desc: 'Enter the dimension here.', valign: 'bottom' }];

function init() {
    EC_onload();
    EXP_onload();
    UNIT_change();
    EC_setOnInput(function(e) { setError(1); compute(); });
    EC_setOnKeyUp();   // default: Enter → compute()
    compute();
    WALK_onload();
}

function compute() {
    try {
        let x = getV('my_input');        // reads, converts to base units
        setV('my_output', x * 2);        // auto-formats, converts to display units
        setError(0);
        EXP_dumpPersistence();
    } catch(err) {
        console.log(err);
        setError(2, err);
    }
}
</script>

<html>
<body onload="init()">
<div id="topbar">
    <div class="topbar-la selectable" onclick="window.location='./'">EveryCalc</div>
    <div class="topbar-la" id="topbar_version"></div>
    <div class="topbar-la" id="topbar_filename"></div>
    <div class="topbar-la" id="topbar_unit">
        <select id="unit_select" onchange="UNIT_change(); compute();">
            <option value=0>Millimeters</option>
            <option value=1 selected>Inches</option>
        </select>
    </div>
    <div class="topbar-ctr" id="topbar_title">My Calculator</div>
    <div class="topbar-ra selectable" id="topbar_status"><span></span><span class="ttt"></span></div>
    <div class="topbar-ra selectable" onclick="downloadPage();" id="download">Export HTML</div>
    <div class="topbar-ra selectable" onclick="printPage();">Print</div>
    <div class="topbar-ra selectable" onclick="WALK_enable();">Tutorial</div>
    <a id="download_frame" hidden></a>
</div>

<svg id="walkthrough_overlay" onclick="WALK_nextStep()">
    <path id="walkthrough_frame"></path>
    <text id="walkthrough_text"></text>
    <text id="walkthrough_skip_button" onclick="WALK_disable();">Skip Tutorial</text>
</svg>

<div style="float: left;" class="container">
    <div style="display: table-row;">

        <!-- Input panel -->
        <div class="odd" style="display: table-cell;">
            <table id="my_inputs">
                <tr>
                    <th class="rowlabel">Dimension</th>
                    <td><input id="my_input" data-unit="dimension"></td>
                    <td class="unit" data-unit="dimension"></td>
                </tr>
            </table>
        </div>

        <!-- Output panel -->
        <div class="output" style="display: table-cell;">
            <table>
                <tr>
                    <th class="rowlabel">Double</th>
                    <td><input id="my_output" data-unit="dimension" readonly></td>
                    <td class="unit" data-unit="dimension"></td>
                </tr>
            </table>
        </div>

    </div>
</div>
</body>
</html>
```

### Key CSS Classes

| Class | Purpose |
|---|---|
| `.odd` | Light gray input panel background |
| `.even` | Slightly different gray (alternate rows) |
| `.output` | White output panel background |
| `.container` | Top-level wrapper; `float:left`, margin-top for topbar |
| `.rowlabel` | `<th>` label for a table row |
| `.collabel` | `<td>` label for a table column header |
| `.unit` | Right-aligned unit text cell |
| `.tiny` | Small cell (e.g., ± symbol) |
| `.narrow` | Narrow input |
| `.doublewide` | Wider select (160px) |
| `.selectable` | Cursor pointer on hover |
| `.ttt` | Tooltip text (shown on hover via CSS) |
| `.error` | Red highlight (also applied by `setError(2)` to topbar) |
| `.warning` | Orange highlight |
| `input[readonly]` | Auto-styled as output (gray background) |

### Layout: Side-by-Side Panels

```html
<div style="float: left;" class="container">
    <div style="display: table-row;">
        <div class="odd"   style="display: table-cell; vertical-align: top;"><!-- inputs --></div>
        <div class="output" style="display: table-cell; vertical-align: top;"><!-- outputs --></div>
    </div>
</div>
```

Additional panels (graphs, supplemental tables) go in more `table-cell` divs in the same row, or in a second `table-row` div below.

### Input Row Pattern

```html
<tr>
    <th class="rowlabel">Label
        <span class="ttt">Optional tooltip text shown on hover.</span>
    </th>
    <td><input id="my_id" data-unit="quantity_type"></td>
    <td class="tiny">±</td>
    <td><input id="my_id_err" data-unit="quantity_type"></td>   <!-- optional error field -->
    <td class="unit" data-unit="quantity_type"></td>
</tr>
```

### Tooltip Pattern

```html
<th class="rowlabel">Label <span class="ttt">Hover text here.</span></th>
```

---

## Adding a New Calculator

1. **Create `mycalc.html`** — copy the minimal template above; include only the JS libs you need
2. **Set `EXP_FN_BASE`** to a short unique snake_case string (used as localStorage key prefix and export filename)
3. **Define `UNIT_MAP`** — only include quantities that need to switch units; omit for dimensionless or single-unit quantities (e.g., amps, percent)
4. **Write `compute()`** — always wrap in try/catch, always end with `setError(0)` + `EXP_dumpPersistence()`
5. **Add to `index.html`** — append a voucher div in the menu grid
6. **Optionally create `include/menu_mycalc.svg`** — 250×250 SVG icon; reuse an existing one if no icon is ready

### Things that break persistence/export

- Elements without `id` attributes (they get skipped)
- Dynamically generated `<input>` or `<select>` elements added **after** `EXP_onload()` is called — populate them first, then call `EXP_onload()`
- `input type="checkbox"` — not handled by packInputs; use radio buttons instead, which are handled

---

## Conventions & Gotchas

- **Base units are always SI**: mm → m, degrees → rad, RPM → rad/s, lbf → N, etc. Store and compute in SI; only convert at the display layer via `getV`/`setV`
- **`getV` on an empty field returns `undefined`** unless you pass a default: `getV('id', 0)` or `getV('id', NaN)`. Always handle NaN in compute()
- **`setV` auto-picks decimal places** based on `log10(|value|)`: large numbers get fewer decimals, small numbers get more. Pass explicit `places` argument to override
- **`EC_setOnInput` fires on radio buttons too** (HTML `input` event fires on any `<input>` change) — don't double-register with inline `onchange` unless you're OK with two calls to `compute()` per click (harmless but wasteful)
- **Selects need `onchange="compute()"`** explicitly — `EC_setOnInput` only covers `<input>` elements, not `<select>`
- **The walkthrough reads element bounding boxes at runtime** — elements must be visible (not `display:none`) when their step is shown
- **`printPage()` and `downloadPage()`** are defined in `export.js` — don't redefine them
- **`VERSION` constant** is set in `eclib.js` — localStorage is invalidated when VERSION changes (old persistence is dropped and fresh defaults are used)

---

## File Naming

- Calculator HTML: `lowercase_or_camelcase.html` (no hyphens historically, though new files could use them)
- Menu icon SVG: `include/menu_<pagename>.svg`
- `EXP_FN_BASE`: short snake_case matching the HTML filename (e.g., `'fit_tol'`, `'oring'`, `'vdrop'`)

---

## Docs & Reference

- `README.md` — project overview and goals
- `CONTRIBUTING.md` — notes on CORS limitations (can't `readTextFile` locally without a server), browser compatibility
- `docs/` — PDFs explaining the physics/math models (rocker pod, adiabatic cylinder, belt geometry, beam FEA, pitchers, transmission, trajectory, general mechanism)
- `static/` — reference data sheets (tap charts, pipe sizes, speed charts, Unix commands)
