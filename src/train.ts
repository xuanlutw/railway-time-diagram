import {get}                    from 'svelte/store';
import {stations, train_types}  from './store';
import type {Tick, HM, Control} from './common';

export class Train {
    private type:        number;
    private dep_station: number;
    private arr_station: number;
    private direction:   boolean; // True: follow the line info
    private stops:       boolean[];

    private dep_t:       Tick
    private stop_t:      Tick[];

    color:  string;
    coords: {"t": Tick, "d": HM, "c": Control, "idx": number}[];

    constructor (type:        number,
                 dep_station: number,
                 arr_station: number,
                 stops:       boolean[],
                 dep_t:       Tick) {
        this.type        = type;
        this.dep_station = dep_station;
        this.arr_station = arr_station;
        this.direction   = dep_station < arr_station? true: false;
        this.stops       = stops;
        this.stops[dep_station] = true;
        this.stops[arr_station] = true;
        this.dep_t       = dep_t;
        this.stop_t      = get(train_types)[type].stop_t;

        this.color       = get(train_types)[type].color;
        this.compute_coords();
    }

    flip_stop(idx: number):void {
        this.stops[idx] = !this.stops[idx];
        this.compute_coords();
    }

    compute_coords(): void {
        this.coords       = [];
        let tick_count    = this.dep_t;
        const coords_push = (idx: number, c: Control) => this.coords.push({"t": tick_count, "d": get(stations)[idx].dist, "c": c, "idx": idx});

        if (this.direction) {
            for (let idx = this.dep_station; idx < this.arr_station; ++idx) {
                // Stop time
                if (idx == this.dep_station)
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
                tick_count += (get(stations)[idx + 1].dist - get(stations)[idx].dist) / speed;
                coords_push(idx + 1, this.stops[idx]? "S": "N");
            }
        }
        else {
            for (let idx = this.dep_station; idx > this.arr_station; --idx) {
                // Stop time
                if (idx == this.dep_station)
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
                tick_count += (get(stations)[idx].dist - get(stations)[idx - 1].dist) / speed;
                coords_push(idx - 1, this.stops[idx]? "S": "N");
            }
        }
    }
}