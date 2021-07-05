import {get}                                                        from 'svelte/store';
import {stations, train_types, trains, focus_train_num, tick_range} from './store';
import type {Tick, HM, Control}                                     from './common';
import {Train}                                                      from './train';

export function inter_check (trains: Train[]): {"tick1": Tick, "tick2": Tick, "idx": number}[] {
    const dists = get(stations).map(x => x.dist);
    const ticks = trains
        .map(x => x.coords.map(y => y.t))
        .reduce((acc, x) => [...acc, ...x], [])
        .sort()
        .filter((x, idx, arr) => (idx == arr.indexOf(x)));

    let inter_count = Array(dists.length).fill(0)
        .map(_ => Array(ticks.length).fill(0));

    trains.map(train => train.coords.map((x, idx, arr) => {
        if (idx == arr.length - 1)
            return;
        const xn = arr[idx + 1];
        if (x.c == "D" || x.c == "T" || x.c == "N") {
            ticks.map((t, idx2) => {
                if (t >= x.t && t < xn.t)
                    inter_count[Math.min(x.idx, xn.idx)][idx2] += 1;
            });
        }
    }));
    return inter_count
        .map((item, idx) => item
            .reduce((acc, x, idx2) => 
                (x > get(stations)[idx].n_track_to)? 
                    [...acc, {"tick1": ticks[idx2], "tick2": ticks[idx2 + 1], "idx": idx}]: acc, []))
        .reduce((acc, x) => [...acc, ...x], []);
}

export function in_check (trains: Train[]): {"tick1": Tick, "tick2": Tick, "idx": number}[] {
    const dists = get(stations).map(x => x.dist);
    const ticks = trains
        .map(x => x.coords.map(y => y.t))
        .reduce((acc, x) => [...acc, ...x], [])
        .sort()
        .filter((x, idx, arr) => (idx == arr.indexOf(x)));

    let in_count = Array(dists.length).fill(0)
        .map(_ => Array(ticks.length).fill(0));

    trains.map(train => train.coords.map((x, idx, arr) => {
        if (idx == arr.length - 1)
            return;
        const xn = arr[idx + 1];
        if (x.c == "S") {
            ticks.map((t, idx2) => {
                if (t >= x.t && t < xn.t)
                    in_count[Math.min(x.idx, xn.idx)][idx2] += 1;
            });
        }
    }));
    return in_count
        .map((item, idx) => item
            .reduce((acc, x, idx2) => 
                (x > get(stations)[idx].n_track_in)? 
                    [...acc, {"tick1": ticks[idx2], "tick2": ticks[idx2 + 1], "idx": idx}]: acc, []))
        .reduce((acc, x) => [...acc, ...x], []);
}
