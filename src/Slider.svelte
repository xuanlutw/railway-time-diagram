<script lang="ts">
    import {tick2hr, tick2min}                from "./common";
    import {show_item, tick_range, tick_simu} from "./store";
    import {Button, Icon}                     from 'sveltestrap';
    import RangeSlider from "svelte-range-slider-pips";
    /* import RangeSlider from "../../svelte-range-slider-pips/src/RangeSlider.svelte"; */

    let tick_range_o = [0, 0];
    $: {
        if ($tick_range[1] - $tick_range[0] < 240) {
            if ($tick_range[0] == tick_range_o[0]) {
                $tick_range[0] = $tick_range[1] - 240;
            }
            else {
                $tick_range[1] = $tick_range[0] + 240;
            }
            tick_range_o = $tick_range;
        }
    }

    let status = false;
    setInterval(() => {
        if (status)
            $tick_simu[0] += 1
    }, 300)

</script>

{#if $show_item}
    <RangeSlider float
        range pushy bind:values={$tick_range}
        formatter={x => `${tick2hr(x)}${tick2min(x)}`}
        pips step={40} pipstep={6}
        all='label'
        min={0} max={5760}/>
{:else}
    <Button color="primary" on:click={() => status = !status}> <Icon name={status? "stop": "play"} /> </Button>
    <RangeSlider float
        bind:values={$tick_simu}
        formatter={x => `${tick2hr(x)}${tick2min(x)}`}
        pips step={1} pipstep={240}
        all='label'
        min={0} max={5760}/>
{/if}
