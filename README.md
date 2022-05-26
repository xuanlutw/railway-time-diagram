# 運行圖教學輔助程式

## [DEMO](https://www.csie.ntu.edu.tw/~r09922064/time_diagram/index.html?module=pc1)

![demo](https://user-images.githubusercontent.com/32573675/170085558-b9814dd5-d8c1-44b4-ba04-699c6952e002.png)

## Usage
上方的各按鈕功能分別如下。
+ `檢視`可以關閉其他標示，觀察運行圖本身。
+ `調整`可以利用右方下拉欄，選擇欲調整的車次。之後在圖上該車次會出現相對應的標記。點選紅色的減號可以取消停站、綠色的加號可以新增停站和藍色的箭頭可以調整停站時間。
+ `新增`可以利用右方下拉欄，選擇欲新增的列車種類、車次、起站以及訖站。之後按`確認`即可以將該車次新增到運行圖。
+ `刪除`可以利用右方下拉欄，選擇欲刪除的車次。之後按`確認`即可以將該車次從運行圖上移除。
+ `輸出`可以將現在的運行圖，以 svg 檔格式保存到本機。
+ `複製連結`可以將先在的運行圖，以連結的方式保存到剪貼簿，方便在其他機器上重現結果。

中央顯示的是運行圖之狀態，利用滑鼠可以上下以及左右滾動來調整顯示範圍。
+ 左方的縱座標顯示的是路線資料，圓圈內的數字為站內股道數量，站間的線條數量代表站間的股道數量。注意到這裡站間股道都假設為雙單線。
+ 上方的橫座標顯示的是時間，其中粗線為整點，細線為每十分鐘。
+ 中央的線條即代表每列列車之運行圖，其顏色代表種類，而車次則標注於線旁。
+ 紅色區間代表列車間有衝突，包括
  + 站內股道不足。 
  + 站間反向列車股道不足。
  + 站間同向列車時隔不足。
+ 橘黃色區間是衝突區間的延伸，用來輔助判斷衝突的位置。

下方的滑桿可以用來調整顯示的時間範圍以及尺度。

## Build from source
railway-time-diagram 是基於 [Svelte](https://github.com/sveltejs/svelte) 開發的網頁應用程式。
請先準備相對應開發環境。

之後執行以下之指令
```
git clone git@github.com:xuanlutw/railway-time-diagram.git
cd railway-time-diagram
npm install
npm run dev
```

執行完畢後，即可利用瀏覽器開啟 `127.0.0.1:5000/index.html` 進行測試與使用。

## Develop
railway-time-diagram 支援同時設定多種預設情境。

假設欲新增的情境名稱為 `name` ，則需要在 `./public` 資料夾中新增以下兩個 `json` 檔案。

1. `line_info_name.json`，這個檔案定義了該情境下的路線資料，以及列車種類。以下是一個使用範例。
```
{
    "name": "南迴線",
    "stations": [
        {
            "name":           "枋寮",
            "dist":           0,
            "n_track_in":     3,
            "n_track_inter":  1,
            "interval_cis":   12,
            "interval_trans": 1
        },
        {
            "name":           "加祿",
            "dist":           53,
            "n_track_in":     6,
            "n_track_inter":  1,
            "interval_cis":   12,
            "interval_trans": 1
        },
        {
            "name":           "內獅",
            "dist":           87,
            "n_track_in":     1,
            "n_track_inter":  1,
            "interval_cis":   12,
            "interval_trans": 1
        },
        {
            "name":           "枋山",
            "dist":           136,
            "n_track_in":     1,
            "n_track_inter":  1,
            "interval_cis":   12,
            "interval_trans": 1
        },
        {
            "name":           "枋野",
            "dist":           205,
            "n_track_in":     4,
            "n_track_inter":  1,
            "interval_cis":   12,
            "interval_trans": 1
        },
        {
            "name":           "中央號誌",
            "dist":           246,
            "n_track_in":     2,
            "n_track_inter":  2,
            "interval_cis":   12,
            "interval_trans": 1
        },
        {
            "name":           "古莊號誌",
            "dist":           405,
            "n_track_in":     4,
            "n_track_inter":  1,
            "interval_cis":   12,
            "interval_trans": 1
        },
        {
            "name":           "大武",
            "dist":           438,
            "n_track_in":     6,
            "n_track_inter":  1,
            "interval_cis":   12,
            "interval_trans": 1
        },
        {
            "name":           "瀧溪",
            "dist":           555,
            "n_track_in":     3,
            "n_track_inter":  1,
            "interval_cis":   12,
            "interval_trans": 1
        },
        {
            "name":           "金崙",
            "dist":           639,
            "n_track_in":     6,
            "n_track_inter":  1,
            "interval_cis":   12,
            "interval_trans": 1
        },
        {
            "name":           "太麻里",
            "dist":           749,
            "n_track_in":     5,
            "n_track_inter":  1,
            "interval_cis":   12,
            "interval_trans": 1
        },
        {
            "name":           "知本",
            "dist":           866,
            "n_track_in":     7,
            "n_track_inter":  1,
            "interval_cis":   12,
            "interval_trans": 1
        },
        {
            "name":           "康樂",
            "dist":           936,
            "n_track_in":     5,
            "n_track_inter":  1,
            "interval_cis":   12,
            "interval_trans": 1
        },
        {
            "name":           "臺東",
            "dist":           982,
            "n_track_in":     10,
            "n_track_inter":  1,
            "interval_cis":   12,
            "interval_trans": 1
        }
    ],
    "train_types": [
        {
            "name":     "特客甲",
            "color":    "#AA0000",
            "speed_pp": [4.16, 4.16, 4.16, 4.16, 4.16, 4.16, 4.16, 2.00, 4.16, 4.16, 4.16, 4.16, 4.16],
            "speed_sp": [3.74, 3.74, 3.74, 3.74, 3.74, 3.74, 3.74, 2.00, 3.74, 3.74, 3.74, 3.74, 3.74],
            "speed_ps": [3.74, 3.74, 3.74, 3.74, 3.74, 3.74, 3.74, 2.00, 3.74, 3.74, 3.74, 3.74, 3.74],
            "speed_ss": [3.74, 3.74, 3.74, 3.74, 3.74, 3.74, 3.74, 2.00, 3.74, 3.74, 3.74, 3.74, 3.74],
            "stop_t":   [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
        },
        {
            "name":     "貨甲",
            "color":    "#00AA00",
            "speed_pp": [3.12, 3.12, 3.12, 3.12, 3.12, 3.12, 3.12, 1.00, 3.12, 3.12, 3.12, 3.12, 3.12],
            "speed_sp": [3, 3, 3, 3, 3, 3, 3, 1.00, 3, 3, 3, 3, 3],
            "speed_ps": [3, 3, 3, 3, 3, 3, 3, 1.00, 3, 3, 3, 3, 3],
            "speed_ss": [3, 3, 3, 3, 3, 3, 3, 1.00, 3, 3, 3, 3, 3],
            "stop_t":   [20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20]
        }
    ]
}
```

2. `train_info_name.json`，這個檔案定義了該情境下的預設之列車及其參數。以下是一個使用範例。
```
[
    {
        "name":  "123", 
        "type":  0, 
        "dep_s": 0,
        "arr_s": 13, 
        "dep_t": 1400,
        "stop_t": [1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    },
    {
        "name":  "666",
        "type":  0,
        "dep_s": 13,
        "arr_s": 0,
        "dep_t": 1500,
        "stop_t": [1, 0, 0, 50, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1]
    },
    {
        "name":  "7676",
        "type":  1,
        "dep_s": 0,
        "arr_s": 8,
        "dep_t": 1350,
        "stop_t": [1, 0, 1, 1, 0, 19, 0, 8, 1, 1, 1, 1, 1, 1]
    }
]
```

新增完畢後，可以利用瀏覽器開啟 `127.0.0.1:5000/index.html?module=name` 存取該預設情境之運行圖。

##  License
MIT
