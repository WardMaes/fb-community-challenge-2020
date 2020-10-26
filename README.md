# Facebook community challenge 2020

## What

This React application is made within the context of the Facebook Community Challenge Hackathon 2020. The goal is to create a comprehensive tutorial, explaining how to build stuff with Facebook technologies. 

This application allows the user to ask questions about his/her calendar items. The application will provide suggestions, even when the user hasn't finished typing a full question. This way, the application proactively proposes the answer to the user's question. 

[Link to demo](https://fb-community-challenge-2020.vercel.app/)

### Used technologies 

#### React 
This project uses [React](https://reactjs.org/) as frontend library to create the user interface, combined with [TailwindCSS](https://tailwindcss.com/). 
[XState](https://xstate.js.org/) is used for handling the state throughout the application. 
The [NextJS](https://nextjs.org/) framework provides server-side rendering, bundling, route pre-fetching and much more. 
[Vercel](https://vercel.com) handles automatic deployments, and makes sure the production environment is always up and running. 

#### Wit.ai
All NLP-related tasks are handled with ease by [Wit.ai](https://wit.ai). 
Wit.ai makes sure intents are recognized and the correct entities are extracted from every sentence the user throws at your app. Wit.ai also makes it possible to continuously improve the trained model, even when your app is already up and running on a production environment. 


## How 

### Wit.ai
To make sure we understand what the user asks, we will make use of a wit.ai application. Start by creating a wit.ai application, and give it a name. 

![Create a wit.ai application](https://i.imgur.com/oIYzpZX.png)
Our application doesn't know anything yet after we just created it, so we'll train it to become smarter. 
Click on 'Understanding' on the left side of your screen. 
Start by adding a few sentences (called utterances) that look like something a user could say. For example: 'What's the next item on my agenda?' or 'Did I miss an appointment today?'. 

![Add utterances to your wit.ai application](https://i.imgur.com/YEnsfQ9.png)
For every utterance we add, we specify the intent it belongs to. An intent is something the user would want to do. If the user asks 'What's the next item on my agenda?', he obviously wants to know the next item on his agenda. We could say this belongs to the `calendar_next` intent. 
An intent can contain zero, one or more entities. In the previous example, 'item' and 'agenda' are entities. They refer to a type of object which are needed to understand the sentence. Entities contain meaningful information about the intent. For example, in the sentence 'Order a pepperoni pizza', 'pepperoni pizza' is obviously an important piece of information in the intent `order`. How else could you know what the user wants to order? 
The more utterances you add to an intent, the smarter your app will become. Don't forget to add some variation to your utterances, or your app probably won't understand the user. 

![Tagging entities in wit.ai](https://i.imgur.com/juu3lxH.png)
### NextJS
Start by creating a NextJS project by executing following command in your terminal: `npx create-next-app calendarbuddy`. This will create a folder called `callendarbuddy` and some files to get you started. 

### API routes 

NextJS provides an API route for every file in the `routes/api/` folder. 
Every file in this folder is automatically converted into an API route, you just have to export a function from these files. 

#### Intents
Since we've already created a smart application with wit.ai, we can try it out by using the REST API wit.ai provides. We will send our user's utterances to a wit.ai API endpoint, and receive a response. This response will contain the detected intent, along with the detected entities and some other information. For this project to work, we only need the detected intent. 
Create a file called `intents.js` with following contents: 
```js
const endpoint = 'https://api.wit.ai/'
export default async function handler(req, res) {
  const { utterance } = req.query
  const response = await fetch(endpoint + 'message?q=' + utterance, 
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + process.env.WIT_AI_SERVER_TOKEN,
    },
  })
  const intent = await response.json()
  res.json(intent)
}
```
This function is called whenever we make a GET request to `/api/intents`. This function calls the wit.ai `/events` endpoint, and returns the response from that endpoint. Don't forget to create a `.env` file which contains `WIT_AI_SERVER_TOKEN=<YOUR_SERVER_TOKEN>`, where <YOUR_SERVER_TOKEN> is replaced with your actual server token, which you can find on the settings page of your wit.ai application.  

#### Events
We should be able to access the user's calendar items, so we can create/read/update/delete the calendar items when the user asks us to. 
These items could come from anywhere, for example a Google Calendar integration. For this tutorial, we will provide our application with a hardcoded set of calendar events. 
We will create an API route to fetch the events. By doing so, we make it easy to add a calendar integration later, without having to change the code in our jsx/tsx files. 

Create a file called `events.js` in the `/routes/api/` folder and insert following code: 
```js
const mockEvents = [
  {
    id: '1',
    name: 'Meeting in the past with John Doe',
    type: 'meeting',
    startTime: hoursOffset(-1),
    endTime: new Date(),
  },
  {
    id: '2',
    name: 'Meeting in the future with Jane Doe',
    type: 'meeting',
    startTime: hoursOffset(1),
    endTime: hoursOffset(2),
  },
]

function hoursOffset(hours) {
  const d = new Date()
  d.setHours(d.getHours() + hours)
  return d
}

export default async function handler(req, res) {
  return res.json(mockEvents)
}
```

The first event will always be in the past, and the second event will always be in the future. 

More info about data fetching in NextJS can be found [here](https://nextjs.org/docs/basic-features/data-fetching). 


### UI 
We will use [TailwindCSS](https://tailwindcss.com/) as CSS framework to style our user interface (UI). 
Execute `yarn add tailwindcss` in your terminal to install the TailwindCSS library. 
Create a file called `postcss.config.js` with following contents: 
```js
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  ]
}
```
Create a file called `tailwind.config.js` with following contents: 
```js
module.exports = {
  purge: [],
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
  future: {
    removeDeprecatedGapUtilities: true,
  },
}
```
Last but not least, add your css in `styles/index.css`. Don't forget to add the tailwind directives to this file:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
The full documentation on how to add tailwind to your project can be found [here](https://tailwindcss.com/docs/installation). 

### State machine 
This application has a relatively complex interface, and the code to create this could get complicated quickly. XState prevents any unwanted or impossible states, which is exactly what we want to achieve. 
Execute `yarn add xstate` in your console to install the official XState library.

Create a file `machines/intent.js`. This file will contain our state machine. This machine will describe all possible states, the corresponding transitions and actions. 
Our state machine will contain 4 states: `idle`, `loading`, `loaded` and `error`. 

```js
import { Machine } from 'xstate'
export const intentMachine = Machine({
  id: 'intent',
  initial: 'idle',
  context: {},
  states: {
    idle: {},
    loading: {},
    loaded: {},
    error: {}
  }
})
```

When entering the initial `idle` state, we will fetch the user's calendar items via the `invokeFetchEvents` function, defined on `invoke` property. 
When our application enters the `loading` state (this happens when the value in the input field gets updated), we will fetch the corresponding intent from wit.ai, by passing the value from the input field (this is the user's utterance) along with the API request. When the API call completes, the application will enter the `loaded` state and the `onDone` action will get triggered. 
The correct quick replies will be shown to the user, and our job is done here. 

More info about XState can be found [here](https://xstate.js.org/). 

