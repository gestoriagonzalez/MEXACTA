let jobID = null
let intervalo = null

document.getElementById("buscar").addEventListener("click", buscarActa)

async function buscarActa(){

const resultado = document.getElementById("resultado")

const valor = document.getElementById("valor").value
const tipo = document.getElementById("tipo").value
const estado = document.getElementById("estado").value
const buscarPor = document.getElementById("buscarPor").value

if(!valor){
resultado.innerHTML="Ingrese CURP o cadena"
return
}

let body={
type:tipo,
search:buscarPor,
state:estado,
id_req:"1"
}

if(buscarPor==="curp"){
body.Curp=valor
}

if(buscarPor==="cadena"){
body.cadena=valor
}

resultado.innerHTML="Enviando solicitud..."

try{

const response=await fetch("/api/new",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(body)
})

const data=await response.json()

jobID=data.job_id

resultado.innerHTML="Documento en proceso..."

intervalo=setInterval(checarStatus,5000)

}catch(error){

resultado.innerHTML="Error conectando con servidor"

}

}

async function checarStatus(){

const resultado=document.getElementById("resultado")

try{

const response=await fetch(`/api/status?id=${jobID}`)
const data=await response.json()

if(data.status==="COMPLETED"){

clearInterval(intervalo)

resultado.innerHTML="Acta lista, descargando..."

window.open(data.download,"_blank")

}else{

resultado.innerHTML="Buscando documento..."

}

}catch(error){

resultado.innerHTML="Error consultando estado"

}

}
