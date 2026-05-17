# Beam Calculator — Combined Loading (Axial + Bending + Torsion)

This note documents the combined-loading feature added to `beamcalc.html`. It
covers tension/compression and torsion alongside the original bending solve.
The PDF/LaTeX whitepaper (`docs/beam.*`) still describes the bending FEA only;
this Markdown file is the reference for the axial and torsion additions until
that document is revised.

## Model overview

For a prismatic, linearly elastic beam with a doubly-symmetric (or near-enough)
cross-section, the three load modes do not couple at the element level. The
calculator therefore runs **three independent 1-D finite-element solves** over
the same node mesh:

| Solve    | DOF / node            | Element stiffness                | Section property | Material |
|----------|-----------------------|----------------------------------|------------------|----------|
| Axial    | `u` (axial displ.)    | `(EA/L)·[[1,-1],[-1,1]]`         | `A`              | `E`      |
| Bending  | `q`, `θ`              | Hermitian 4×4 (unchanged)        | `I`, `rmax/rmin` | `E`      |
| Torsion  | `ψ` (twist angle)     | `(GJ/L)·[[1,-1],[-1,1]]`         | `J`, `rtors`     | `G`      |

The node mesh is the sorted set of load/constraint positions plus the two beam
ends. All three solves share that mesh, so their output channels share one `x`
axis and can be probed together at any queried position.

The axial and torsion solves only run when at least one DOF of that kind is
fixed somewhere. With no `X` constraint the structure is a free body in
tension, so the axial solve is skipped and reports zero (likewise torsion with
no `ψ` constraint). This avoids a singular stiffness matrix.

## Load points

There is no separate "load" versus "constraint" concept — every entry on the
beam is the same kind of object: a position plus a row for each of the four
components.

- `X` — lateral / axial displacement `u`
- `Y` — vertical / transverse displacement `q`
- `θ` — bending slope
- `ψ` — twist angle

Each component row has a **Fix** checkbox and two fixed-unit fields — a
**Displacement** field and a **Load** field. For any DOF you either know the
load and solve for the displacement, or know the displacement and solve for the
load; the Fix checkbox picks which:

- **Fix unchecked** — the **Load** field is your input (an applied
  force/moment); the **Displacement** field is read-only and reports the
  resulting nodal displacement.
- **Fix checked** — the **Displacement** field is your input (a prescribed
  displacement; blank or `0` = an ordinary fixed-to-zero support); the **Load**
  field is read-only and reports the reaction.

The two fields keep their units regardless of Fix state. Toggling Fix swaps
their input/output roles, so both are cleared on every toggle.

A **preset selector** is a pure convenience: picking a preset (Free Load,
Roller, Pinned, Bending Clamp, Fully Fixed, Axial Anchor, Torsional) stamps a
common Fix pattern onto the four checkboxes. Toggling any checkbox by hand
re-derives the matching preset, falling back to `Custom`. Because the Fix
checkboxes are independent, one entry can apply some loads while prescribing
displacements on other DOFs.

Prescribed displacements feed the FEA as imposed nodal values: the bending
solve uses the `displs`/`slopes` partition, the axial/torsion solve uses the
`prescribed` map passed to `computeFE1D` (a zero entry is just an ordinary
support). After solving, `computeFE` and `computeFE1D` return the full nodal
solution vector `Q` alongside the force vector `F` — so the calculator can
report a reaction (from `F`) for every fixed DOF and the resulting displacement
(from `Q`) for every free one.

## Cross-section torsion constant `J`

`J` is the Saint-Venant torsion constant. It is **exact only for round
sections**; other shapes use standard approximations and are flagged with a `*`
on the `J` label:

| Section        | `J`                                              | `rtors` (peak-shear lever) |
|----------------|--------------------------------------------------|----------------------------|
| Round bar/tube | `π/32 · (d⁴ − dᵢ⁴)` — exact                      | `d/2`                      |
| Solid rectangle| `β·hi·lo³`, `β = 1/3 − 0.21·r·(1 − r⁴/12)`        | `(3 + 1.8·lo/hi)·lo·β`     |
| Closed box tube| Bredt: `4·A_enc²·t / perimeter`                  | `2·A_enc / perimeter`      |
| Angle / channel| Open thin-wall: `⅓·Σ bᵢtᵢ³`                       | `t` (wall thickness)       |
| Hexagon        | `≈ 2·I` (polar moment, approximate)              | `rmax`                     |

`rtors` is chosen so that `τ_max = T · rtors / J` reproduces the section's
peak shear stress.

> **Open sections (angle, channel) are weak in torsion.** The `⅓Σbt³` value
> assumes free warping. If warping is restrained at a constraint, the real
> stiffness is much higher and these results are unconservative. Treat open
> sections in torsion as rough estimates only.

## Combined stress

At a queried position the calculator evaluates the stress state at three points
of the cross-section and reports principal stresses and a von Mises equivalent
via Mohr's circle:

- **Top fiber** — `σ = N/A − M·rmax/I`, `τ = T·rtors/J`
- **Bottom fiber** — `σ = N/A + M·rmin/I`, `τ = T·rtors/J`
- **Neutral axis** — `σ = N/A`, `τ = V/A + T·rtors/J`

For each point:

```
σ₁,σ₂ = σ/2 ± √((σ/2)² + τ²)
τ_max = √((σ/2)² + τ²)
σ_vM  = √(σ² + 3τ²)
```

The transverse shear term uses the average `V/A` (consistent with the existing
shear-stress query) rather than the exact `V·Q/(I·b)` distribution. The factor
of safety column is `Sy / σ_vM` using the material yield strength when the
database provides one; it shows `—` for materials with no `Sy` on file.

## Out of scope

- **Buckling.** The linear FEA does not detect column buckling. Results are
  unconservative for slender members in compression.
- **Distributed loads.** Only point loads/moments/forces/torques are supported.
- **Shear-center offset / bending–torsion coupling** for unsymmetric sections.
