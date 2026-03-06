let jobID = null
let intervalo = null

async function buscarActa(){

try{

const valor = document.getElementById("valor").value
const tipo = document.getElementById("tipo").value
const estado = document.getElementById("estado").value
const buscarPor = document.getElementById("buscarPor").value

if(!valor){
document.getElementById("resultado").innerHTML = "Ingrese CURP o cadena"
return
}

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

if(!response.ok){
throw new Error("Error en la API")
}

const data = await response.json()

jobID = data.job_id

document.getElementById("resultado").innerHTML =
"Documento en proceso... revisando cada 5 segundos"

intervalo = setInterval(checarStatus,5000)

}catch(error){

document.getElementById("resultado").innerHTML =
"Error: " + error.message

}

}

async function checarStatus(){

try{

const response = await fetch(
`https://equations-rocket-annie-daughter.trycloudflare.com/api/actas/job/status/${jobID}`
)

const data = await response.json()

if(data.status === "COMPLETED"){

clearInterval(intervalo)

document.getElementById("resultado").innerHTML =
"Acta lista. Descargando..."

window.open(data.download,"_blank")

}else if(data.status === "PENDING"){

document.getElementById("resultado").innerHTML =
"Documento en proceso... esperando respuesta"

}else{

clearInterval(intervalo)

document.getElementById("resultado").innerHTML =
"No fue posible obtener el documento"

}

}catch(error){

document.getElementById("resultado").innerHTML =
"Error consultando status"

}

}
