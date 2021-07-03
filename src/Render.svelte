<script lang="ts">
    import {tick2min, tick2hr} from './common';
    import type {Tick, HM}     from './common';
    import {line_info}         from './store';

    const tick2pt = (x: Tick) => x * 2;
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
        console.log(event.deltaY, event.deltaX);
        view_tick += event.deltaX;
        view_hm   += event.deltaY / 10;
    }
</script>

<div on:wheel={wheel_handler}>
    <svg width={width + width0 + 2 * margin} height={height + height0 + 2 * margin}
         viewBox={`${-margin} ${-margin} ${width + width0 + 2 * margin} ${height + height0 + 2 * margin}`}>

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

        <!-- Time grid -->
        {#each [...Array(5760).keys()] as t}
            {#if t % 40 == 0 && t >= view_tick && tick2pt(t - view_tick) < width}
                <line x1={width0 + tick2pt(t - view_tick)} y1={height0}
                      x2={width0 + tick2pt(t - view_tick)} y2={height0 + height}
                      stroke="#CCCCCC" stroke-width={(t % 240)? grid_ws: grid_wb}/>
                <text x={width0 + tick2pt(t - view_tick)} y={height0 - box_w}> 
                      {(t % 240)? tick2min(t).toString().padStart(2, "0"): 
                                  tick2hr(t).toString().padStart(2, "0") + "00"} </text>
            {/if}
        {/each}

        <!-- Station grid -->
        {#each $line_info.stations as s}
            {#if s.distance >= view_hm && hm2pt(s.distance - view_hm) < height}
                <line x1={width0}         y1={height0 + hm2pt(s.distance - view_hm)}
                      x2={width0 + width} y2={height0 + hm2pt(s.distance - view_hm)}
                      stroke="#CCCCCC" stroke-width={grid_wb}/>
                <text x=0 y={height0 + hm2pt(s.distance - view_hm)}> {s.name} </text>
            {/if}
        {/each}
    </svg>
</div>
