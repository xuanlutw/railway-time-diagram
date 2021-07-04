<script lang="ts">
    import {line_name, train_types, trains, focus_train_num}      from './store';
    import Render                                                 from './Render.svelte';
    import Slider                                                 from './Slider.svelte';
    import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'sveltestrap';
    import {Train}                                                from './train';

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
        focus_train_num.update(_ => 0);
    }

</script>

<svelte:head>
	<title> 運行圖 </title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
</svelte:head>

<h1> {$line_name}各級列車 </h1>

<Dropdown>
    <DropdownToggle caret> 
        {$focus_train_num >= 0? `${$trains[$focus_train_num].type_name}-${$trains[$focus_train_num].name}`: "View"}
    </DropdownToggle>
    <DropdownMenu>
        <DropdownItem on:click={() => $focus_train_num = -1}> View </DropdownItem>
        {#each $trains as train, n}
            <DropdownItem on:click={() => $focus_train_num = n}>
                {`${train.type_name}-${train.name}`}
            </DropdownItem>
        {/each}
  </DropdownMenu>
</Dropdown>

<Render />
<Slider />

<style>
</style>
