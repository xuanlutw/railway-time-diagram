<script lang="ts">
    import {line_name} from './store';
    import Render      from './Render.svelte';
</script>

<h1> {$line_name}各級列車 </h1>
<Render />

<style>
</style>
