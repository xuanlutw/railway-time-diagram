<script lang="ts">
    import {train_types, trains, focus_idx, focus_type, stations, tick_range, view_hm} from './store';
    import {FormGroup, Input, Label, Button, ButtonGroup}                              from 'sveltestrap';
    import {Train}                                                                     from './train';

    let status: "V"| "M"| "N"| "D" = "V";
    let train_type = "0";
    let train_name = "";
    let train_idx  = "0";
    let dep_idx    = "0";
    let arr_idx    = "0";

    function click_handler () {
        switch (status) {
            case "D":
                trains.update(x => {x.splice($focus_idx, 1); return x;});
                train_idx = (($focus_idx == 0)? 0: $focus_idx - 1).toString();
                /*train_change_handler(train_idx =, "D");*/
                train_change_handler(train_idx, "D");
                break;
            case "N":
                if (train_name == "" || Number(dep_idx) == Number(arr_idx))
                    break;
                trains.update(x => {
                        x.push(new Train(train_name, 
                                         Number(train_type), 
                                         Number(dep_idx), 
                                         Number(arr_idx), 
                                         1200,
                                         $train_types[Number(train_type)].stop_t));
                        return x;
                        });
                train_idx = ($trains.length - 1).toString();
                select_change_handler("N");
                train_change_handler(train_idx, "D");
                break;
        }
    }

    function select_change_handler (val: "V"| "M"| "N"| "D") {
        status = val
        switch (val) {
            case "V":
                $focus_type = "D";
                train_idx   = "-1";
                train_type  = "-1";
                dep_idx     = "-1";
                arr_idx     = "-1";
                break;
            case "N":
                $focus_type = "D";
                train_name  = "";
                train_type  = "0";
                dep_idx     = "0";
                arr_idx     = ($stations.length - 1).toString();
                break;
            case "M":
            case "D":
                if (train_idx == "-1")
                    train_idx = "0";
                train_change_handler(train_idx, val);
                break;
        }
    }

    function train_change_handler (val: string, val_s: "V"| "M"| "N"| "D") {
        if ($trains.length == 0)
            $focus_type = "D";
        else {
            $focus_type = (val_s == "M")? "M": "H";
            $focus_idx  = Number(val);
            const train = $trains[$focus_idx];
            train_type  = train.type.toString();
            dep_idx     = train.dep_s.toString();
            arr_idx     = train.arr_s.toString();
            /* $view_hm    = Math.round(($stations[train.arr_s].dist + $stations[train.dep_s].dist) / 2); */
            /* $tick_range = $tick_range.map(x => x + train.dep_t - $tick_range[0] - ((train.dep_t + 39) % 40)); */
        }
    }

</script>

<FormGroup >
    <div class="WTF0">
        <ButtonGroup name="select" >
            <Button color={status == "V"? "primary": "secondary"} on:click={() => select_change_handler("V")}> 檢視 </Button>
            <Button color={status == "M"? "primary": "secondary"} on:click={() => select_change_handler("M")}> 調整 </Button>
            <Button color={status == "N"? "primary": "secondary"} on:click={() => select_change_handler("N")}> 新增 </Button>
            <Button color={status == "D"? "primary": "secondary"} on:click={() => select_change_handler("D")}> 刪除 </Button>
        </ButtonGroup>
    </div>
    <div class="WTF">
        <Input type="select" disabled={status != "N"} bind:value={train_type}>
            {#if status == "V"}
                <option value=-1> --- </option>
            {/if}
            {#each $train_types as item, n}
                <option value={n.toString()}> {item.name} </option>
            {/each}
        </Input>
    </div>
    <div class="WTF">
        {#if status == "N"}
            <Input type="text" placeholder="車次" bind:value={train_name}/>
        {:else}
            <Input type="select" disabled={status == "V"} bind:value={train_idx} on:change={e => train_change_handler(e.target.value, status)}>
                {#if status == "V"}
                    <option value=-1> --- </option>
                {/if}
                {#each $trains as item, n}
                    <option value={n.toString()}> {item.name} </option>
                {/each}
            </Input>
        {/if}
    </div>
    <Label> 從 </Label>
    <div class="WTF">
        <Input type="select" disabled={status != "N"} bind:value={dep_idx}>
            {#if status == "V"}
                <option value=-1> --- </option>
            {/if}
            {#each $stations as item, n}
                <option value={n.toString()}> {item.name} </option>
            {/each}
        </Input>
    </div>
    <Label> 到 </Label>
    <div class="WTF">
        <Input type="select" disabled={status != "N"} bind:value={arr_idx}>
            {#if status == "V"}
                <option value=-1> --- </option>
            {/if}
            {#each $stations as item, n}
                <option value={n.toString()}> {item.name} </option>
            {/each}
        </Input>
    </div>
    <Button disabled={status == "V" || status == "M"} on:click={click_handler}> 確認 </Button>
</FormGroup>

<style>
    .WTF0 {width: 180pt; display: inline-block;}
    .WTF  {width:  90pt; display: inline-block;}
</style>
