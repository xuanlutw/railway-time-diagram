import {get}                    from 'svelte/store';
import {stations}               from './store';
import type {Tick, HM, Station} from './common';
import {Train}                  from './train';

function get_ticks (trains: Train[]) {
    return trains
        .reduce((acc, x) => [...acc, ...(x.coords.map(y => y.t))], [])
        .sort()
        .filter((x, idx, arr) => (idx == arr.indexOf(x)));
}

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

function in_check_single (trains: Train[], station: Station): {"t1": Tick, "t2": Tick, "d": HM}[] {
    const ticks = get_ticks(trains);
    const count = Array(ticks.length).fill(0);

    trains.map(train => train.coords.map((x, idx, arr) => {
        if (x.d != station.dist)
            return;
        else if ((x.c == "N") || (x.c == "D") || (x.c == "S" && idx == arr.length - 1)) {
            count[ticks.indexOf(x.t)] += 1;
        }
        else if (x.c == "S") {
            const xn = arr[idx + 1];
            ticks.map((t, idx2) => count[idx2] += (t >= x.t && t < xn.t));
        }
    }));

    return count.reduce((acc, x, idx) => 
        (x <= station.n_track_in)? acc: [...acc, {"t1": ticks[idx], "t2": ticks[idx + 1], "d": station.dist}], []);
}

export function in_check (trains: Train[], stations: Station[]): {"t1": Tick, "t2": Tick, "d": HM}[] {
    return stations.reduce((acc, x) => [...acc, ...in_check_single(trains, x)], []);
}
