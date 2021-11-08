import {get}                    from 'svelte/store';
import {stations, train_types}  from './store';
import type {Tick, HM, Control, Station} from './common';

export class Train {
    type:        number;
    dep_s: number;
    arr_s: number;
    direction:   boolean; // True: follow the line info
    stops:       boolean[];

    dep_t:       Tick
    stop_t:      Tick[];

    name:      string;
    type_name: string;
    color:     string;
    coords:    {"t": Tick, "d": HM, "c": Control, "idx": number}[];

    constructor (name:   string,
                 type:   number,
                 dep_s:  number,
                 arr_s:  number,
                 dep_t:  Tick,
                 stop_t: Tick[]) {
        this.name      = name;
        this.type      = type;
        this.type_name = get(train_types)[type].name;
        this.dep_s     = dep_s;
        this.arr_s     = arr_s;
        this.direction = dep_s < arr_s? true: false;
        this.dep_t     = dep_t;
        this.stops     = stop_t.map((t, idx) => t != 0 || idx == dep_s || idx == arr_s);
        this.stop_t    = stop_t.map((t, idx) => {
            const min_stop_t = get(train_types)[type].stop_t[idx];
            return t == 0? 0: t < min_stop_t? min_stop_t: t;
        });

        this.color        = get(train_types)[type].color;
        this.compute_coords();
    }

    extract (): any {
        return {"name":   this.name,
                "type":   this.type,
                "dep_s":  this.dep_s,
                "arr_s":  this.arr_s,
                "dep_t":  this.dep_t,
                "stop_t": this.stop_t.map((x, idx) => this.stops[idx]? x: 0}
    }

    flip_stop(idx: number):void {
        this.stops[idx] = !this.stops[idx];
        this.compute_coords();
    }

    set_time(idx: number, delta: Tick): void {
        if (idx == this.dep_s)
            this.dep_t += delta;
        else {
            if (this.stop_t[idx] + delta >= get(train_types)[this.type].stop_t[idx])
                this.stop_t[idx] += delta;
            else
                this.stop_t[idx] = get(train_types)[this.type].stop_t[idx];
        }
        this.compute_coords();
    }

    in_station(tick: Tick): Station | "Nothing" {
        let station_idx = -1;
        this.coords.slice(0, -1).map((coord1, idx) => {
            const coord2 = this.coords[idx + 1];
            if (coord1.t > tick || coord2.t < tick)
                return;
            if (coord1.t == tick)
                station_idx = coord1.idx;
            if (coord2.t == tick && coord2.c == "S")
                station_idx = coord2.idx;
            if (coord1.t < tick && coord2.t > tick && coord1.c == "S")
                station_idx = coord1.idx;
        })
        if (station_idx >= 0)
            return get(stations)[station_idx];
        else
            return "Nothing";
    }

    // From S station + D HM, do not need to parse direction
    inter_station(tick: Tick): {"S": Station, "D": HM} | "Nothing" {
        if (this.in_station(tick) != "Nothing")
            return "Nothing";
        let station_idx = -1;
        let dist        = 0;
        this.coords.slice(0, -1).map((coord1, idx) => {
            const coord2 = this.coords[idx + 1];
            if (coord1.t > tick || coord2.t < tick)
                return;
            station_idx = this.direction? coord1.idx: coord2.idx;
            if ( this.stops[coord1.idx] &&  this.stops[coord2.idx])
                dist = (tick - coord1.t) * get(train_types)[this.type].speed_ss[station_idx];
            if (!this.stops[coord1.idx] &&  this.stops[coord2.idx])
                dist = (tick - coord1.t) * get(train_types)[this.type].speed_ps[station_idx];
            if ( this.stops[coord1.idx] && !this.stops[coord2.idx])
                dist = (tick - coord1.t) * get(train_types)[this.type].speed_sp[station_idx];
            if (!this.stops[coord1.idx] && !this.stops[coord2.idx])
                dist = (tick - coord1.t) * get(train_types)[this.type].speed_pp[station_idx];
            if (!this.direction)
                dist = coord1.d - coord2.d - dist;
        })
        if (station_idx >= 0)
            return {"S": get(stations)[station_idx], "D": dist};
        else
            return "Nothing";
    }

    compute_coords(): void {
        this.coords       = [];
        let tick_count    = this.dep_t;
        const coords_push = (idx: number, c: Control) => this.coords.push({"t": tick_count, "d": get(stations)[idx].dist, "c": c, "idx": idx});

        if (this.direction) {
            for (let idx = this.dep_s; idx < this.arr_s; ++idx) {
                // Stop time
                if (idx == this.dep_s)
                    coords_push(idx, "D");
                else if (this.stops[idx]) {
                    tick_count += this.stop_t[idx];
                    coords_push(idx, "T");
                }
                // Btw time
                let speed: number;
                if (this.stops[idx] && this.stops[idx + 1])
                    speed = get(train_types)[this.type].speed_ss[idx];
                else if ( this.stops[idx] && !this.stops[idx + 1])
                    speed = get(train_types)[this.type].speed_sp[idx];
                else if (!this.stops[idx] &&  this.stops[idx + 1])
                    speed = get(train_types)[this.type].speed_ps[idx];
                else
                    speed = get(train_types)[this.type].speed_pp[idx];
                tick_count += Math.round((get(stations)[idx + 1].dist - get(stations)[idx].dist) / speed);
                coords_push(idx + 1, this.stops[idx + 1]? "S": "N");
            }
        }
        else {
            for (let idx = this.dep_s; idx > this.arr_s; --idx) {
                // Stop time
                if (idx == this.dep_s)
                    coords_push(idx, "D");
                else if (this.stops[idx]) {
                    tick_count += this.stop_t[idx];
                    coords_push(idx, "T");
                }
                // Btw time
                let speed: number;
                if (this.stops[idx] && this.stops[idx - 1])
                    speed = get(train_types)[this.type].speed_ss[idx - 1];
                else if ( this.stops[idx] && !this.stops[idx - 1])
                    speed = get(train_types)[this.type].speed_sp[idx - 1];
                else if (!this.stops[idx] &&  this.stops[idx - 1])
                    speed = get(train_types)[this.type].speed_ps[idx - 1];
                else
                    speed = get(train_types)[this.type].speed_pp[idx - 1];
                tick_count += Math.round((get(stations)[idx].dist - get(stations)[idx - 1].dist) / speed);
                coords_push(idx - 1, this.stops[idx - 1]? "S": "N");
            }
        }
    }
}
