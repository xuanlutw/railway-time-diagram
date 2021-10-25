import { readable, writable, derived }           from 'svelte/store';
import type {Tick, HM, Line, Focus}              from "./common";
import { Train }                                 from './train';
import { comp_in_conflict, comp_in_track }       from './check';
import { comp_inter_conflict, comp_inter_track } from './check';

// Train Infos
export const trains     = writable(<Train[]>[]);
export const focus_idx  = writable(0);
export const focus_type = writable(<Focus>"D");

// Meta Infos
const line_info = readable(<Line>{"name": "", "stations": [], "train_types": []}, async function start(set){
    const urlParams   = new URLSearchParams(window.location.search);
    const module_name = urlParams.has('module')? urlParams.get('module'): ""

    let res  = await fetch("line_info_" + module_name + ".json");
    let info = await res.json();
    info.module_name = module_name;
    info.stations.map((x, idx) => x.idx = idx);
    set(info);

    let rest  = await fetch("train_info_" + module_name + ".json");
    let infot = await rest.json();
    if (urlParams.has('show_item') && urlParams.get('show_item') == "simu")
        show_item.update(x => false);
    if (urlParams.has('train_info'))
        infot = JSON.parse(atob(urlParams.get('train_info')))
    trains.update(x => {
        infot.map(t => x.push(new Train(t.name, t.type, t.dep_s, t.arr_s, t.dep_t, t.stop_t)));
        return x})
	return function stop() {};
});
export const line_name   = derived(line_info, x => x.name);
export const module_name = derived(line_info, x => x.module_name);
export const stations    = derived(line_info, x => x.stations);
export const train_types = derived(line_info, x => x.train_types);

// Window Infos
export const show_item  = writable(true); // true: time diagram, false: simulation
// For diagram
export const tick_range = writable(<Tick[]>[1200, 1680]);
export const view_tick  = derived(tick_range, x => x[0]);
export const view_hm    = writable(<HM>-10);
// For simulator
export const tick_simu  = writable(<Tick[]>[1200]);

// Conflict Infos
export const inter_conflict = derived([trains, stations], ([a, b]) => comp_inter_conflict(a, b));
export const inter_track    = derived([trains, stations], ([a, b]) => comp_inter_track(a, b));
export const in_conflict    = derived([trains, stations], ([a, b]) => comp_in_conflict(a, b));
export const in_track       = derived([trains, stations], ([a, b]) => comp_in_track(a, b));
