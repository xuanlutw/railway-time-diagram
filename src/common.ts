// Tick is the time quant in this project, 1 Tick = 15 second.
// All variable with type Tick should be integer
export type Tick = number;

export function tick2min (tick: Tick): number {
    return ((tick % 240) - (tick % 4)) / 4
};

export function tick2hr (tick: Tick): number {
    return (tick - (tick % 240)) / 240
};

// HM is the length quant in this project, 1 HM = 100 meter.
// All variable with type HM should be integer
export type HM = number;

// Station
export type Station = {
    name:       string,
    distance:   HM,
    n_track_in: number,
    n_track_to: number
};

export type Line = {
    name:     string,
    stations: Station[]
}
