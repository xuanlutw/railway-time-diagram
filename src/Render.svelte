<script lang="ts">
    import {tick2min, tick2hr} from './common';
    import type {Tick, HM}     from './common';
    import {stations, train_types, trains}  from './store';
    import { Train }                       from './train';

    const tick2pt = (x: Tick) => x * 4;
    const hm2pt   = (x: HM)   => x * 2;

    const width   = 1200;
    const width0  = 50;
    const height  = 500;
    const height0 = 20;
    const margin  = 20;

    const box_w   = 6;
    const grid_wb = 2;
    const grid_ws = 1;

    let view_tick = 1440;
    let view_hm   = 0;

    function wheel_handler (event: any): void {
        event.preventDefault();
        view_tick += event.deltaX;
        view_hm   += event.deltaY / 10;
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
    }
</script>

<div on:wheel={wheel_handler}>
    <svg width={width + width0 + 2 * margin} height={height + height0 + 2 * margin}
         viewBox={`${-margin} ${-margin} ${width + width0 + 2 * margin} ${height + height0 + 2 * margin}`}>

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
        {#each $trains as train}
            {#each [...Array(train.coords.length - 1).keys()] as idx}
                {#if 1 || train.coords[idx].t >= view_tick && tick2pt(train.coords[idx + 1].t - view_tick) < width &&
                     train.coords[idx].d >= view_hm   &&   hm2pt(train.coords[idx + 1].d - view_hm)   < height}
                    <line x1={width0  + tick2pt(train.coords[idx].t     - view_tick)}
                          y1={height0 +   hm2pt(train.coords[idx].d     - view_hm)}
                          x2={width0  + tick2pt(train.coords[idx + 1].t - view_tick)}
                          y2={height0 +   hm2pt(train.coords[idx + 1].d - view_hm)}
                          stroke={train.color} stroke-width={grid_wb}/>
                {/if}
            {/each}
        {/each}

        <!-- Mask -->
        <rect x={-margin} y={-margin} 
              width={width0 + width + 2 * margin} height={height0 + margin} fill="#FFFFFF" />
        <rect x={-margin} y={-margin} 
              width={width0 + margin}             height={height0 + height + 2 * margin} fill="#FFFFFF" />
        <rect x={-margin} y={height + height0} 
              width={width0 + width + 2 * margin} height={margin} fill="#FFFFFF" />
        <rect x={width + width0} y={-margin} 
              width={margin}                      height={height0 + height + 2 * margin} fill="#FFFFFF" />

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
