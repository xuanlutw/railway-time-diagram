<script lang="ts">
    import {tick2min, tick2hr} from './common';
    import {tick_range}        from './store';
    import RangeSlider         from "svelte-range-slider-pips";

    let tick_range_o = [0, 0];
    $: {
        if ($tick_range[1] - $tick_range[0] > 480) {
            if ($tick_range[0] == tick_range_o[0]) {
                $tick_range[0] = $tick_range[1] - 480;
            }
            else {
                $tick_range[1] = $tick_range[0] + 480;
            }
            tick_range_o = $tick_range;
        }
    }
</script>

<RangeSlider float
    range pushy bind:values={$tick_range}
    formatter={x => `${tick2hr(x)}${tick2min(x)}`}
    pips step={40} pipstep={6}
    all='label'
    min={0} max={5760}/>
