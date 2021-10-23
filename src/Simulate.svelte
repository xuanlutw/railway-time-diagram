<script lang="ts">
    import {tick2sec, tick2min, tick2hr}                         from './common';
    import type {Tick, HM, Control}                              from './common';
    import {stations, trains, focus_idx, focus_type, tick_range} from './store';
    import {view_tick, view_hm, inter_conflict, in_conflict, in_track}     from './store';

    const h_half       = 200;
    const h            = 2 * h_half;
    const hm2pt        = (x: HM) => x * 2;
    const d_in_half    = 10;
    const d_inter_half = 10;
    const station_l    = 60;
    const h_text       = -100;

    let w_width  = 100;
    let w_height = 100;
    let width;
    let height;
    let view_w0 = 0;
    $: width  = w_width - 20;
    $: height = h;

    /* let train_station = [];
    $: train_station = $trains.map(x => x.in_station($view_tick)); */

    let station_x1      = (station)        => station_l * (station.idx + 1) + hm2pt(station.dist);
    let station_x2      = (station)        => station_l * (station.idx + 2) + hm2pt(station.dist);
    let station_y_in    = (station, track) => d_in_half    * (station.n_track_in    - 2 * track - 1);
    let station_y_inter = (station, track) => d_inter_half * (station.n_track_inter - 2 * track - 1);

    function wheel_handler (event: any): void {
        /* event.preventDefault();
        let delta_tick: number;
        let delta_hm:   number;
        if (event.ctrlKey) {
            delta_tick = Math.sign(event.deltaY) * 40;
            delta_hm   = Math.sign(event.deltaX) * 15;
        }
        else {
            delta_tick = Math.sign(event.deltaX) * 40;
            delta_hm   = Math.sign(event.deltaY) * 15;
        }
        $tick_range = [$tick_range[0] + delta_tick, $tick_range[1] + delta_tick];
        $view_hm   += delta_hm;
        if ($stations.length > 0 && $view_hm > $stations.at(-1).dist - 100)
            $view_hm = $stations.at(-1).dist - 100
        if ($view_hm < -10)
            $view_hm = -10 */
    }
</script>

<svelte:window bind:innerWidth ={w_width}
               bind:innerHeight={w_height}/>

<div on:wheel    ={wheel_handler}>
    <svg width={width} height={height} viewBox={`${view_w0} ${-h_half} ${width} ${h}`}>
        <!-- Stations -->
        {#each $stations as s}
            {#each [...Array(s.n_track_in).keys()] as t}
                <path class=track_in d={`M${station_x1(s)} ${station_y_in(s, t)} h${station_l}`} />
            {/each}
            <text text-anchor="middle" x={station_x1(s) + station_l * 0.5} y={h_text}> {s.name} </text>
        {/each}

        <!-- Inter track -->
        {#each $stations.slice(0, -1) as s, i}
            {#each [...Array(s.n_track_inter).keys()] as t}
                <path class=track_inter d={`M${station_x2(s)} ${station_y_inter(s, t)} h${hm2pt($stations[i + 1].dist - s.dist)}`} />
            {/each}
        {/each}

        <!-- In station train -->
        {#each $trains.map(x => x.in_station($view_tick)) as s, idx}
            {#if s != -1}
                <text stroke={$trains[idx].color} text-anchor="middle" dominant-baseline="middle" x={station_x1(s) + station_l * 0.5} y={station_y_in(s, $in_track[s.idx][idx])}>
                    {$trains[idx].name}
                </text>
            {/if}
        {/each}
    </svg>
</div>

<style>
    .track_in    {stroke:#CCCCCC; stroke-width:4; fill:none;}
    .track_inter {stroke:#CCCCCC; stroke-width:4; fill:none;}
</style>
