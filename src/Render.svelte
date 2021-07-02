<script lang="ts">
    import {tick2min, tick2hr} from './common';
    import type {Tick, HM}     from './common';

    const tick2pt = (x: Tick) => x * 2;
    const hm2ot   = (x: HM)   => x * 2;

    const width   = 1200;
    const width0  = 50;
    const height  = 650;
    const height0 = 20;
    const margin  = 20;

    const box_w   = 6;
    const grid_wb = 2;
    const grid_ws = 1;

    const view_tick = 2500;
</script>

<svg width={width + width0 + 2 * margin} height={height + height0 + 2 * margin}
     viewBox={`${-margin} ${-margin} ${width + width0 + 2 * margin} ${height + height0 + 2 * margin}`}>

     <!-- Outer box --->
     <line x1={width0 - box_w / 2}         y1=0        
           x2={width0 + width + box_w / 2} y2=0                    stroke="#CCCCCC" stroke-width={box_w}/>
     <line x1={width0 + width}             y1={height + box_w / 2} 
           x2={width0 + width}             y2={-box_w / 2}         stroke="#CCCCCC" stroke-width={box_w}/>
     <line x1={width0 + width + box_w / 2} y1={height} 
           x2={width0 - box_w / 2}         y2={height}             stroke="#CCCCCC" stroke-width={box_w}/>
     <line x1={width0}                     y1={-box_w / 2}        
           x2={width0}                     y2={height + box_w / 2} stroke="#CCCCCC" stroke-width={box_w}/>

     <!-- Time grid -->
     {#each [...Array(5760).keys()] as t}
        {#if t % 40 == 0 && t >= view_tick && tick2pt(t - view_tick) < width}
            <line x1={width0 + tick2pt(t - view_tick)} y1=0
                  x2={width0 + tick2pt(t - view_tick)} y2={height}
                  stroke="#CCCCCC" stroke-width={(t % 240)? grid_ws: grid_wb}/>
            <text x={width0 + tick2pt(t - view_tick)} y={height + height0}> 
                  {(t % 240)? tick2min(t).toString().padStart(2, "0"): 
                              tick2hr(t).toString().padStart(2, "0") + "00"} </text>
        {/if}
    {/each}

     <text x="0" y="35"> 和仁 </text>
</svg>
