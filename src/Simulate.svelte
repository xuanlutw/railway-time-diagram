<script lang="ts">
    import type {HM}                     from './common';
    import {stations, trains, tick_simu} from './store';
    import {inter_conflict, inter_track} from './store';
    import {in_conflict, in_track}       from './store';

    const h_half       = 200;
    const h            = 2 * h_half;
    const hm2pt        = (x: HM) => x * 6;
    const d_in         = 16;
    const d_inter      = 16;
    const station_l    = 60;
    const h_text       = 100;
    const conflict_w   = 100;
    const in_shrink    = 6;
    const inter_shrink = 6;

    let w_width  = 100;
    let w_height = 100;
    let width;
    let height;
    let view_w0 = 0;
    $: width  = w_width - 20;
    $: height = h;

    let station_x1    = (station)   => station_l * (station.idx + 1) + hm2pt(station.dist);
    let station_x2    = (station)   => station_l * (station.idx + 2) + hm2pt(station.dist);
    let track_y_in    = (track_num) => d_in * (((track_num - track_num % 2) / 2) * ((track_num % 2)? -1: 1) - track_num % 2);
    let track_y_inter = (track_num) => d_inter * -track_num;

    function wheel_handler (event: any): void {
        event.preventDefault();
        let delta_tick: number;
        let delta_hm:   number;
        if (event.ctrlKey) {
            delta_tick = Math.sign(event.deltaY) * 4;
            delta_hm   = Math.sign(event.deltaX) * 15;
        }
        else {
            delta_tick = Math.sign(event.deltaX) * 4;
            delta_hm   = Math.sign(event.deltaY) * 15;
        }
        $tick_simu[0] += delta_tick;
        view_w0    += delta_hm;
        if ($stations.length > 0 && view_w0 > station_x1($stations.at(-1)))
            view_w0 = station_x1($stations.at(-1));
        if (view_w0 < -10)
            view_w0 = -10;
    }
</script>

<svelte:window bind:innerWidth ={w_width}
               bind:innerHeight={w_height}/>

<div on:wheel ={wheel_handler}>
    <svg width={width} height={height} viewBox={`${view_w0} ${-h_half} ${width} ${h}`}>
        <!-- Stations -->
        {#each $stations as s, idx}
            {#each [...Array(s.n_track_in).keys()] as t}
                {#if idx == 0}
                    <path class=track_in
                        d={`M${station_x1(s)                              } ${track_y_in(t)}
                            h${station_l - 1 * parseInt(t / 2) * in_shrink}`} />
                {:else if idx == $stations.length - 1}
                    <path class=track_in
                        d={`M${station_x1(s) + parseInt(t / 2) * in_shrink} ${track_y_in(t)}
                            h${station_l - 1 * parseInt(t / 2) * in_shrink}`} />
                {:else}
                    <path class=track_in
                        d={`M${station_x1(s) + parseInt(t / 2) * in_shrink} ${track_y_in(t)}
                            h${station_l - 2 * parseInt(t / 2) * in_shrink}`} />
                {/if}
            {/each}
            <text text-anchor="middle"
                x={station_x1(s) + station_l * 0.5}
                y={h_text}>
                    {s.name}
            </text>
        {/each}

        <!-- Inter track -->
        {#each $stations.slice(0, -1) as s, i}
            {#each [...Array(s.n_track_inter).keys()] as t}
                <path class=track_inter
                    d={`M${station_x2(s) + inter_shrink} ${track_y_inter(t)}
                        h${hm2pt($stations[i + 1].dist - s.dist) - 2 * inter_shrink}`} />
            {/each}
        {/each}

        <!-- Right track connection -->
        {#each $stations.slice(0, -1) as s, i}
            <!-- Outside -->
            <path class=track_connect
                d={`M${station_x2(s) + inter_shrink} ${track_y_inter(0)}
                    L${station_x2(s)               } ${track_y_in(0)}`} />
            {#if s.n_track_inter > 1}
                <path class=track_connect
                    d={`M${station_x2(s) + inter_shrink} ${track_y_inter(1)}
                        L${station_x2(s)               } ${track_y_in(0)}`} />
            {/if}
            {#if s.n_track_in > 1}
                <path class=track_connect
                    d={`M${station_x2(s) + inter_shrink} ${track_y_inter(0)}
                        L${station_x2(s)               } ${track_y_in(1)}`} />
            {/if}
            {#if s.n_track_inter > 1 && s.n_track_in > 1}
                <path class=track_connect
                    d={`M${station_x2(s) + inter_shrink} ${track_y_inter(1)}
                        L${station_x2(s)               } ${track_y_in(1)}`} />
            {/if}
            <!-- Inside -->
            {#each [...Array(s.n_track_in).keys()] as t}
                <path class=track_connect
                    d={`M${station_x2(s) -             parseInt(t / 2)      * in_shrink}
                         ${track_y_in(t)}
                        L${station_x2(s) - Math.max(0, parseInt(t / 2) - 1) * in_shrink}
                         ${track_y_in(Math.max(t % 2, t - 2))}`} />
            {/each}
        {/each}

        <!-- Left track connection -->
        {#each $stations.slice(1) as s, i}
            <!-- Outside -->
            <path class=track_connect
                d={`M${station_x1(s) - inter_shrink} ${track_y_inter(0)}
                    L${station_x1(s)               } ${track_y_in(0)}`} />
            {#if $stations[s.idx - 1].n_track_inter > 1}
                <path class=track_connect
                    d={`M${station_x1(s) - inter_shrink} ${track_y_inter(1)}
                        L${station_x1(s)               } ${track_y_in(0)}`} />
            {/if}
            {#if s.n_track_in > 1}
                <path class=track_connect
                    d={`M${station_x1(s) - inter_shrink} ${track_y_inter(0)}
                        L${station_x1(s)               } ${track_y_in(1)}`} />
            {/if}
            {#if $stations[s.idx - 1].n_track_inter > 1 && s.n_track_in > 1}
                <path class=track_connect
                    d={`M${station_x1(s) - inter_shrink} ${track_y_inter(1)}
                        L${station_x1(s)               } ${track_y_in(1)}`} />
            {/if}
            <!-- Inside -->
            {#each [...Array(s.n_track_in).keys()] as t}
                <path class=track_connect
                    d={`M${station_x1(s) +             parseInt(t / 2)      * in_shrink}
                         ${track_y_in(t)}
                        L${station_x1(s) + Math.max(0, parseInt(t / 2) - 1) * in_shrink}
                         ${track_y_in(Math.max(t % 2, t - 2))}`} />
            {/each}
        {/each}

        <!-- In station conflict -->
        {#each $in_conflict as conflict}
            {#if conflict.t1 <= $tick_simu[0] && $tick_simu[0] < conflict.t2}
                <rect class=in_conflict x={station_x1(conflict.s)} y={-conflict_w / 2} 
                      width={station_l} height={conflict_w} />
            {/if}
        {/each}

        <!-- Inter station conflict -->
        {#each $inter_conflict as conflict}
            {#if conflict.t1 <= $tick_simu[0] && $tick_simu[0] < conflict.t2}
                <rect class=inter_conflict x={station_x2(conflict.s1)} y={-conflict_w / 2} 
                      width={hm2pt(conflict.s2.dist - conflict.s1.dist)} height={conflict_w} />
            {/if}
        {/each}

        <!-- In station train -->
        {#each $trains.map(x => x.in_station($tick_simu[0])) as s, idx}
            {#if s != "Nothing"}
                <text stroke={$trains[idx].color} text-anchor="middle" dominant-baseline="middle" 
                    x={station_x1(s) + station_l * 0.5}
                    y={track_y_in($in_track[s.idx][idx])}>
                    {$trains[idx].name}
                </text>
            {/if}
        {/each}

        <!-- Inter station train -->
        {#each $trains.map(x => x.inter_station($tick_simu[0])) as s, idx}
            {#if s != "Nothing"}
                <text stroke={$trains[idx].color} text-anchor="middle" dominant-baseline="middle"
                    x={station_x2(s.S) + hm2pt(s.D)}
                    y={track_y_inter($inter_track[s.S.idx][idx])}>
                    {$trains[idx].name}
                </text>
            {/if}
        {/each}
    </svg>
</div>

<style>
    .track_in      {stroke:#CCCCCC; stroke-width:2; fill:none;}
    .track_inter   {stroke:#CCCCCC; stroke-width:2; fill:none;}
    .track_connect {stroke:#CCCCCC; stroke-width:2; fill:none;}

    .inter_conflict {fill:#FF0000; opacity:0.3;}
    .in_conflict    {fill:#FF0000; opacity:0.3;}
</style>
