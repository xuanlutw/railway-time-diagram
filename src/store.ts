import { readable, writable, derived } from 'svelte/store';
import type {Tick, HM, Line, Focus}    from "./common";
import { Train }                       from './train';
import { inter_check, in_check }       from './check';

// Const Meta Infos
const line_info = readable({"name": "", "stations": [], "train_types": []} as Line, async function start(set){
    let res        = await fetch('line_info.json');
    let info: Line = await res.json();

    set(info);
	return function stop() {};
});

export const line_name = derived(
	line_info,
	$line_info => $line_info.name
);

export const stations = derived(
	line_info,
	$line_info => $line_info.stations
);

export const train_types = derived(
	line_info,
	$line_info => $line_info.train_types
);

// Train Infos
export const trains     = writable(<Train[]>[]);
export const focus_idx  = writable(0);
export const focus_type = writable(<Focus>"D");

// Window Infos
export const tick_range = writable(<Tick[]>[1200, 1680]);
export const view_tick  = derived(
	tick_range,
	$tick_range => $tick_range[0]
);
export const view_hm   = writable(<HM>-10);

// Conflict Infos
export const inter_conflict = derived(
	trains,
	$trains => []
	//$trains => inter_check($trains)
);

export const in_conflict = derived([trains, stations], ([a, b]) => in_check(a, b));
