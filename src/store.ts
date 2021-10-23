import { readable, writable, derived } from 'svelte/store';
import type {Tick, HM, Line, Focus}    from "./common";
import { Train }                       from './train';
import { inter_check, in_check }       from './check';

// Train Infos
export const trains     = writable(<Train[]>[]);
export const focus_idx  = writable(0);
export const focus_type = writable(<Focus>"D");

// Meta Infos
const line_info = readable(<Line>{"name": "", "stations": [], "train_types": []}, async function start(set){
    let res  = await fetch('line_info.json');
    let info = await res.json();
    set(info);

    let rest  = await fetch('train_info.json');
    let infot = await rest.json();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('train_info')) {
        infot = JSON.parse(atob(urlParams.get('train_info')))
        console.log(infot)
    }
    trains.update(x => {
        infot.map(t => x.push(new Train(t.name, t.type, t.dep_s, t.arr_s, t.dep_t, t.stop_t)));
        return x})
	return function stop() {};
});
export const line_name   = derived(line_info, x => x.name);
export const stations    = derived(line_info, x => x.stations);
export const train_types = derived(line_info, x => x.train_types);

// Window Infos
export const tick_range = writable(<Tick[]>[1200, 1680]);
export const view_tick  = derived(tick_range, x => x[0]);
export const view_hm    = writable(<HM>-10);

// Conflict Infos
export const inter_conflict = derived([trains, stations], ([a, b]) => inter_check(a, b));
export const    in_conflict = derived([trains, stations], ([a, b]) =>    in_check(a, b));
