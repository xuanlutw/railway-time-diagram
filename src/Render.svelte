<script lang="ts">
    import {tick2min, tick2hr}                              from './common';
    import type {Tick, HM, Control}                         from './common';
    import {stations, train_types, trains, focus_train_num} from './store';
    import { Train }                                        from './train';

    const tick2pt = (x: Tick)   => x * 5;
    const pt2tick = (x: number) => x / 5;
    const hm2pt   = (x: HM)     => x * 1;

    const width   = 1200;
    const width0  = 50;
    const height  = 500;
    const height0 = 20;
    const height1 = 60;
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

    function click_handler (c: Control, idx: number): void {
        if (c == "S" || c == "N")
            trains.update(x => {
                    x[$focus_train_num].flip_stop(idx);
                    return x;
                    });
    }

    let x_now: number;
    let x_o:   number;
    let idx_o: number = -1;
    let c_o:   Control;

    function drag_start (event: any, c: Control, idx: number): void {
        x_o   = event.x;
        c_o   = c;
        idx_o = idx;
    }

    function drag_end (event: any): void {
        if (idx_o >= 0 && Math.abs(event.x - x_o) > 5) {
            console.log(event.x - x_o, idx_o);
            trains.update(x => {
                    x[$focus_train_num].set_time(idx_o, pt2tick(event.x - x_o));
                    return x;
                    });
        }
        if (Math.abs(event.x - x_o) > 5)
            idx_o = -1;
    }

    function mouse_position_handler (event: any): void {
        x_now = event.x;
    }
    

    $: if ($train_types.length > 0) {
        console.log($train_types);
        trains.update(x => {
                x.push(new Train(0, 0, 12, 
                                 [true, false, true, true, false, true, true, true, true, true, true, true, true],
                                 1400));
                x.push(new Train(0, 12, 0, 
                                 [true, false, true, true, false, true, true, true, true, true, true, true, true],
                                 1500));
                return x});
        focus_train_num.update(_ => 0);
    }
</script>

<div on:wheel={wheel_handler}
     on:click={drag_end}
     on:mousemove={mouse_position_handler}>
    <svg width={width + width0 + 2 * margin} height={height + height0 + height1 + 2 * margin}
         viewBox={`${-margin} ${-margin} ${width + width0 + 2 * margin} ${height + height0 + height1 + 2 * margin}`}>

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

        <!-- Control Line -->
        {#if $focus_train_num >= 0}
            {#each $trains[$focus_train_num].coords.slice(0, $trains[$focus_train_num].coords.length - 1) as item}
                <line x1={width0  + tick2pt(item.t - view_tick)}
                      y1={height0}
                      x2={width0  + tick2pt(item.t - view_tick)}
                      y2={height0 + height + height1}
                      stroke="#888888" stroke-width={grid_ws} stroke-dasharray="5"/>
                {#if item.c == "S" || item.c == "N"}
                    <circle cx={width0  + tick2pt(item.t - view_tick)}
                            cy={height0 + height + height1}
                            r=8 stroke="black" stroke-width="1" fill="#FFCCCC" 
                            on:click={()=>click_handler(item.c, item.idx)} />
                {:else}
                    <circle cx={width0  + tick2pt(item.t - view_tick)}
                            cy={height0 + height + height1}
                            r=8 stroke="black" stroke-width="1" fill="#CCFFCC" 
                            on:click={(event) => drag_start(event, item.c, item.idx)} />
                {/if}
            {/each}
        {/if}
        
        <!-- Mouse Focus -->
        {#if idx_o >= 0}
            <line x1={x_now - margin}
                  y1={height0}
                  x2={x_now - margin}
                  y2={height0 + height + height1}
                  stroke="#888888" stroke-width={grid_ws} stroke-dasharray="5"/>
            <circle cx={x_now - margin}
                    cy={height0 + height + height1}
                    r=8 stroke="black" stroke-width="1" fill="#CCCCFF" />
        {/if}

        <!-- Mask -->
        <rect x={-margin} y={-margin} 
              width={width0 + width + 2 * margin} height={height0 + margin} fill="#FFFFFF" />
        <rect x={-margin} y={-margin} 
              width={width0 + margin}             height={height0 + height + height1 + 2 * margin} fill="#FFFFFF" />
        <rect x={width + width0} y={-margin} 
              width={margin}                      height={height0 + height + height1 + 2 * margin} fill="#FFFFFF" />

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
