<script lang="ts">
    import {train_types, trains, focus_idx, focus_type, stations, tick_range, view_hm, line_name, module_name, show_item} from './store';
    import {FormGroup, Input, Label, Button, ButtonGroup, Icon}                        from 'sveltestrap';
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

    function download_svg () {
        const svg_source = document.getElementById('main_svg').outerHTML
        const link       = document.createElement('a');
        link.download    = $line_name + "各級列車.svg";
        link.href        = 'data:image/svg,' + encodeURIComponent('<?xml version="1.0" standalone="no"?> <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN" "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">' + svg_source);
        link.click();  
    }

    function copy_link () {
        const train_info = btoa(JSON.stringify($trains.map(x => x.extract()))) // base64 encoding
        const self_url   = window.location.href.split('?')[0]
        navigator.clipboard.writeText(self_url + "?module=" + $module_name + "&train_info=" + train_info)
    }

    function start_simu () {
        const train_info = btoa(JSON.stringify($trains.map(x => x.extract()))) // base64 encoding
        const self_url   = window.location.href.split('?')[0]
        window.open(self_url + "?show_item=simu&module=" + $module_name + "&train_info=" + train_info, '_blank').focus();
    }

</script>

<FormGroup >
    <ButtonGroup name="select" >
        <Button color={status == "V"? "primary": "secondary"} on:click={() => select_change_handler("V")}> 檢視 </Button>
        <Button color={status == "M"? "primary": "secondary"} on:click={() => select_change_handler("M")}> 調整 </Button>
        <Button color={status == "N"? "primary": "secondary"} on:click={() => select_change_handler("N")}> 新增 </Button>
        <Button color={status == "D"? "primary": "secondary"} on:click={() => select_change_handler("D")}> 刪除 </Button>
    </ButtonGroup>
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
    <ButtonGroup name="select" >
        <Button on:click={download_svg}> 輸出     </Button>
        <Button on:click={copy_link}   > 複製連結 </Button>
        <Button on:click={start_simu}  > 模擬     </Button>
    </ButtonGroup>
    <Button on:click={()=>window.open("https://github.com/xuanlutw/railway-time-diagram")}><Icon name="github" /></Button>
</FormGroup>

<style>
    .WTF {width: 70pt; display: inline-block;}
</style>
