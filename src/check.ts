import type {Tick, HM, Station} from './common';
import {Train}                  from './train';

export function get_ticks (trains: Train[]): Tick[] {
    return trains
        .reduce((acc, x) => [...acc, ...(x.coords.map(y => y.t))], [])
        .sort()
        .filter((x, idx, arr) => (idx == arr.indexOf(x)));
}

function comp_io_tick (trains: Train[], d1: HM, d2: HM): {"tick_i": Tick[], "tick_o": Tick[]} {
    const tick_i: Tick[] = Array(trains.length).fill(-1);
    const tick_o: Tick[] = Array(trains.length).fill(-1);
    trains.map((item, idx) => item.coords.map(x => {
        if (item.direction) {
            if (x.d == d1 && ((x.c == "D") || (x.c == "T") || (x.c == "N")))
                tick_i[idx] = x.t;
            if (x.d == d2 && ((x.c == "S") || (x.c == "N")))
                tick_o[idx] = x.t;
        }
        else {
            if (x.d == d2 && ((x.c == "D") || (x.c == "T") || (x.c == "N")))
                tick_i[idx] = x.t;
            if (x.d == d1 && ((x.c == "S") || (x.c == "N")))
                tick_o[idx] = x.t;
        }
    }));
    return {"tick_i": tick_i, "tick_o": tick_o};
}

// This function compute all bi-single pair
function comp_bi_single (trains: Train[], tick_i: Tick[], tick_o: Tick[], interval_cis: number, direction: boolean): {"bis_tick_i": Tick[], "bis_tick_o": Tick[], "bis_edge": (number[])[]} {
    const bis_tick_i = [];
    const bis_tick_o = [];
    const bis_edge   = Array(trains.length).fill(0).map(_ => []);
    trains.map((_, idx1) => trains.map((_, idx2) => {
        if (idx1 <= idx2 || !trains[idx1].direction == direction || !trains[idx2].direction == direction)
            return;
        // Not in this track
        if (tick_i[idx1] == -1 || tick_i[idx2] == -1 || tick_o[idx1] == -1 || tick_o[idx2] == -1)
            return;
        const case1 = (tick_i[idx1] >= tick_i[idx2] + interval_cis) && 
                      (tick_o[idx1] >= tick_o[idx2] + interval_cis);
        const case2 = (tick_i[idx2] >= tick_i[idx1] + interval_cis) && 
                      (tick_o[idx2] >= tick_o[idx1] + interval_cis);
        if (!case1 && !case2) {
            bis_tick_i.push(Math.max(tick_i[idx1], tick_i[idx2]));
            bis_tick_o.push(Math.min(tick_o[idx1], tick_o[idx2]));
            bis_edge[idx1].push(idx2);
            bis_edge[idx2].push(idx1);
        }
    }));
    return {"bis_tick_i": bis_tick_i, "bis_tick_o": bis_tick_o, "bis_edge": bis_edge};
}

// This function check whether bi-single pair is bipart graph.
function check_bi_signle_bipart (bis_edge: number[][]): {"conflict": {"idx1": number, "idx2": number}[], "color": number[]} {
    const color = Array(bis_edge.length).fill(-1);
    const color_it = (idx: number, c: number) => {
        if (color[idx] != -1)
            return;
        color[idx] = c;
        bis_edge[idx].map(x => color_it(x, c == 1? 0: 1));
    }
    const conflicts = [];
    color.map((_, idx) => color_it(idx, 0));

    color.map((x, idx1) => bis_edge[idx1].map(idx2 => {
        if (idx1 <= idx2)
            return
        if (x == color[idx2])
            conflicts.push({"idx1": idx1, "idx2": idx2});
    }));
    return {"conflict": conflicts,
            "color": color};
}

// This function check the reverse train in the bi-single interval
function check_bi_signle_exclusive (trains: Train[], tick_i: Tick[], tick_o: Tick[], bis_tick_i: Tick[], bis_tick_o: Tick[], direction: boolean, interval_trans: number): {"t1": Tick, "t2": Tick}[] {
    const conflicts = [];
    trains.map((item, idx1) => bis_tick_i.map((_, idx2) => {
        if (tick_i[idx1] == -1 || bis_tick_i[idx2] == -1 || tick_o[idx1] == -1 || bis_tick_o[idx2] == -1)
            return;
        if (item.direction == direction)
            return;
        const case1 = (tick_i[idx1] >= bis_tick_o[idx2] + interval_trans);
        const case2 = (bis_tick_i[idx2] >= tick_o[idx1] + interval_trans);
        if (!case1 && !case2)
            conflicts.push({"t1": Math.max(tick_i[idx1], bis_tick_i[idx2]),
                            "t2": Math.min(tick_o[idx1], bis_tick_o[idx2])});
    }));
    return conflicts;
}

// Follow the direction prefer 0
function inter_check_double (trains: Train[], station1: Station, station2: Station): {"conflict": {"t1": Tick, "t2": Tick, "s1": Station, "s2": Station}[], "track": number[]} {
    const conflicts = [];
    let   track     = Array(trains.length).fill(0);
    
    // Compute in and out ticks
    const {"tick_i": tick_i, "tick_o": tick_o} = comp_io_tick(trains, station1.dist, station2.dist);

    // Compute bi-single interval
    [true, false].map(direct => {
        const {"bis_tick_i": bis_tick_i,
               "bis_tick_o": bis_tick_o,
               "bis_edge": bis_edge} = comp_bi_single(trains, tick_i, tick_o, station1.interval_cis, direct);
        const {"conflict": conflict_pre,
               "color": color} = check_bi_signle_bipart(bis_edge);
        conflict_pre.map(({"idx1": idx1, "idx2": idx2}) => 
            conflicts.push({"t1": Math.max(tick_i[idx1], tick_i[idx2]),
                            "t2": Math.min(tick_o[idx1], tick_o[idx2]),
                            "s1": station1, "s2": station2}));
        track = track.map((x, idx) => (trains[idx].direction == direct)? (direct? color[idx]: (1 - color[idx])): x);
        const conflict_pre_extra = check_bi_signle_exclusive(trains, tick_i, tick_o, bis_tick_i, bis_tick_o, direct, station1.interval_trans);
        conflict_pre_extra.map(({"t1": t1, "t2": t2}) => 
            conflicts.push({"t1": t1, "t2": t2, 
                            "s1": station1, "s2": station2}));
    });
    return {"conflict": conflicts,
            "track": track};
}

function inter_check_single (trains: Train[], station1: Station, station2: Station): {"t1": Tick, "t2": Tick, "s1": Station, "s2": Station}[] {
    const conflicts = [];
    
    // Compute in and out ticks
    const {"tick_i": tick_i, "tick_o": tick_o} = comp_io_tick(trains, station1.dist, station2.dist);

    // Check conditions
    trains.map((_, idx1) => trains.map((_, idx2) => {
        if (idx1 <= idx2)
            return;
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
                                "s1": station1, "s2": station2});
        }
        if (trains[idx1].direction != trains[idx2].direction) {
            const case1 = (tick_i[idx1] >= tick_o[idx2] + station1.interval_trans);
            const case2 = (tick_i[idx2] >= tick_o[idx1] + station1.interval_trans);
            if (!case1 && !case2)
                conflicts.push({"t1": Math.max(tick_i[idx1], tick_i[idx2]),
                                "t2": Math.min(tick_o[idx1], tick_o[idx2]),
                                "s1": station1, "s2": station2});
        }
    }));
    return conflicts;
}

export function comp_inter_conflict (trains: Train[], stations: Station[]): {"t1": Tick, "t2": Tick, "s1": Station, "s2": Station}[] {
    if (trains.length <= 1)
        return [];
    return stations.slice(0, -1).reduce((acc, s) => {
        if (s.n_track_inter == 1)
            return [...acc, ...inter_check_single(trains, s, stations[s.idx + 1])];
        else {
            const {"conflict": conflict} = inter_check_double(trains, s, stations[s.idx + 1]);
            return [...acc, ...conflict];
        }
    }, []);
}

export function comp_inter_track (trains: Train[], stations: Station[]): number[][] {
    if (trains.length <= 1)
        return [];
    return stations.slice(0, -1).map(s => {
        if (s.n_track_inter == 1)
            return Array(Train.length).fill(0);
        else {                       
            const {"track": track} = inter_check_double(trains, s, stations[s.idx + 1]);
            return track;
        }
    });
}

// In station check
function comp_in_check_pre_station (ticks: Tick[], trains: Train[], station: Station): number[][] {
    let count = Array(ticks.length).fill(0).map(_ => Array(0));

    // Collect relation
    trains.map((train, train_idx) => {
        train.coords.map((x, idx) => {
            if (x.d != station.dist)
                return;
            else if ((x.c == "N") || (x.c == "D") || (x.c == "S" && idx == train.coords.length - 1))
                count[ticks.indexOf(x.t)].push(train_idx);
            else if (x.c == "S") {
                const xn = train.coords[idx + 1];
                ticks.map((t, idx2) => {
                    if (t >= x.t && t <= xn.t)
                        count[idx2].push(train_idx);
                })
            }
        })
    });
    return count;
}

function comp_in_conflict_station (ticks: Tick[], count: number[][], station: Station): {"t1": Tick, "t2": Tick, "s": Station}[] {
    // Check Conflict 
    return count.reduce((acc, x, idx) => 
        (x.length <= station.n_track_in)? acc:
        [...acc, {"t1": ticks[idx], "t2": ticks[idx + 1], "s": station}],
        <{"t1": Tick, "t2": Tick, "s": Station}[]>[]);
}

export function comp_in_conflict (trains: Train[], stations: Station[]): {"t1": Tick, "t2": Tick, "s": Station}[] {
    const ticks = get_ticks(trains)
    const conflicts = stations.map(station => {
        const count = comp_in_check_pre_station(ticks, trains, station);
        return comp_in_conflict_station(ticks, count, station);
    });
    return conflicts.reduce((acc, x) => [...acc, ...x], []);
}

// Follow the direction prefer 0
function comp_in_track_station (ticks: Tick[], trains: Train[], count: number[][], station: Station): number[] {
    let track = Array(trains.length).fill(-1);
    // Assign Track
    const diff = (arr1, arr2) => arr1.filter(x => !arr2.includes(x));
    count.map(trains_in_idx => {
        trains_in_idx.map((idx, n) => {
            if (track[idx] != -1)                               // Already assign
                return;
            const track_assigned = trains_in_idx.map(x => track[x]).filter(x => x != -1);
            if (track_assigned.length == station.n_track_in)    // No need assign conflic train
                return;
            const remain_track = diff([...Array(station.n_track_in).keys()], track_assigned);
            const prefer_track = remain_track.filter(x => x % 2 == (trains[idx].direction? 0: 1))
            if (prefer_track.length > 0)
                track[idx] = prefer_track[0];
            else
                track[idx] = remain_track[0];
        })
    });
    track = track.map((x, idx) => (x == -1)? (trains[idx].direction? 0: 1): x); // If x has no track, i.e., conflict, assign it to default.
    return track;
}

export function comp_in_track (trains: Train[], stations: Station[]): number[][] {
    const ticks = get_ticks(trains)
    const track = stations.map(station => {
        const count = comp_in_check_pre_station(ticks, trains, station);
        return comp_in_track_station(ticks, trains, count, station);
    });
    return track;
}
