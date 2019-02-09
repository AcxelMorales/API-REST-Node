// Variables
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const _ = require('underscore')
const Usuario = require('../models/user')

// Peticiones
app.get('/', (req, res) => {
    // seteamos los parametros opcionales en la url
    let desde = req.query.desde || 0
    desde = Number(desde)

    let limite = req.query.limite || 5
    limite = Number(limite)

    // {} -> resive una filtración como: google: true
    // '' -> especificamos que campos queremos enviar a la respuesta
    // skip and limit los seteamos con los valores de arriba
    Usuario.find({
            estado: true
        }, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, users) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }

            // count regresa el número de registro en la DB
            Usuario.count({
                estado: true
            }, (err, number) => {
                res.json({
                    ok: true,
                    usuarios: users,
                    numero_clientes: number
                })
            })

        })
})

app.post('/user', (req, res) => {
    let body = req.body

    // Creamos un usuario con sus propiedades mas importantes, mediante el body
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10), // encriptamos el password
        role: body.role
    })

    usuario.save((err, userDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            user: userDB
        })
    })
})

app.put('/user/:id', (req, res) => {
    let id = req.params.id
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado'])

    // new -> sirve para mostrar la actualización
    // runValidators -> nos ayuda a ocupar las validaciones en el schema
    Usuario.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true
    }, (err, userDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            usuario: userDB
        })
    })
})

app.delete('/user/:id', (req, res) => {
    let id = req.params.id

    // eliminacion directa
    // Usuario.findByIdAndRemove(id, (err, user) => {
    //     if (err) {
    //         return res.status(400).json({
    //             ok: false,
    //             err
    //         })
    //     }

    //     if (!user) {
    //         return res.status(400).json({
    //             ok: false,
    //             err: {
    //                 message: 'Usuario no encontrado'
    //             }
    //         })
    //     }

    //     res.json({
    //         ok: true,
    //         user
    //     })
    // })

    // cambio de estado
    Usuario.findByIdAndUpdate(id, {
        estado: false
    }, {
        new: true
    }, (err, user) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if (!user) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            })
        }

        res.json({
            ok: true,
            user
        })
    })

})

module.exports = app