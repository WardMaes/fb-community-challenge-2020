import { Machine, assign } from 'xstate'

function invokeFetchIntent(context, event) {
  const { utterance } = context
  return fetch('/api/intents?utterance=' + utterance).then((res) =>
    res.json().then((response) => {
      if (response.intents?.length) {
        return response.intents[0]
      } else {
        throw new Error('No intents found')
      }
    })
  )
}

export const intentMachine = Machine(
  {
    id: 'intent',
    initial: 'idle',
    context: {
      utterance: null,
      intent: null,
      error: null,
    },
    states: {
      idle: {},
      loading: {
        invoke: {
          id: 'fetch-intent',
          src: invokeFetchIntent,
          onDone: {
            target: 'loaded',
            actions: 'setIntent',
          },
          onError: {
            target: 'error',
            actions: assign({ error: (context, event) => event }),
          },
        },
      },
      loaded: {},
      error: {},
    },
    on: {
      SET_UTTERANCE: {
        target: '.loading',
        actions: 'setUtterance',
      },
    },
  },
  {
    actions: {
      setUtterance: assign({
        utterance: (context, event) => event.utterance,
      }),
      setIntent: assign({
        intent: (context, event) => event,
      }),
    },
  }
)
