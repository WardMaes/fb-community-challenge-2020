const mockEvents = [
  {
    id: '1',
    name: 'Meeting in the past with John Doe',
    type: 'meeting',
    location: undefined,
    startTime: hoursOffset(-1),
    endTime: new Date(),
  },
  {
    id: '2',
    name: 'Meeting in the future with Jane Doe',
    type: 'meeting',
    location: undefined,
    startTime: hoursOffset(1),
    endTime: hoursOffset(2),
  },
]
function hoursOffset(hours: number) {
  const d = new Date()
  d.setHours(d.getHours() + hours)
  return d
}

export default async function handler(_: any, res: any) {
  return res.json(mockEvents)
}
