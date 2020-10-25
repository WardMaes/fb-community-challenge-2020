import { Machine, assign } from 'xstate'
import { v4 as uuidv4 } from 'uuid'

const initialContext = {
  utterance: null,
  intent: null,
  error: null,
  quickReplies: [],
  events: [],
  calenderItem: null,
}

function invokeFetchIntent(context) {
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

async function invokeFetchEvents() {
  const response = await fetch('/api/events')
  const events = await response.json()
  return events
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

function getQuickReplies(event) {
  const {
    data: { name },
  } = event
  switch (name) {
    case 'calendar_next':
      return [
        {
          id: uuidv4(),
          title: 'Next calendar item',
          event: 'SHOW_NEXT',
        },
      ]
    case 'calendar_previous':
      return [
        {
          id: uuidv4(),
          title: 'Did I miss anything?',
          event: 'SHOW_PREVIOUS',
        },
        {
          id: uuidv4(),
          title: 'What was my previous appointment?',
          event: 'SHOW_PREVIOUS',
        },
        {
          id: uuidv4(),
          title: 'Did I have a meeting?',
          event: 'SHOW_PREVIOUS',
        },
      ]
    case 'calendar_new':
      return [
        {
          id: uuidv4(),
          title: 'Create new event',
          event: 'SHOW_NEW',
        },
      ]
    default:
      break
  }
}

export const intentMachine = Machine(
  {
    id: 'intent',
    initial: 'idle',
    context: initialContext,
    states: {
      idle: {
        invoke: {
          id: 'fetch-events',
          src: invokeFetchEvents,
          onDone: {
            actions: 'setEvents',
          },
          onError: {
            target: 'error',
            actions: 'setError',
          },
        },
      },
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
            actions: 'setError',
          },
        },
      },
      loaded: {
        entry: 'getQuickReplies',
        on: {
          SHOW_NEXT: {
            actions: ['getNextEvent', 'resetQuickReplies'],
          },
          SHOW_PREVIOUS: {
            actions: ['getPreviousEvent', 'resetQuickReplies'],
          },
          SHOW_NEW: {
            actions: console.log('TODO: SHOW_NEW'),
          },
        },
      },
      error: {},
    },
    on: {
      SET_UTTERANCE: {
        target: '.loading',
        actions: 'setUtterance',
      },
      RESET: {
        target: 'idle',
        actions: 'reset',
      },
    },
  },
  {
    actions: {
      getQuickReplies: assign({
        quickReplies: (_, event) => getQuickReplies(event),
      }),
      setEvents: assign({
        events: (_, event) => event.data,
      }),
      setUtterance: assign({
        utterance: (_, event) => event.utterance,
      }),
      setIntent: assign({
        intent: (_, event) => event,
      }),
      clearError: assign({
        error: null,
      }),
      reset: assign(initialContext),
      getNextEvent: assign({
        calenderItem: (context, event) => getNextEvent(context.events),
      }),
      getPreviousEvent: assign({
        calenderItem: (context, event) => getPreviousEvent(context.events),
      }),
      setError: assign({ error: (_, event) => event }),
      resetQuickReplies: assign({
        quickReplies: []
      })
    },
  }
)
