import { readable } from 'svelte/store';
import type {Line} from "./common";

export const line_info = readable({"name": "", "stations": []}, async function start(set){
    let res        = await fetch('line_info.json');
    let info: Line = await res.json();

    set(info);
	return function stop() {};
});
