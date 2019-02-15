// Config
require('./config/config')

// Variables
const express = require('express')
const bp = require('body-parser')
const mongoose = require('mongoose')
const app = express()

// Config de BodyParser
app.use(bp.urlencoded({
    extended: false
}))

app.use(bp.json())

// Seteamos el puertp
// app.set('port', process.env.PORT || 3000)

// Routes
app.use(require('./routes/routes'))
app.use(require('./routes/login'))

// Conexión a mongoDB
mongoose.connect(process.env.URL_DB, (err, res) => {
    if (err) throw new Error('Fallo la conexión a MongoDB')
    console.log('Base de datos en MongoDB ONLINE')
})

// Listener
app.listen(process.env.PORT, () => {
    console.log(`Corriendo en el puerto ${process.env.PORT}`)
})