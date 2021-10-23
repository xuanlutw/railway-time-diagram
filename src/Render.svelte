<script lang="ts">
    import {tick2sec, tick2min, tick2hr}                         from './common';
    import type {Tick, HM, Control}                              from './common';
    import {stations, trains, focus_idx, focus_type, tick_range} from './store';
    import {view_tick, view_hm, inter_conflict, in_conflict}     from './store';

    let tickpt_r  = 5;
    let tick2pt; 
    let tick2ptd = (x: Tick)   => x * 2.75;
    $: tick2pt   = (x: Tick)   => x * tickpt_r;
    let pt2tick;
    $: pt2tick = (x: number) => Math.round(x / tickpt_r);
    let hm2pt   = (x: HM)     => x * 1;

    let w_width = 100;
    let w_height= 100;
    let width   = 1200;
    let height  = 450;
    let x0      = 0;
    let y0      = 0;

    const width0  = 80;
    const height0 = 20;
    const height1 = 40;
    const margin  = 10;
    const red_height1 = (x: Control) => height1 / ((x == "S" || x == "N")? 3: 1.5);

    let view_x0   = 0;
    let view_y0   = 0;
    let view_w    = 0;
    let view_h    = 0;

    $: tickpt_r  = width / ($tick_range[1] - $tick_range[0])
    $: width  = w_width - 2 * margin - width0 - 20;
    $: height = w_height * 0.6;

    $: x0      = tick2pt($view_tick);
    $: y0      =   hm2pt($view_hm);
    $: view_x0 = tick2pt($view_tick) - margin - width0
    $: view_y0 =   hm2pt($view_hm)   - margin - height0
    $: view_w  = width  + width0            + 2 * margin
    $: view_h  = height + height0 + height1 + 2 * margin

    function wheel_handler (event: any): void {
        event.preventDefault();
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
    }

    let control_items = <{"t": Tick, "d": HM, "c": Control, "idx": number}[]>[];
    $: control_items = ($focus_type != "M")? []: $trains[$focus_idx].coords
        .map(x => (x.t == t_o)? {"t": t_n, "d": x.d, "c": <Control>"C", "idx": x.idx}: x)
        .filter((x, idx, arr) => 
            (idx < arr.length - 1) && (x.t > $view_tick) && (tick2pt(x.t - $view_tick) < width) && 
                                      (x.d > $view_hm)   && (  hm2pt(x.d - $view_hm)   < height));

    let x_o:   number;
    let t_n:   Tick;
    let t_o:   Tick;
    let idx_o: number;

    function click_handler (event: any, t: Tick, c: Control, idx: number): void {
        if (c == "S" || c == "N")
            trains.update(x => {
                    x[$focus_idx].flip_stop(idx);
                    return x;
                    });
        else if (c == "D" || c == "T") {
            x_o   = event.x;
            t_o   = t;
            t_n   = t_o;
            idx_o = idx;
        }
    }

    function drag_end (event: any): void {
        if (Math.abs(event.x - x_o) > 5) {
            if (t_o >= 0)
                trains.update(x => {
                        x[$focus_idx].set_time(idx_o, pt2tick(event.x - x_o));
                        return x;
                        });
            t_o = -1;
        }
    }

    function mouse_position_handler (event: any): void {
        if ($focus_type != "M")
            t_o = -1;
        else
            t_n = t_o + pt2tick(event.x - x_o);
    }

    // Download svg
    let w0  = tick2ptd(5760)
    let w0d = tick2ptd(5760) + 2 * width0;
    let h0  = 0;
    let h0d = 0;
    $:  h0  = hm2pt($stations.length > 0? $stations.at(-1).dist: 0);
    $:  h0d = hm2pt($stations.length > 0? $stations.at(-1).dist: 0) + 2 * width0;
</script>

<svelte:window bind:innerWidth ={w_width}
               bind:innerHeight={w_height}/>

<div on:wheel    ={wheel_handler}
     on:click    ={drag_end}
     on:mousemove={mouse_position_handler}>
    <svg width={view_w} height={view_h} viewBox={`${view_x0} ${view_y0} ${view_w} ${view_h}`}>
        <!-- Styles and Icons -->
        <defs>
            <style>
                .st0{fill:#F19483;}
                .st1{fill:#A8D8B9;}
                .st2{fill:#FFFFFF;}
                .st3{fill:#9B90C2;}
                .st4{fill:#9BF0FF;}

                .border {stroke:#CCCCCC; stroke-width:4; fill:none;}
                .grid   {stroke:#CCCCCC; stroke-width:1;}
                .gridb  {stroke:#CCCCCC; stroke-width:3;}
                .control{stroke:#888888; stroke-width:1; stroke-dasharray:5;}
                .mask   {fill:#FFFFFF;}

                .station    {stroke:#000000; stroke-width:2; fill:#FFFFFF;}
                .track      {stroke:#000000; stroke-width:2;}
                .track_mask {stroke:#FFFFFF; stroke-width:6;}

                .train  {stroke-width:2; fill:none;}

                .hh1    {stroke:#F0DFBD; stroke-width:16; opacity:0.2; fill:none;}
                .hh2    {stroke:#E0CFAD; stroke-width:13; opacity:0.4; fill:none;}
                .hh3    {stroke:#D0BF9D; stroke-width:10; opacity:0.6; fill:none;}

                .inter_conflict        {fill:#FF0000; opacity:0.3;}
                .inter_conflict_margin {fill:#FF6600; opacity:0.3;}
                .in_conflict           {stroke:#FF0000; stroke-width:15; opacity:0.3;}
                .in_conflict_margin    {stroke:#FF6600; stroke-width:15; opacity:0.3;}
            </style>
            <g id="icon_plus">
                <circle class="st1" cx="8" cy="8" r="7.5"/>
                <path d="M8,1c3.86,0,7,3.14,7,7s-3.14,7-7,7s-7-3.14-7-7S4.14,1,8,1 M8,0C3.58,0,0,3.58,0,8s3.58,8,8,8s8-3.58,8-8S12.42,0,8,0L8,0 z"/>
                <polygon class="st2" points="7.5,11.5 7.5,8.5 4.5,8.5 4.5,7.5 7.5,7.5 7.5,4.5 8.5,4.5 8.5,7.5 11.5,7.5 11.5,8.5 8.5,8.5 8.5,11.5 	"/>
                <path d="M8,5v2v1h1h2H9H8v1v2V9V8V7V5 M9,4H7v3H4v2h3v3h2V9h3V7H9V4L9,4z"/>
            </g>
            <g id="icon_minus">
                <circle class="st0" cx="8" cy="8" r="7.5"/>
                <path d="M8,1c3.86,0,7,3.14,7,7s-3.14,7-7,7s-7-3.14-7-7S4.14,1,8,1 M8,0C3.58,0,0,3.58,0,8s3.58,8,8,8s8-3.58,8-8S12.42,0,8,0L8,0 z"/>
                <rect x="3.5" y="7.5" class="st2" width="9" height="1"/>
                <polygon points="13,7 3,7 3,9 13,9 13,7 	"/>
            </g>
            <g id="icon_shift">
                <polygon class="st3" points="1.29,8 7.37,1.29 7.37,4.97 11.5,4.97 11.5,11.52 7.37,11.52 7.37,14.71 	"/>
                <path d="M6.87,2.59v1.88v1h1H11v5.55H7.87h-1v1v1.39L1.96,8L6.87,2.59 M7.87,0L0.61,8l7.26,8v-3.98H12V4.47H7.87V0L7.87,0z"/>
                <polygon class="st3" points="17.24,11.56 13.11,11.56 13.11,5.02 17.24,5.02 17.24,1.34 23.32,8.04 17.24,14.75 	"/>
                <path d="M17.74,2.64l4.91,5.41l-4.91,5.41v-1.39v-1h-1h-3.13V5.52h3.13h1v-1V2.64 M16.74,0.04v4.47h-4.13v7.55h4.13v3.98l7.26-8 L16.74,0.04L16.74,0.04z"/>
            </g>
            <g id="icon_shiftc">
                <polygon class="st4" points="1.29,8 7.37,1.29 7.37,4.97 11.5,4.97 11.5,11.52 7.37,11.52 7.37,14.71 	"/>
                <path d="M6.87,2.59v1.88v1h1H11v5.55H7.87h-1v1v1.39L1.96,8L6.87,2.59 M7.87,0L0.61,8l7.26,8v-3.98H12V4.47H7.87V0L7.87,0z"/>
                <polygon class="st4" points="17.24,11.56 13.11,11.56 13.11,5.02 17.24,5.02 17.24,1.34 23.32,8.04 17.24,14.75 	"/>
                <path d="M17.74,2.64l4.91,5.41l-4.91,5.41v-1.39v-1h-1h-3.13V5.52h3.13h1v-1V2.64 M16.74,0.04v4.47h-4.13v7.55h4.13v3.98l7.26-8 L16.74,0.04L16.74,0.04z"/>
            </g>
        </defs>

        <!-- Grids -->
        {#each [...Array(144).keys()].map(x => x * 40).filter(x => x > $view_tick && tick2pt(x - $view_tick) < width) as t}
            <path class={(t % 240)? "grid": "gridb"} d={`M${tick2pt(t)} ${hm2pt($view_hm)} v${height}`} />
        {/each}
        {#each $stations.map(x => x.dist) as d}
            <path class=grid d={`M${tick2pt($view_tick)} ${hm2pt(d)} h${width}`} />
        {/each}
 
        <!-- Conflicts -->
        {#each $inter_conflict as item}
            <rect class=inter_conflict x={tick2pt(item.t1)} y={hm2pt(item.d1)} 
                  width={tick2pt(item.t2 - item.t1)} height={hm2pt(item.d2 - item.d1)} />
            <rect class=inter_conflict_margin x={tick2pt(item.t1) - 5} y={hm2pt(item.d1)} 
                  width=5 height={hm2pt(item.d2 - item.d1)} />
            <rect class=inter_conflict_margin x={tick2pt(item.t2)} y={hm2pt(item.d1)} 
                  width=5  height={hm2pt(item.d2 - item.d1)} />
        {/each}
        {#each $in_conflict as item}
            <path class=in_conflict
                  d={`M${tick2pt(item.t1)} ${hm2pt(item.d)} h${tick2pt(item.t2 - item.t1)}`} />
            <path class=in_conflict_margin
                  d={`M${tick2pt(item.t1)} ${hm2pt(item.d)} h-5`} />
            <path class=in_conflict_margin
                  d={`M${tick2pt(item.t2)} ${hm2pt(item.d)} h5`} />
        {/each}

        <!-- Train highlight -->
        {#if $focus_type != "D"}
            <defs>
                <g id="focus_train">
                    <path d={$trains[$focus_idx].coords.reduce((acc, x, idx) =>
                        `${acc} ${idx == 0? "M": "L"}${tick2pt(x.t)} ${hm2pt(x.d)}`, "")} />
                </g>
            </defs>
            <use class=hh1   href="#focus_train" />
            <use class=hh2   href="#focus_train" />
            <use class=hh3   href="#focus_train" />
        {/if}

        <!-- Trains -->
        {#each $trains as item}
            <path class=train stroke={item.color}
                d={item.coords.reduce((acc, x, idx) => `${acc} ${idx == 0? "M": "L"}${tick2pt(x.t)} ${hm2pt(x.d)}`, "")} />
            {#each item.coords.reduce((acc, x, idx, arr) => {
                    if ((idx < arr.length - 1) && (x.d != arr[idx + 1].d))
                        return [...acc, {"t1": x.t, "t2": arr[idx + 1].t, "d1": x.d, "d2": arr[idx + 1].d}];
                    else
                        return acc; }, []).filter((_, idx) => idx % 3 == 0) as x}
                <defs>
                    <path id={`${x.t1}${item.name}`} 
                        d={`M${tick2pt(x.t1)} ${hm2pt(x.d1)} L${tick2pt(x.t2)} ${hm2pt(x.d2)}`} />
                </defs>
                <text stroke={item.color} font-size=10px >
                    <textPath startOffset="50%" href={`#${x.t1}${item.name}`}> {item.name} </textPath>
                </text>
            {/each}
        {/each}

        <!-- Mask -->
        <path class=mask
            d={`M${view_x0} ${view_y0} h${view_w} v${view_h} h${-view_w} Z
                M${x0}      ${y0}      v${height} h${width}  v${-height} Z`} />

        <!-- Control Line -->
        {#each control_items as item}
            <path class=control
                d={`M${tick2pt(item.t)} ${hm2pt(item.d)} v${y0 + height + red_height1(item.c) - hm2pt(item.d)}`} />
            <text x={tick2pt(item.t)} y={y0 + height + red_height1(item.c) + 5} >
                  {`${tick2min(item.t)}.${tick2sec(item.t)}`} </text>
            <use href={`#icon_${item.c == "N"? "plus": item.c == "S"? "minus": item.c == "C"? "shiftc": "shift"}`}
                 x={tick2pt(item.t) - ((item.c == "N" || item.c == "S")? 8: 12)} y={hm2pt(item.d) - 8}
                 on:click={(event)=>click_handler(event, item.t, item.c, item.idx)} />
        {/each}
        
        <!-- Labels -->
        {#if $tick_range[1] - $tick_range[0] > 960}
            {#each [...Array(24).keys()].map(x => x * 240).filter(x => x > $view_tick && tick2pt(x - $view_tick) < width) as t}
                <text x={tick2pt(t)} y={y0 - 6}> {`${tick2hr(t)}00`} </text>
            {/each}
        {:else}
            {#each [...Array(144).keys()].map(x => x * 40).filter(x => x > $view_tick && tick2pt(x - $view_tick) < width) as t}
                <text x={tick2pt(t)} y={y0 - 6}> {`${(t % 240)? "": tick2hr(t)}${tick2min(t)}`} </text>
            {/each}
        {/if}
        {#each $stations.filter(x => x.dist >= $view_hm && hm2pt(x.dist - $view_hm) < height) as s}
            <text x={x0 - 10} y={hm2pt(s.dist) + 6} text-anchor="end"> {s.name} </text>
        {/each}

        <!-- Outer box --->
        <path class="border" d={`M${x0} ${y0} h${width} v${height} h${-width} Z`} />
        
        <!-- Line info -->
        {#each $stations.filter((_, idx) => idx != $stations.length - 1) as s, idx}
            <path class="track_mask" d={`M${x0} ${hm2pt(s.dist)} v${hm2pt($stations[idx + 1].dist - s.dist)}`} />
            {#if (s.n_track_inter == 1)}
                <path class="track" d={`M${x0} ${hm2pt(s.dist)} v${hm2pt($stations[idx + 1].dist - s.dist)}`} />
            {:else}
                <path class="track" d={`M${x0 + 2} ${hm2pt(s.dist)} v${Math.min(y0 + height, hm2pt($stations[idx + 1].dist) - s.dist)}`} />
                <path class="track" d={`M${x0 - 2} ${hm2pt(s.dist)} v${Math.min(y0 + height, hm2pt($stations[idx + 1].dist) - s.dist)}`} />
            {/if}
        {/each}
        {#each $stations.filter(x => x.dist >= $view_hm && hm2pt(x.dist - $view_hm) < height) as s}
            <circle class=station cx={x0} cy={hm2pt(s.dist)} r=8 />
            <text x={x0} y={hm2pt(s.dist) + 5} font-size=12px font-weight="bold" text-anchor="middle" >
                {s.n_track_in}
            </text>
        {/each}
        <path class="track_mask" d={`M${x0} ${y0-2} v${-100}`} />
        <path class="track_mask" d={`M${x0} ${y0 + height + 2} v${100}`} />
    </svg>
</div>

<!-- Download svg -->
<div style="display:none">
    <svg xmlns="http://www.w3.org/2000/svg"
         id=main_svg width ={w0d}
         height={h0d}
         viewBox={`${-width0} ${-width0} ${w0d} ${h0d}`}>
        <!-- Styles -->
        <defs>
            <style>
                .border {stroke:#CCCCCC; stroke-width:4; fill:none;}
                .grid   {stroke:#CCCCCC; stroke-width:1;}
                .gridb  {stroke:#CCCCCC; stroke-width:3;}
                .control{stroke:#888888; stroke-width:1; stroke-dasharray:5;}
                .mask   {fill:#FFFFFF;}

                .station    {stroke:#000000; stroke-width:2; fill:#FFFFFF;}
                .track      {stroke:#000000; stroke-width:2;}
                .track_mask {stroke:#FFFFFF; stroke-width:6;}

                .train  {stroke-width:2; fill:none;}

                .hh1    {stroke:#F0DFBD; stroke-width:16; opacity:0.2; fill:none;}
                .hh2    {stroke:#E0CFAD; stroke-width:13; opacity:0.4; fill:none;}
                .hh3    {stroke:#D0BF9D; stroke-width:10; opacity:0.6; fill:none;}

                .inter_conflict        {fill:#FF0000; opacity:0.3;}
                .inter_conflict_margin {fill:#FF6600; opacity:0.3;}
                .in_conflict           {stroke:#FF0000; stroke-width:15; opacity:0.3;}
                .in_conflict_margin    {stroke:#FF6600; stroke-width:15; opacity:0.3;}
            </style>
        </defs>

        <!-- BG color -->
        <rect x={-width0} y={-width0} width={w0d} height={h0d} fill=white stroke-width=0 />
        <!-- Grids -->
        {#each [...Array(145).keys()].map(x => x * 40) as t}
            <path class={(t % 240)? "grid": "gridb"} d={`M${tick2ptd(t)} 0 v${h0}`} />
        {/each}
        {#each $stations.map(x => x.dist) as d}
            <path class=grid d={`M0 ${hm2pt(d)} h${w0}`} />
        {/each}
 
        <!-- Time info -->
        {#each [...Array(145).keys()].map(x => x * 40) as t}
            <text x={tick2pt(t)} y={0 - 10}> {`${(t % 240)? "": tick2hr(t)}${tick2min(t)}`} </text>
        {/each}

        <!-- Line info -->
        {#each [...Array(13).keys()].map(x => tick2ptd(x * 480)) as t}
            {#each $stations as s}
                <text x={t - 10} y={hm2pt(s.dist) + 6} text-anchor="end"> {s.name} </text>
            {/each}
            {#each $stations.filter((_, idx) => idx != $stations.length - 1) as s, idx}
                {#if (s.n_track_inter == 1)}
                    <path class="track" d={`M${t} ${hm2pt(s.dist)} v${hm2pt($stations[idx + 1].dist - s.dist)}`} />
                {:else}
                    <path class="track" d={`M${t + 2} ${hm2pt(s.dist)} v${hm2pt($stations[idx + 1].dist) - s.dist}`} />
                    <path class="track" d={`M${t - 2} ${hm2pt(s.dist)} v${hm2pt($stations[idx + 1].dist) - s.dist}`} />
                {/if}
            {/each}
            {#each $stations as s}
                <circle class=station cx={t} cy={hm2pt(s.dist)} r=8 />
                <text x={t} y={hm2pt(s.dist) + 5} font-size=12px font-weight="bold" text-anchor="middle" >
                    {s.n_track_in}
                </text>
            {/each}
        {/each}

        <!-- Conflicts -->
        {#each $inter_conflict as item}
            <rect class=inter_conflict x={tick2pt(item.t1)} y={hm2pt(item.d1)} 
                  width={tick2pt(item.t2 - item.t1)} height={hm2pt(item.d2 - item.d1)} />
            <rect class=inter_conflict_margin x={tick2pt(item.t1) - 5} y={hm2pt(item.d1)} 
                  width=5 height={hm2pt(item.d2 - item.d1)} />
            <rect class=inter_conflict_margin x={tick2pt(item.t2)} y={hm2pt(item.d1)} 
                  width=5  height={hm2pt(item.d2 - item.d1)} />
        {/each}
        {#each $in_conflict as item}
            <path class=in_conflict
                  d={`M${tick2pt(item.t1)} ${hm2pt(item.d)} h${tick2pt(item.t2 - item.t1)}`} />
            <path class=in_conflict_margin
                  d={`M${tick2pt(item.t1)} ${hm2pt(item.d)} h-5`} />
            <path class=in_conflict_margin
                  d={`M${tick2pt(item.t2)} ${hm2pt(item.d)} h5`} />
        {/each}

        <!-- Trains -->
        {#each $trains as item}
            <path class=train stroke={item.color}
                d={item.coords.reduce((acc, x, idx) => `${acc} ${idx == 0? "M": "L"}${tick2pt(x.t)} ${hm2pt(x.d)}`, "")} />
            {#each item.coords.reduce((acc, x, idx, arr) => {
                    if ((idx < arr.length - 1) && (x.d != arr[idx + 1].d))
                        return [...acc, {"t1": x.t, "t2": arr[idx + 1].t, "d1": x.d, "d2": arr[idx + 1].d}];
                    else
                        return acc; }, []).filter((_, idx) => idx % 3 == 0) as x}
                <defs>
                    <path id={`d${x.t1}${item.name}d`} 
                        d={`M${tick2pt(x.t1)} ${hm2pt(x.d1)} L${tick2pt(x.t2)} ${hm2pt(x.d2)}`} />
                </defs>
                <text stroke={item.color} font-size=10px >
                    <textPath startOffset="50%" href={`#d${x.t1}${item.name}d`}> {item.name} </textPath>
                </text>
            {/each}
        {/each}
    </svg>
</div>
