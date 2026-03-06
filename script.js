let jobID = null
let intervalo = null

async function buscarActa(){

const valor = document.getElementById("valor").value
const tipo = document.getElementById("tipo").value
const estado = document.getElementById("estado").value
const buscarPor = document.getElementById("buscarPor").value

let body = {
type: tipo,
search: buscarPor,
state: estado,
id_req:"1"
}

if(buscarPor === "curp"){
body.Curp = valor
}

if(buscarPor === "cadena"){
body.cadena = valor
}

document.getElementById("resultado").innerHTML = "Enviando solicitud..."

const response = await fetch("https://equations-rocket-annie-daughter.trycloudflare.com/api/actas/job/new",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(body)
})

const data = await response.json()

jobID = data.job_id

document.getElementById("resultado").innerHTML =
"Documento en proceso... esperando respuesta del Registro Civil"

intervalo = setInterval(checarStatus,5000)

}

async function checarStatus(){

const response = await fetch(
`https://equations-rocket-annie-daughter.trycloudflare.com/api/actas/job/status/${jobID}`
)

const data = await response.json()

if(data.status === "COMPLETED"){

clearInterval(intervalo)

document.getElementById("resultado").innerHTML =
"Acta encontrada. Descargando..."

window.location.href = data.download

}else if(data.status === "PENDING"){

document.getElementById("resultado").innerHTML =
"El documento sigue en proceso... revisando automáticamente"

}else{

clearInterval(intervalo)

document.getElementById("resultado").innerHTML =
"No fue posible obtener el documento"

}

}

