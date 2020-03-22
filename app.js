'use strict';
//モジュールの呼び出し
const fs = require('fs');
const readline = require('readline');

//ファイル読み込みストリーム生成
const rs = fs.createReadStream('./popu-pref.csv');
//ファイルを１行ずつ読みこむオブジェクト
const rl = readline.createInterface({ 'input': rs, 'output': {} });
// key: 都道府県 value: 集計データのオブジェクト
const prefectureDataMap = new Map();

//lineイベント実行時の処理関数
rl.on('line', (lineString) => {
    //項目ごとに配列に格納
    const columns = lineString.split(',');
    //配列の要素を変数に格納
    const year = parseInt(columns[0]);  //年
    const prefecture = columns[1];      //県
    const popu = parseInt(columns[3]);  //人口

    //2010年または2015年のデータを配列に格納
    if (year === 2010 || year === 2015) {
        let value = prefectureDataMap.get(prefecture);
        if (!value) {
            //処理対象県のデータが配列に存在しない場合
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
        if (year === 2010) {
            //2010年のデータの場合
            value.popu10 = popu;
        }
        if (year === 2015) {
            //2015年のデータの場合
            value.popu15 = popu;
        }
        //集計データの配列に値を設定
        prefectureDataMap.set(prefecture, value);
    }
});

//closeイベント実行時の処理関数
rl.on('close', () => {
    //変化率の計算
    for (let [key, value] of prefectureDataMap) {
        value.change = value.popu15 / value.popu10;
    }
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        //変化率の降順に並び替え
        return pair2[1].change - pair1[1].change;
    });
    //出力書式の設定
    const rankingStrings = rankingArray.map(([key, value]) => {
        return key + ': ' + value.popu10 + '=>' + value.popu15 + ' 変化率:' + value.change;
    });
    //データの出力
    console.log(rankingStrings);
});

