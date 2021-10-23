<script lang="ts">
    import {line_name} from './store';
    import Render      from './Render.svelte';
    import Slider      from './Slider.svelte';
    import Selector    from './Selector.svelte';
    import Simulate    from './Simulate.svelte';
</script>

<svelte:head>
	<title> {$line_name}各級列車 - 運行圖 </title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.6.1/font/bootstrap-icons.css">
</svelte:head>

<div class=out>
    <h1 class=left> {$line_name}各級列車 </h1>

    <div class=right>
        <Selector />
    </div>
</div>

<Render />
<Slider />
<Simulate />

<style>
    .out {
        margin: 0;
        margin-top: 20px;
        vertical-align: middle;
    }
    .left  {
        margin:     0;
        display:    inline-block;
        text-align: center;
        width:      25%; 
    }
    .right {
        margin:  0;
        display: inline-block;
        width:   70%;
    }
</style>
