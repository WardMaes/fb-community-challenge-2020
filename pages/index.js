import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useMachine } from '@xstate/react'

import { intentMachine } from '../machines/intent'

import QuickReply from '../components/QuickReply'

export default function Home() {
  const [current, send] = useMachine(intentMachine)
  const { intent } = current.context

  const [events, setEvents] = useState([])
  const [quickReplies, setQuickReplies] = useState([])
  const [answer, setAnswer] = useState()
  const inputRef = React.useRef()

  function clear() {
    console.log('TODO: send RESET event')
  }

  async function getEvents() {
    const response = await fetch('/api/events')
    const events = await response.json()
    setEvents(events)
  }

  useEffect(() => {
    getEvents()
  }, [])

  useEffect(() => {
    if (!intent || !intent.data) {
      return
    }
    handleIntent(intent.data)
  }, [intent])

  function handleIntent(intent) {
    switch (intent.name) {
      case 'calendar_next':
        setQuickReplies([
          {
            title: 'Next calendar item',
            onClick: () => setAnswer(getNextEvent(events)),
          },
        ])
        break
      case 'calendar_previous':
        setQuickReplies([
          {
            title: 'Previous calendar item',
            onClick: () => setAnswer(getPreviousEvent(events)),
          },
        ])
        break
      case 'calendar_new':
        setQuickReplies([
          {
            title: 'Create new event',
            onClick: () => console.log('TODO: create new event'),
          },
        ])
        break
      default:
        break
    }
  }

  function getPreviousEvent(events = []) {
    const now = new Date()
    return events
      .filter((e) => e.startTime <= now.toJSON())
      .sort((a, b) => a.startTime - b.startTime)[0]
  }

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
        <main className="max-w-sm mx-auto">
          <div>
            <pre>State: {JSON.stringify(current.value, null, 2)}</pre>
            <pre>Context: {JSON.stringify(current.context, null, 2)}</pre>
            <pre>Answer: {JSON.stringify(answer, null, 2)}</pre>
          </div>

          {current.value === 'error' && (
            <p>Error: {JSON.stringify(current.context.error, null, 2)}</p>
          )}

          <div>
            {quickReplies.map((qr, i) => (
              <QuickReply {...qr} index={i} />
            ))}
          </div>

          <form className="min-w-full absolute bottom-0 right-0 left-0 m-4">
            <div className="flex items-center border-b border-teal-500 py-2 max-w-sm mx-auto">
              <input
                className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
                type="text"
                placeholder="e.g. When is my next meeting?"
                aria-label="Search input"
                onChange={(e) =>
                  send('SET_UTTERANCE', { utterance: e.target.value })
                }
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
        </main>
      </>
    </div>
  )
}
