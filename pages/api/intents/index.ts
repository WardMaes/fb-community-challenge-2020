const endpoint = 'https://api.wit.ai/'

export default async function handler(req: any, res: any) {
  const { utterance } = req.query

  const response = await fetch(endpoint + 'message?q=' + utterance, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + process.env.WIT_AI_SERVER_TOKEN,
    },
  })
  const intent = await response.json()

  console.log('intent', intent)

  res.json(intent)
}
