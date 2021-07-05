<script lang="ts">
    import {train_types, trains, focus_idx, focus_type, stations, tick_range, view_hm} from './store';
    import {FormGroup, Input, Label, Button}                                           from 'sveltestrap';
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
                $focus_idx = $focus_idx - 1;
                break;
            case "N":
                if (Number(dep_idx) == Number(arr_idx))
                    break;
                trains.update(x => {
                        x.push(new Train(train_name, 
                                         Number(train_type), 
                                         Number(dep_idx), 
                                         Number(arr_idx), 
                                         Array($stations.length).map(_ => false),
                                         1200));
                        return x;
                        });
                train_idx = ($trains.length - 1).toString();
                focus_handler("D");
                break;
        }
    }

    function change_handler (event: any) {
        const val = event.target.value;
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
                arr_idx     = "0";
                break;
            case "M":
            case "D":
                if (train_idx == "-1")
                    train_idx = "0";
                focus_handler(val);
                break;
        }
    }

    function focus_handler (val: "V"| "M"| "N"| "D") {
        if ($trains.length == 0)
            $focus_type = "D";
        else {
            $focus_type = (val == "M")? "M": "H";
            $focus_idx  = Number(train_idx);
            const train = $trains[train_idx];
            train_type  = train.type.toString();
            dep_idx     = train.dep_station.toString();
            arr_idx     = train.arr_station.toString();
            $view_hm    = Math.round(($stations[train.arr_station].dist + $stations[train.dep_station].dist) / 2);
            $tick_range = $tick_range.map(x => x + train.dep_t - $tick_range[0] - ((train.dep_t + 39) % 40));
        }
    }

</script>

<FormGroup >
    <div class="WTF">
        <Input type="select" name="select" bind:value={status} on:change={change_handler}>
            <option value={"V"}> 檢視 </option>
            <option value={"M"}> 調整 </option>
            <option value={"N"}> 新增 </option>
            <option value={"D"}> 刪除 </option>
        </Input>
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
            <Input type="select" disabled={status == "V"} bind:value={train_idx} on:change={_ => focus_handler(status)}>
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
    .WTF {width: 80pt; display: inline-block;}
</style>
