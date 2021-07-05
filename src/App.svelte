<script lang="ts">
    import {line_name, train_types, trains} from './store';
    import Render                           from './Render.svelte';
    import Slider                           from './Slider.svelte';
    import Selector                         from './Selector.svelte';
    import {Train}                          from './train';

    // Add test trains
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
    }

</script>

<svelte:head>
	<title> 運行圖 </title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css">
</svelte:head>

<div class=left>
    <h1> {$line_name}各級列車 </h1>
</div>

<div class=right>
    <Selector />
</div>

<Render />
<Slider />

<style>
    .left  {
        margin-top: 20px;
        display:    inline-block;
        text-align: center;
        width:      30%; 
    }
    .right {
        display: inline-block;
        width:   60%;
    }
</style>
