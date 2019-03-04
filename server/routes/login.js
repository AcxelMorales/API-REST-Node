const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {
    OAuth2Client
} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID)
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

// Configuraciones de Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    })
    const payload = ticket.getPayload()

    // Retornamos un objeto personalizado similar a el modelo de el back-end
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

// ruta de google y autenticazión
app.post('/google', async (req, res) => {
    let token = req.body.idtoken

    let googleUser = await verify(token)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                error: err
            })
        })

    // Buscamos a el usuario en la db con su email
    Usuario.findOne({
        email: googleUser.email
    }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        // Si existe
        if (usuarioDB) {
            if (usuarioDB.google === false) { // Si no se autentico con google
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar su autenticación normal'
                    }
                })
            } else {
                // Generamos el token
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, {
                    expiresIn: process.env.CADUCIDAD_TOKEN
                })

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })
            }
        } else {
            // Si no existe en la db
            let usuario = new Usuario()

            // Seteamos algunos valores
            usuario.nombre = googleUser.nombre
            usuario.email = googleUser.email
            usuario.img = googleUser.img
            usuario.google = true
            usuario.password = ':)'

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                }

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, {
                    expiresIn: process.env.CADUCIDAD_TOKEN
                })

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })
            })
        }
    })
})

module.exports = app