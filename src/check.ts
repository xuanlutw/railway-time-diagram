import type {Tick, HM, Station} from './common';
import {Train}                  from './train';

function get_ticks (trains: Train[]) {
    return trains
        .reduce((acc, x) => [...acc, ...(x.coords.map(y => y.t))], [])
        .sort()
        .filter((x, idx, arr) => (idx == arr.indexOf(x)));
}

function inter_check_single (trains: Train[], station1: Station, station2: Station): {"t1": Tick, "t2": Tick, "d1": HM, "d2": HM}[] {
    console.log(trains.length)
    const tick_i = Array(trains.length).fill(-1);
    const tick_o = Array(trains.length).fill(-1);
    const conflicts = [];
    
    // Compute in and out ticks
    trains.map((item, idx) => item.coords.map(x => {
        if (item.direction) {
            if (x.d == station1.dist && ((x.c == "D") || (x.c == "T") || (x.c == "N")))
                tick_i[idx] = x.t;
            if (x.d == station2.dist && ((x.c == "S") || (x.c == "N")))
                tick_o[idx] = x.t;
        }
        else {
            if (x.d == station2.dist && ((x.c == "D") || (x.c == "T") || (x.c == "N")))
                tick_i[idx] = x.t;
            if (x.d == station1.dist && ((x.c == "S") || (x.c == "N")))
                tick_o[idx] = x.t;
        }
    }));

    console.log(station1.name, tick_i, tick_o);

    // Check conditions
    trains.map((_, idx1) => trains.map((_, idx2) => {
        if (idx1 <= idx2)
            return;
        // Not in this track
        if (tick_i[idx1] == -1 || tick_i[idx2] == -1 || tick_o[idx1] == -1 || tick_o[idx2] == -1)
            return;
        if (trains[idx1].direction == trains[idx2].direction) {
            const case1 = (tick_i[idx1] >= tick_i[idx2] + station1.interval_cis) && 
                          (tick_o[idx1] >= tick_o[idx2] + station1.interval_cis);
            const case2 = (tick_i[idx2] >= tick_i[idx1] + station1.interval_cis) && 
                          (tick_o[idx2] >= tick_o[idx1] + station1.interval_cis);
            if (!case1 && !case2)
                conflicts.push({"t1": Math.max(tick_i[idx1], tick_i[idx2]),
                                "t2": Math.min(tick_o[idx1], tick_o[idx2]),
                                "d1": station1.dist, "d2": station2.dist});
        }
        if (trains[idx1].direction != trains[idx2].direction) {
            const case1 = (tick_i[idx1] >= tick_o[idx2] + station1.interval_trans);
            const case2 = (tick_i[idx2] >= tick_o[idx1] + station1.interval_trans);
            if (!case1 && !case2)
                conflicts.push({"t1": Math.max(tick_i[idx1], tick_i[idx2]),
                                "t2": Math.min(tick_o[idx1], tick_o[idx2]),
                                "d1": station1.dist, "d2": station2.dist});
        }
    }));
    return conflicts;
}

export function inter_check (trains: Train[], stations: Station[]): {"t1": Tick, "t2": Tick, "d1": HM, "d2": HM}[] {
    return stations.reduce((acc, x, idx) => {
        if (idx == stations.length - 1)
            return acc;
        else if (x.n_track_inter == 1)
            return [...acc, ...inter_check_single(trains, x, stations[idx + 1])];
        else
            return acc;
    }, []);
}

function in_check_station (trains: Train[], station: Station): {"t1": Tick, "t2": Tick, "d": HM}[] {
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
    return stations.reduce((acc, x) => [...acc, ...in_check_station(trains, x)], []);
}
