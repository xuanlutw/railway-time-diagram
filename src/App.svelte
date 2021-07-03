<script lang="ts">
    import {line_info} from './store';
    import Render      from './Render.svelte';
</script>

<h1> {$line_info.name}各級列車 </h1>
<Render />

<style>
</style>
