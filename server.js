<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Easy Travel Planner Global PRO</title>

<style>
body{margin:0;font-family:Arial;background:#eef1f7}
header{background:#0d47a1;color:white;padding:15px;text-align:center;font-size:22px}
.container{max-width:1000px;margin:auto;padding:20px}
input,button{width:100%;padding:10px;margin:8px 0;font-size:15px;border-radius:6px;border:1px solid #ccc}
button{background:#0d47a1;color:white;border:none;cursor:pointer}
button:hover{opacity:0.9}
.card{background:white;padding:15px;margin-top:20px;border-radius:8px;box-shadow:0 4px 10px rgba(0,0,0,0.1)}
.section-title{font-size:18px;font-weight:bold;margin-bottom:8px}
.hidden{display:none}
.price{float:right;font-weight:bold;color:#0d47a1}
.total{font-size:20px;font-weight:bold;margin-top:10px}
.download-btn{background:#2e7d32;margin-top:15px}
</style>
</head>

<body>

<header>Easy Travel Planner — Global PRO</header>

<div class="container" id="pantalla1">

<h3>Planifica tu viaje</h3>

<input type="text" id="origen" placeholder="Desde dónde sales">
<input type="text" id="destino" placeholder="Destino (Roma, Paris, Tokyo...)">
<input type="date" id="fechaSalida">
<input type="number" id="dias" placeholder="Número de días">
<input type="number" id="personas" placeholder="Número de personas">

<button onclick="generarViaje()">Generar Viaje</button>

</div>

<div class="container hidden" id="pantalla2">
<h2 id="tituloViaje"></h2>
<div id="resultado"></div>
<button class="download-btn" onclick="descargarPDF()">Descargar Planning en PDF</button>
<button onclick="volver()">← Volver</button>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

<script>

function normalizar(text){
return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
}

function multiplicadorTemporada(fecha){
let mes=new Date(fecha).getMonth()+1;
if([6,7,8].includes(mes)) return 1.35;
if([4,5,9,10].includes(mes)) return 1.15;
return 0.9;
}

/* ======================================================
   BASE COMPLETA (estructura tipo Roma en TODAS)
====================================================== */

const ciudades={

roma:{
pais:"Italia",
actividades:[
[
{nombre:"Coliseo",precio:25,zona:"Centro"},
{nombre:"Foro Romano",precio:18,zona:"Centro"},
{nombre:"Plaza Venecia",precio:0,zona:"Centro"}
],
[
{nombre:"Museos Vaticanos",precio:30,zona:"Vaticano"},
{nombre:"Basílica de San Pedro",precio:0,zona:"Vaticano"},
{nombre:"Castillo Sant'Angelo",precio:20,zona:"Vaticano"}
]
],
restaurantes:{
"Centro":"La Taverna dei Fori Imperiali",
"Vaticano":"Il Sorpasso"
}
},

paris:{
pais:"Francia",
actividades:[
[
{nombre:"Torre Eiffel",precio:28,zona:"Centro"},
{nombre:"Arco del Triunfo",precio:16,zona:"Centro"},
{nombre:"Campos Elíseos",precio:0,zona:"Centro"}
],
[
{nombre:"Museo del Louvre",precio:20,zona:"Louvre"},
{nombre:"Notre Dame",precio:0,zona:"Louvre"},
{nombre:"Montmartre",precio:0,zona:"Montmartre"}
]
],
restaurantes:{
"Centro":"Le Jules Verne",
"Louvre":"Café Marly",
"Montmartre":"La Maison Rose"
}
},

tokyo:{
pais:"Japón",
actividades:[
[
{nombre:"Templo Senso-ji",precio:0,zona:"Asakusa"},
{nombre:"Tokyo Skytree",precio:18,zona:"Sumida"},
{nombre:"Mercado Tsukiji",precio:0,zona:"Chuo"}
],
[
{nombre:"Cruce Shibuya",precio:0,zona:"Shibuya"},
{nombre:"Santuario Meiji",precio:0,zona:"Shibuya"},
{nombre:"Akihabara",precio:0,zona:"Akihabara"}
]
],
restaurantes:{
"Asakusa":"Daikokuya Tempura",
"Sumida":"Sky Restaurant 634",
"Shibuya":"Uobei Sushi",
"Akihabara":"Gyukatsu Motomura"
}
}

};

/* ======================================================
   GENERADOR
====================================================== */

let planningTexto="";

function generarViaje(){

let origen=document.getElementById("origen").value;
let destinoOriginal=document.getElementById("destino").value;
let destino=normalizar(destinoOriginal);
let fecha=document.getElementById("fechaSalida").value;
let dias=parseInt(document.getElementById("dias").value);
let personas=parseInt(document.getElementById("personas").value);

if(!origen||!destino||!fecha||!dias||!personas){
alert("Completa todos los campos");
return;
}

let ciudad=ciudades[destino];
if(!ciudad){
alert("Ciudad no disponible aún.");
return;
}

let mult=multiplicadorTemporada(fecha);
let html="";
planningTexto=`Viaje ${origen} → ${destinoOriginal}\n\n`;
let total=0;

for(let i=0;i<dias;i++){

html+=`<div class="card"><div class="section-title">Día ${i+1}</div>`;
planningTexto+=`\nDía ${i+1}\n`;

if(i===dias-1){

let restaurante=Object.values(ciudad.restaurantes)[0];
let precioCena=45*personas;
total+=precioCena;

html+=`
<p>10:00 Día libre</p>
<p>21:00 Cena en ${restaurante}
<span class="price">€${precioCena}</span></p>
`;

planningTexto+=`10:00 Día libre\n21:00 Cena en ${restaurante} €${precioCena}\n`;

}else{

let bloque=ciudad.actividades[i % ciudad.actividades.length];
let hora=10;
let ultimaZona="Centro";

bloque.forEach(act=>{
let precioFinal=Math.round(act.precio*personas*mult);
total+=precioFinal;
ultimaZona=act.zona;

html+=`
<p>${hora}:00 ${act.nombre}
<span class="price">€${precioFinal}</span></p>
`;

planningTexto+=`${hora}:00 ${act.nombre} €${precioFinal}\n`;
hora+=3;
});

let restaurante=ciudad.restaurantes[ultimaZona];
let precioCena=45*personas;
total+=precioCena;

html+=`
<p>21:00 Cena en ${restaurante}
<span class="price">€${precioCena}</span></p>
`;

planningTexto+=`21:00 Cena en ${restaurante} €${precioCena}\n`;
}

html+=`</div>`;
}

planningTexto+=`\nTOTAL ESTIMADO: €${total}`;

document.getElementById("pantalla1").classList.add("hidden");
document.getElementById("pantalla2").classList.remove("hidden");

document.getElementById("tituloViaje").innerHTML=
`Viaje ${origen} → ${destinoOriginal} (${dias} días)`;

document.getElementById("resultado").innerHTML=
html+
`
<div class="card">
<p class="total">TOTAL ESTIMADO: €${total}</p>
</div>
`;

}

function descargarPDF(){
const { jsPDF } = window.jspdf;
const doc = new jsPDF();
doc.text(planningTexto,10,10);
doc.save("planning-viaje.pdf");
}

function volver(){
document.getElementById("pantalla2").classList.add("hidden");
document.getElementById("pantalla1").classList.remove("hidden");
}

</script>

</body>
</html>
