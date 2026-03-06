
export default async function handler(req, res) {

const response = await fetch(
"https://equations-rocket-annie-daughter.trycloudflare.com/api/actas/job/new",
{
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify(req.body)
}
)

const data = await response.json()

res.status(200).json(data)

}
