<script lang="ts">
    import {line_name} from './store';
    import Render      from './Render.svelte';
    import Slider      from './Slider.svelte';
    import Selector    from './Selector.svelte';
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
