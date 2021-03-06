// Tick is the time quant in this project, 1 Tick = 15 second.
// All variable with type Tick should be integer
export type Tick = number;

export function tick2sec (tick: Tick): string {
    return ((tick % 4) * 15).toString().padStart(2, "0");
};
export function tick2min (tick: Tick): string {
    return (((tick % 240) - (tick % 4)) / 4).toString().padStart(2, "0");
};

export function tick2hr (tick: Tick): string {
    return ((tick - (tick % 240)) / 240).toString().padStart(2, "0");
};

// HM is the length quant in this project, 1 HM = 100 meter.
// All variable with type HM should be integer
export type HM = number;

// Station
export type Station = {
    name:           string,
    idx:            number,
    dist:           HM,
    n_track_in:     number,
    n_track_inter:  number,
    interval_cis:   Tick,
    interval_trans: Tick
};

// Train_type
export type Train_type = {
    name:     string,
    color:    string,
    speed_pp: number[], // Pass and Stop, 4.16 HM/tick = 100 kmh
    speed_ps: number[], // Pass and Stop
    speed_sp: number[], // Pass and Stop
    speed_ss: number[], // Pass and Stop
    stop_t:   number[]
}

export type Line = {
    name:        string,
    module_name: string,
    stations:    Station[],
    train_types: Train_type[]
}

// Departure
// stop Time
// Stop
// Non-stop
// Control
export type Control = "D"| "T"| "C"| "S"| "N";
// Disable
// Highlight only
// Modify
export type Focus   = "D"| "H"| "M";
