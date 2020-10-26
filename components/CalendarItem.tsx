import React from 'react'

type CalenderItemProps = {
  item: {
    id: string
    type: string
    name: string
    startTime: string
    endTime: string
  }
}

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function doubleDigits(digit: number): string {
  return digit < 10 ? '0' + digit : digit.toString()
}

function formatDate(dateStr: string) {
  const start = new Date(dateStr)
  const weekdayNr = start.getDay()
  const day = start.getDate()
  const monthNr = start.getMonth()
  const month = months[monthNr]

  return `${weekdays[weekdayNr]}, ${day} ${month}`
}

function formatTime(startStr: string, endStr: string) {
  const start = new Date(startStr)
  const end = new Date(endStr)
  const startTime = `${doubleDigits(start.getHours())}:${doubleDigits(start.getMinutes())}`
  const endTime = `${doubleDigits(end.getHours())}:${doubleDigits(end.getMinutes())}`

  return `${startTime}-${endTime}`
}

const CalendarItem = ({ item }: CalenderItemProps) => {
  if (!item) {
    return <div />
  }
  switch (item.type) {
    case 'meeting':
      return (
        <div>
          <h2 className="text-gray-800 font-semibold">{item.name}</h2>
          <div>
            <span className="text-gray-800">{formatDate(item.startTime)} </span>
            <span className="text-gray-600 text-opacity-75 font-thin">
              {formatTime(item.startTime, item.endTime)}
            </span>
          </div>
        </div>
      )
  
    default:
      return <div />
  }

  return (
    <div>
      
    </div>
  )
}

export default CalendarItem
