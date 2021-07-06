import {get}                    from 'svelte/store';
import {stations}               from './store';
import type {Tick, HM, Station} from './common';
import {Train}                  from './train';

export function inter_check (trains: Train[]): {"tick1": Tick, "tick2": Tick, "idx": number}[] {
    const dists = get(stations).map(x => x.dist);
    const ticks = trains
        .reduce((acc, x) => [...acc, ...(x.coords.map(y => y.t))], [])
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

export function in_check (trains: Train[], stations: Station[]): {"t1": Tick, "t2": Tick, "d": HM}[] {
    const dists = stations.map(x => x.dist);
    const ticks = trains
        .reduce((acc, x) => [...acc, ...(x.coords.map(y => y.t))], [])
        .sort()
        .filter((x, idx, arr) => (idx == arr.indexOf(x)));

    const in_count = Array(dists.length).fill(0).map(_ => Array(ticks.length).fill(0));

    trains.map(train => train.coords.map((x, idx, arr) => {
        if (idx == arr.length - 1)
            return;
        const xn = arr[idx + 1];
        ticks.map((t, idx2) => {
            in_count[Math.min(x.idx, xn.idx)][idx2] +=
                (x.c == "S")? (t >= x.t && t < xn.t):
                (x.c == "N")? (t == x.t):
                (x.c == "D")? (t == x.t): 0;
            });
        }));
    return in_count
        .reduce((acc_out, item, idx_out) => [...acc_out, ...item
            .reduce((acc_in, x, idx_in) => 
                (x > stations[idx_out].n_track_in)? 
                    [...acc_out, {"t1": ticks[idx_in], "t2": ticks[idx_in + 1], "d": dists[idx_out]}]: acc_in,
                [])], [])
}
