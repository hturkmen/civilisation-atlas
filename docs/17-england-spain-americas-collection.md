# England, Spain and colonial source slice — 26 September 2026

The selected Cliopatria v0.2.0 archive (`ad28a691b7c07c1fca89d0e0636d324667d2a258`, archive SHA-256 `d01ae3a20d358cc5d54f69d9d725d390767d9c8759ac89ad6f90c58d106f3370`) adds **173 source rows across ten source identities**. The demo collection now contains **38 selected political entities / 562 boundary records**. The previous 389 records and their exported geometries were compared by ID and remain unchanged. This is still a selected, unreviewed interpretation, not worldwide coverage or historian approval.

| Source `Name` | Added | Decision and visible identity |
|---|---:|---|
| `Kingdom of England` | 28 | England; hold its 1645–1652 rows because the source separately names the Commonwealth. The source's 1706–1708 row is retained; this is a data label, not a claim about the constitutional transition. |
| `Kingdom of Scotland` | 6 | All source rows intersecting 1400–1750; source coverage ends in 1608. |
| `Commonwealth of England` | 4 | Source rows for 1645–1661, without also selecting England's overlapping 1645–1652 rows. |
| `Crown of Castile` | 13 | All source rows intersecting the period; includes source geometry outside Iberia in later rows. |
| `Crown of Aragon` | 15 | All source rows intersecting the period. |
| `Kingdom of Spain` | 32 | Source component of `(Spanish Empire)`; **no source rows 1582–1639** under this exact name. Do not fill the gap by interpolation. |
| `Spanish Empire` | 42 | Separately identified source component; label says “source component.” No parenthesised `(Spanish Empire)` aggregate is published. The component includes various territories beyond the Iberian kingdom and must not be described as a complete, year-exact colonial map. |
| `English Colonial Empire` | 23 | Rows through 1701; later source rows held to avoid overlap with the British component. Includes overseas areas beyond North America. |
| `Kingdom of Great Britain` | 1 | The source's 1709–1756 row. It is one row covering many years, not an annual observation. |
| `British Colonial Empire` | 9 | Rows beginning 1709; its 1706–1708 row is held while England is selected. No `(British Empire)` aggregate is published. |

The pinned source's `FromYear` and `ToYear` are inclusive row coverage. As in earlier slices, the import plan samples `max(1400, FromYear)` to select each row, preserves its **full original interval**, and does not turn the sample into a historical event. It simplifies existing polygons with the pinned tolerance; no polygons were drawn, repaired or interpolated. Attribution, version, adaptation and CC BY 4.0 licence remain in `data/boundary-import.json` and the generated collection.

## Explicit source gaps and held candidates

| State | Candidate or region | Reason / next evidence needed |
|---|---|---|
| Held: identity/overlap | `(Kingdom of England)`, `(Spanish Empire)`, `(British Empire)` | `Components` list already selected child rows. Publishing the aggregate would duplicate them. |
| Held: identity/overlap | `English Colonial Empire` 1702–1712 and 1713–1761; `British Colonial Empire` 1706–1708 | Their date ranges overlap the selected British/English components. The separate English 1713–1761 row is a small Asian remnant in the pinned source; it must not be called all English North America. Review source IDs and transition before adding. |
| Held: date/identity | `Iberian Union` 1582–1639 | It is not interchangeable with `Kingdom of Spain` and may overlap the already selected Portuguese component. The 1582–1639 Spanish kingdom gap remains visible. |
| Held: identity | `New Netherland` | Later rows extend to 1780 and the 1700 geometry is Caribbean rather than the earlier North American area. Resolve which named territories each row represents before inclusion. |
| Not separately represented | New Spain, Viceroyalty of Peru, individual British North American colonies, Portuguese Brazil | No matching independent rows were established in this batch. The Spanish/English/British source components have broader extents and must not be relabelled as these specific administrations. Seek independently dated, licensed geometry and claim-level locators for separate entities. |
| Not yet researched | Other European states and Indigenous American polities | Track by region × period in P02-005; absence from this selected layer is not historical absence. |

All added rows retain the existing source-wide uncertainty statement and **unreviewed** status. A provisional boundary needs a pinned source row, matching identity, interval, geometry, locator and known rights; a provisional context paragraph additionally needs a claim-level source and a visible general-context caveat. A name or narrative source alone never licenses an invented boundary. Contradictory dates, uncertain component identity, invalid geometry or uncertain rights are held with a reason. No independent historian review or editorial approval was performed.

Spot checks on derived geometries found no area intersection at 1700 between the selected Spain/Spanish Empire components or English colony/New France components, and none at 1750 between Great Britain/British colony components. Small intersections do occur for Castile/Aragon at 1500 (0.00129 square degrees) and British colony/New France at 1750 (0.00782 square degrees) in simplified geometry; these remain historical/cartographic review items, not proof of an error or a repaired border. The check is limited to these pairs and years.

## Verification and next work

- Import: 38 political entities / 562 records / 5,033,000 GeoJSON bytes; all selected source and derived geometries valid.
- Previous 389 metadata and geometry objects compared equal by source record ID.
- `node scripts/validate-boundaries.mjs` and 55 domain tests passed. The 1500 snapshot now has 15 selected areas, 1700 has 14, and 1750 has 13; these are collection counts, not worldwide totals.
- Independent historian review, complete region/period coverage, physical-device network/GPU measurement and the remaining source-identity questions are open. Further growth should assess bbox/tile loading; 5 MB of raw GeoJSON is not a measured mobile performance result.

Next data slice: resolve the held British/Spanish transition rows and investigate separately sourced Indigenous American and colonial administrations, recording unavailable versus unresearched coverage explicitly. Keep P02-006 and P02-005 open.
