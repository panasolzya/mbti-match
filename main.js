
const baseTypes = [
"INTJ","INTP","ENTJ","ENTP",
"INFJ","INFP","ENFJ","ENFP",
"ISTJ","ISFJ","ESTJ","ESFJ",
"ISTP","ISFP","ESTP","ESFP"
];

let advancedEnabled = false;

const select1 = document.getElementById("type1");
const select2 = document.getElementById("type2");

/* =========================
   タイプ生成
========================= */

function getTypes(){

if(advancedEnabled){

const list = [];

baseTypes.forEach(t=>{
list.push(t + "-A");
list.push(t + "-T");
});

return list;

}

return baseTypes;

}

/* =========================
   セレクト更新
========================= */

function updateSelects(){

select1.innerHTML = "";
select2.innerHTML = "";

const types = getTypes();

types.forEach(type=>{

const op1 = document.createElement("option");
op1.value = type;
op1.innerText = type;
select1.appendChild(op1);

const op2 = document.createElement("option");
op2.value = type;
op2.innerText = type;
select2.appendChild(op2);

});

select1.value = advancedEnabled ? "INFP-A" : "INFP";
select2.value = advancedEnabled ? "ENFJ-T" : "ENFJ";

}

/* 初期化 */
updateSelects();

/* =========================
   相性ロジック
========================= */

function getCompatibility(type1,type2){

let seed = 0;
const combined = [type1,type2].sort().join("");

for(let i=0;i<combined.length;i++){
seed += combined.charCodeAt(i);
}

let romance = 60 + (seed % 41);
let friendship = 55 + (seed % 41);
let longTerm = 50 + (seed % 46);
let emotional = 65 + (seed % 31);
let trust = 60 + (seed % 36);

/* 32タイプ補正 */
if(advancedEnabled){

const isT1 = type1.includes("-T");
const isT2 = type2.includes("-T");

if(isT1 && isT2) emotional += 8;
if(!isT1 && !isT2) friendship += 5;
if(isT1 !== isT2) longTerm -= 5;

}

return {romance, friendship, longTerm, emotional, trust};

}

/* =========================
   グラフ
========================= */

const radarChart = new Chart(
document.getElementById("radarChart"),
{
type:'radar',
data:{
labels:['感情','恋愛','友情','信頼','長続き'],
datasets:[{
label:'相性',
data:[70,70,70,70,70]
}]
},
options:{
responsive:true,
plugins:{
legend:{labels:{color:'white'}}
},
scales:{
r:{
min:0,
max:100,
ticks:{color:'white',backdropColor:'transparent'},
pointLabels:{color:'white'},
grid:{color:'rgba(255,255,255,.18)'},
angleLines:{color:'rgba(255,255,255,.18)'}
}
}
}
}
);

/* =========================
   診断実行
========================= */

function startTest(){

const type1 = select1.value;
const type2 = select2.value;

const result = getCompatibility(type1,type2);

/* %アニメ */
let current = 0;
const target = result.romance;

const percent = document.getElementById("percent");

const interval = setInterval(()=>{

current++;
percent.innerText = current + "%";

if(current >= target){
clearInterval(interval);
}

},12);

/* ランク */
let rank = "C";

if(result.romance >= 95) rank = "SS";
else if(result.romance >= 85) rank = "S";
else if(result.romance >= 75) rank = "A";
else if(result.romance >= 65) rank = "B";

document.getElementById("rank").innerText = "相性 " + rank;

/* テキスト */
document.getElementById("loveText").innerText =
`${result.romance}%`;

document.getElementById("friendText").innerText =
`${result.friendship}%`;

document.getElementById("longText").innerText =
`${result.longTerm}%`;

document.getElementById("warnText").innerText =
(result.romance >= 90)
? "依存注意"
: "バランス意識大事";

/* グラフ更新 */
radarChart.data.datasets[0].data = [
result.emotional,
result.romance,
result.friendship,
result.trust,
result.longTerm
];

radarChart.update();

}

/* =========================
   シェア機能
========================= */

async function shareResult(){

const type1 = select1.value;
const type2 = select2.value;

const shareUrl =
`${location.origin}${location.pathname}?t1=${encodeURIComponent(type1)}&t2=${encodeURIComponent(type2)}&adv=${advancedEnabled ? 1 : 0}`;

const text =
`💘 MBTI相性診断

${type1} × ${type2}

💯 ${document.getElementById("percent").innerText}
🏷 ${document.getElementById("rank").innerText}

相性の詳細はこちら▼`;

if(navigator.share){

await navigator.share({
title:"MBTI相性診断",
text,
url:shareUrl
});

}else{

await navigator.clipboard.writeText(text + "\n" + shareUrl);
alert("コピーしたよ！");
}

}

/* =========================
   URL復元（重要）
========================= */

window.addEventListener("load", () => {

const params = new URLSearchParams(location.search);

const t1 = params.get("t1");
const t2 = params.get("t2");
const adv = params.get("adv");

if(adv === "1"){
advancedEnabled = true;
document.getElementById("advancedMode").checked = true;
updateSelects();
}

if(t1) select1.value = t1;
if(t2) select2.value = t2;

if(t1 && t2){
startTest();
}

});



