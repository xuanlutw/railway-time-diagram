import { readable, writable, derived } from 'svelte/store';
import type {Line}                     from "./common";
import { Train }                       from './train';

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
export const trains = writable([] as Train[]);
