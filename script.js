let jobID = null

async function buscarActa(){

const curp = document.getElementById("curp").value
const tipo = document.getElementById("tipo").value
const estado = document.getElementById("estado").value

const response = await fetch("https://equations-rocket-annie-daughter.trycloudflare.com/api/actas/job/new",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
type:tipo,
search:"curp",
Curp:curp,
state:estado,
id_req:"1"
})
})

const data = await response.json()

jobID = data.job_id

document.getElementById("resultado").innerHTML =
"Documento en proceso...<br><button onclick='checarStatus()'>Consultar Status</button>"
}

async function checarStatus(){

const response = await fetch(
`https://equations-rocket-annie-daughter.trycloudflare.com/api/actas/job/status/${jobID}`
)

const data = await response.json()

if(data.status === "COMPLETED"){

document.getElementById("resultado").innerHTML =
`<a href="${data.download}" target="_blank">Descargar Acta</a>`

}else{

document.getElementById("resultado").innerHTML =
"El documento sigue en proceso..."

}

}