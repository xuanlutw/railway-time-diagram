<script lang="ts">
    import {tick2sec, tick2min, tick2hr}                    from './common';
    import type {Tick, HM, Control}                         from './common';
    import {stations, train_types, trains, focus_train_num} from './store';
    import { Train }                                        from './train';

    const tick2pt = (x: Tick)   => x * 5;
    const pt2tick = (x: number) => Math.round(x / 5);
    const hm2pt   = (x: HM)     => x * 1;

    const width   = 1200;
    const width0  = 50;
    const height  = 500;
    const height0 = 60;
    const height1 = 40;
    const margin  = 20;

    const box_w   = 6;
    const grid_wb = 2;
    const grid_ws = 1;
    const train_w = 1.5;
    const train_wf= 3;

    let view_tick = 1440;
    let view_hm   = 0;

    function wheel_handler (event: any): void {
        event.preventDefault();
        view_tick += event.deltaX;
        view_hm   += event.deltaY / 10;
    }

    let x_n:   number;
    let x_o:   number;
    let t_n:   Tick;
    let t_o:   Tick;
    let idx_o: number;

    function click_handler (event: any, t: Tick, c: Control, idx: number): void {
        if (c == "S" || c == "N")
            trains.update(x => {
                    x[$focus_train_num].flip_stop(idx);
                    return x;
                    });
        else if (c == "D" || c == "T") {
            x_o   = event.x;
            t_o   = t;
            idx_o = idx;
        }
    }

    function drag_end (event: any): void {
        if (Math.abs(event.x - x_o) > 5) {
            if (idx_o >= 0)
                trains.update(x => {
                        x[$focus_train_num].set_time(idx_o, pt2tick(event.x - x_o));
                        return x;
                        });
            idx_o = -1;
        }
    }

    function mouse_position_handler (event: any): void {
        x_n = event.x;
        t_n = t_o + pt2tick(x_n - x_o);
    }

    $: if ($train_types.length > 0) {
        trains.update(x => {
                x.push(new Train("123", 0, 0, 12, 
                                 [true, false, true, true, false, true, true, true, true, true, true, true, true],
                                 1400));
                x.push(new Train("666", 0, 12, 0, 
                                 [true, false, true, true, false, true, true, true, true, true, true, true, true],
                                 1500));
                x.push(new Train("7575", 1, 0, 8, 
                                 [true, false, true, true, false, true, true, true, true, true, true, true, true],
                                 1350));
                return x});
        focus_train_num.update(_ => 0);
    }
</script>

<div on:wheel={wheel_handler}
     on:click={drag_end}
     on:mousemove={mouse_position_handler}>
    <svg width={width + width0 + 2 * margin} height={height + height0 + height1 + 2 * margin}
         viewBox={`${-margin} ${-margin} ${width + width0 + 2 * margin} ${height + height0 + height1 + 2 * margin}`}>

        <!-- Icons -->
        <defs>
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
        </defs>

        <!-- Time grid -->
        {#each [...Array(5760).keys()] as t}
            {#if t % 40 == 0 && t >= view_tick && tick2pt(t - view_tick) < width}
                <line x1={width0 + tick2pt(t - view_tick)} y1={height0}
                      x2={width0 + tick2pt(t - view_tick)} y2={height0 + height}
                      stroke="#CCCCCC" stroke-width={(t % 240)? grid_ws: grid_wb}/>
            {/if}
        {/each}

        <!-- Station grid -->
        {#each $stations as s}
            {#if s.dist >= view_hm && hm2pt(s.dist - view_hm) < height}
                <line x1={width0}         y1={height0 + hm2pt(s.dist - view_hm)}
                      x2={width0 + width} y2={height0 + hm2pt(s.dist - view_hm)}
                      stroke="#CCCCCC" stroke-width={grid_wb}/>
            {/if}
        {/each}

        <!-- Trains -->
        {#each $trains as train, n}
            {#each [...Array(train.coords.length - 1).keys()] as idx}
                {#if n == $focus_train_num}
                    <line x1={width0  + tick2pt(train.coords[idx].t     - view_tick)}
                          y1={height0 +   hm2pt(train.coords[idx].d     - view_hm)}
                          x2={width0  + tick2pt(train.coords[idx + 1].t - view_tick)}
                          y2={height0 +   hm2pt(train.coords[idx + 1].d - view_hm)}
                          stroke="#FFDFBD" stroke-width={3 * train_wf} opacity="0.4"/>
                    <line x1={width0  + tick2pt(train.coords[idx].t     - view_tick)}
                          y1={height0 +   hm2pt(train.coords[idx].d     - view_hm)}
                          x2={width0  + tick2pt(train.coords[idx + 1].t - view_tick)}
                          y2={height0 +   hm2pt(train.coords[idx + 1].d - view_hm)}
                          stroke="#F8DFBD" stroke-width={4 * train_wf} opacity="0.3"/>
                    <line x1={width0  + tick2pt(train.coords[idx].t     - view_tick)}
                          y1={height0 +   hm2pt(train.coords[idx].d     - view_hm)}
                          x2={width0  + tick2pt(train.coords[idx + 1].t - view_tick)}
                          y2={height0 +   hm2pt(train.coords[idx + 1].d - view_hm)}
                          stroke="#F0DFBD" stroke-width={5 * train_wf} opacity="0.2"/>
                {/if}
                <line x1={width0  + tick2pt(train.coords[idx].t     - view_tick)}
                      y1={height0 +   hm2pt(train.coords[idx].d     - view_hm)}
                      x2={width0  + tick2pt(train.coords[idx + 1].t - view_tick)}
                      y2={height0 +   hm2pt(train.coords[idx + 1].d - view_hm)}
                      stroke={train.color} stroke-width={(n == $focus_train_num)? train_wf: train_w}/>
            {/each}
        {/each}

        <!-- Mask -->
        <rect x={-margin} y={height + height0} 
              width={width0 + width + 2 * margin} height={height1 + margin} fill="#FFFFFF" />
        <rect x={-margin} y={-margin} 
              width={width0 + width + 2 * margin} height={height0 + margin} fill="#FFFFFF" />
        <rect x={-margin} y={-margin} 
              width={width0 + margin}             height={height0 + height + height1 + 2 * margin} fill="#FFFFFF" />
        <rect x={width + width0} y={-margin} 
              width={margin}                      height={height0 + height + height1 + 2 * margin} fill="#FFFFFF" />

        <!-- Control Line -->
        {#if $focus_train_num >= 0}
            {#each $trains[$focus_train_num].coords.map(x => (x.t == t_o)? {"t": t_n, "d": x.d, "c": "C", "idx": x.idx}: x).filter((x, idx, arr) => (idx < arr.length - 1) && (x.t >= view_tick) && (tick2pt(x.t - view_tick) <= width)) as item}
                <line x1={width0  + tick2pt(item.t - view_tick)}
                      y1={height0 / ((item.c == "S" || item.c == "N")? 3: 1.5)}
                      x2={width0  + tick2pt(item.t - view_tick)}
                      y2={height0 + height + height1 / ((item.c == "S" || item.c == "N")? 3: 1.5)}
                      stroke="#888888" stroke-width={grid_ws} stroke-dasharray="5"/>
                <text x={width0 + tick2pt(item.t - view_tick)}
                      y={height0 / ((item.c == "S" || item.c == "N")? 3: 1.5)} >
                      {tick2min(item.t).toString().padStart(2, "0") + "." +
                       tick2sec(item.t).toString().padStart(2, "0")} </text>
                <use href={item.c == "N"? "#icon_plus": item.c == "S"? "#icon_minus": "#icon_shift"}
                     x={width0 + tick2pt(item.t - view_tick) - ((item.c == "N" || item.c == "S")? 8: 12)}
                     y={height0 + height + height1 / ((item.c == "S" || item.c == "N")? 3: 1.5) - 8}
                     on:click={(event)=>click_handler(event, item.t, item.c, item.idx)} />
            {/each}
        {/if}
        
        <!-- Labels -->
        {#each [...Array(5760).keys()] as t}
            {#if t % 40 == 0 && t >= view_tick && tick2pt(t - view_tick) < width}
                <text x={width0 + tick2pt(t - view_tick)} y={height0 - box_w}> 
                      {(t % 240)? tick2min(t).toString().padStart(2, "0"): 
                                  tick2hr(t).toString().padStart(2, "0") + "00"} </text>
            {/if}
        {/each}
        {#each $stations as s}
            {#if s.dist >= view_hm && hm2pt(s.dist - view_hm) < height}
                <text x=0 y={height0 + hm2pt(s.dist - view_hm)}> {s.name} </text>
            {/if}
        {/each}

        <!-- Outer box --->
        <line x1={width0 - box_w / 2}         y1={height0}        
              x2={width0 + width + box_w / 2} y2={height0}
              stroke="#CCCCCC" stroke-width={box_w}/>
        <line x1={width0 + width}             y1={height0 + height + box_w / 2} 
              x2={width0 + width}             y2={height0 - box_w / 2}
              stroke="#CCCCCC" stroke-width={box_w}/>
        <line x1={width0 + width + box_w / 2} y1={height0 + height} 
              x2={width0 - box_w / 2}         y2={height0 + height}
              stroke="#CCCCCC" stroke-width={box_w}/>
        <line x1={width0}                     y1={height0 - box_w / 2}        
              x2={width0}                     y2={height0 + height + box_w / 2}
              stroke="#CCCCCC" stroke-width={box_w}/>
    </svg>
</div>

<style type="text/css">
	.st0{fill:#F19483;}
	.st1{fill:#A8D8B9;}
	.st2{fill:#FFFFFF;}
	.st3{fill:#9B90C2;}
</style>
