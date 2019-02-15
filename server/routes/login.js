const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Usuario = require('../models/user')
const app = express()

app.post('/login', (req, res) => {
    let body = req.body // body con los parametros

    Usuario.findOne({
        email: body.email // condición
    }, (err, userDB) => {
        // Validamos el error
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        // Validamos que el usuario exista
        if (!userDB) {
            return res.status(400).json({
                ok: false,
                message: 'Usuario o contraseña incorrecto'
            })
        }

        // Validamos el password
        if (!bcrypt.compareSync(body.password, userDB.password)) {
            return res.status(400).json({
                ok: false,
                message: 'Usuario o contraseña incorrecto'
            })
        }

        // Generamos el token
        let token = jwt.sign({
            usuario: userDB
        }, process.env.SEED, {
            expiresIn: process.env.CADUCIDAD_TOKEN
        })

        res.json({
            ok: true,
            usuario: userDB,
            token
        })
    })
})

module.exports = app