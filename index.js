require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Note = require('./models/note')

app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))

app.get('/api/persons', (request, response) => {
  // 3.13
  Note.find({}).then(phonebook => {
    response.json(phonebook)
  })
})

// 3.18
app.get('/info', (request, response) => {
  const currentTime = new Date()
  // 3.13
  Note.find({}).then(phonebook => {
    const infoMessage = `<p>Phonebook has info for ${phonebook.length} people</p><p>${currentTime}</p>`

    response.send(infoMessage)
  })
})

// 3.18
app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  // 3.13
  Note.findById(id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  }).catch(error => next(error))
})

// 3.15
app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  // 3.13
  Note.findByIdAndDelete(id).then(() => {
    response.status(204).end()
  }).catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'Name and number are required' })
  }

  // 3.13
  Note.findOne({ name: body.name }).then(existingPerson => {
    if (existingPerson) {
      return response.status(400).json({ error: 'Name must be unique' })
    }

    // 3.13
    const newPerson = new Note({
      name: body.name,
      number: body.number,
    })

    newPerson.save().then(() => {
      response.json(newPerson)
    }).catch(error => next(error))
  }).catch(error => next(error))
})

// 3.17
app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'Name and number are required' })
  }

  const person = {
    name: body.name,
    number: body.number
  }

  Note.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

// 3.16
const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
