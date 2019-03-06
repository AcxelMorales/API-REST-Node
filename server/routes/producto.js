const express = require('express')
let {
    verificar
} = require('../middlewares/autenticacion')
let Producto = require('../models/producto')
let app = express()

// ========================
//          GET
// ========================
app.get('/producto', verificar, (req, res) => {
    let desde = req.query.desde || 0
    desde = Number(desde)

    Producto.find({
            disponible: true
        })
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: 'true',
                productos
            })
        })
})

// ========================
//        GET ONE
// ========================
app.get('/producto/:id', verificar, (req, res) => {
    let id = req.params.id

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, producto) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            if (!producto) {
                return res.status(400).json({
                    ok: false,
                    message: 'El id es incorrecto'
                })
            }

            res.json({
                ok: true,
                producto
            })
        })
})

// ========================
//         SEND
// ========================
app.get('/producto/buscar/:termino', verificar, (req, res) => {
    let termino = req.params.termino
    let regex = new RegExp(termino, 'i')

    Producto.find({
            nombre: regex
        })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                productos
            })
        })
})

// ========================
//          POST
// ========================
app.post('/producto', verificar, (req, res) => {
    let body = req.body

    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    })

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: 'true',
            producto: productoDB
        })
    })
})

// ========================
//          PUT
// ========================
app.put('/producto/:id', verificar, (req, res) => {
    let id = req.params.id
    let body = req.body

    Producto.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true
    }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            producto: productoDB
        })
    })
})

// ========================
//          DELETE
// ========================
app.delete('/producto/:id', verificar, (req, res) => {
    let id = req.params.id

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            })
        }

        productoDB.disponible = false

        productoDB.save((err, productoBorrado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                productoBorrado,
                message: 'Producto Borrado'
            })
        })

    })
})

module.exports = app