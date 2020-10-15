import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [intent, setIntent] = useState('')
  const [events, setEvents] = useState([])
  const [answer, setAnswer] = useState()
  const makingCall = useRef(false)
  const inputRef = React.useRef()

  const handleInput = (e) => {
    setSearchTerm(e.target.value)
  }

  function wait() {
    return new Promise((resolve) => {
      setTimeout(resolve, 300)
    })
  }

  function clear() {
    setSearchTerm('')
    setIntent('')
    setAnswer('')
  }

  async function getEvents() {
    const response = await fetch('/api/events')
    const events = await response.json()
    setEvents(events)
    console.log('events', events)
  }

  useEffect(() => {
    getEvents()
  }, [])

  // Throttle API calls
  useEffect(() => {
    if (!searchTerm.trim() || makingCall.current) return
    makingCall.current = true
    setTimeout(() => {
      makingCall.current = false
      wait().then(() => {
        console.log('Calling wit.ai API with', inputRef.current.value)
        fetch('/api/intents?utterance=' + inputRef.current.value).then((res) =>
          res.json().then((response) => setIntent(response.intents[0]))
        )
      })
    }, 500)
  }, [searchTerm])

  useEffect(() => {
    if (!intent || !intent.name) {
      return
    }
    // TODO: replace with 'handleIntent' function
    if (intent.name === 'calendar_next') {
      setAnswer(getNextEvent(events))
      setIntent('')
    }
  }, [intent])

  function getNextEvent(events = []) {
    const now = new Date()
    return events
      .filter((e) => e.startTime >= now.toJSON())
      .sort((a, b) => b.startTime - a.startTime)[0]
  }

  return (
    <div className="container">
      <Head>
        <title>FB community challenge 2020</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <>
        <main>
          <form className="w-full max-w-sm">
            <div className="flex items-center border-b border-teal-500 py-2">
              <input
                className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
                type="text"
                placeholder="e.g. When is my next meeting?"
                aria-label="Search input"
                value={searchTerm}
                onChange={handleInput}
                ref={inputRef}
              />
              <button
                className="flex-shrink-0 border-transparent border-4 text-teal-500 hover:text-teal-800 text-sm py-1 px-2 rounded"
                type="button"
                onClick={clear}
              >
                clear
              </button>
            </div>
          </form>

          <div>
            <pre>{JSON.stringify(answer, null, 2)}</pre>
          </div>
        </main>
      </>
    </div>
  )
}
