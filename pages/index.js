import Head from 'next/head'
import { useRef } from 'react'
import { useMachine } from '@xstate/react'

import { intentMachine } from '../machines/intent'

import QuickReply from '../components/QuickReply'

export default function Home() {
  const [current, send] = useMachine(intentMachine)
  const { intent, quickReplies, events, calenderItem, error } = current.context
  const inputRef = useRef(null)

  function clear() {
    send('RESET')
    inputRef.current.value = ''
    inputRef.current.focus()
  }

  return (
    <div className="container h-full flex flex-col">
      <Head>
        <title>FB community challenge 2020</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <>
        <main className="max-w-lg mx-auto w-full flex h-full border p-8 from-gray-500">
          <div className="flex flex-col flex-1 h-full w-full">
            {current.matches('error') && (
              <p>Error: {JSON.stringify(error, null, 2)}</p>
            )}

            {current.matches('loaded') && (
              <>
                <pre className="flex-1">
                  {JSON.stringify(calenderItem, null, 2)}
                </pre>
                <div className="grid grid-cols-2 auto-rows-fr gap-2">
                  {quickReplies.map((qr, i) => (
                    <div key={qr.id} className="flex justify-center">
                      <QuickReply {...qr} onClick={() => send(qr.event, {})} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <form className="min-w-full">
            <div className="flex items-center border-b border-teal-500 py-2 mx-auto">
              <input
                className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
                type="text"
                placeholder="e.g. When is my next meeting?"
                aria-label="Search input"
                ref={inputRef}
                onChange={(e) =>
                  send('SET_UTTERANCE', { utterance: e.target.value })
                }
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
