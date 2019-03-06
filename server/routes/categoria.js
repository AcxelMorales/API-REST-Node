const express = require('express')
let {
    verificar,
    verificaRol
} = require('../middlewares/autenticacion')
let Categoria = require('../models/categoria')
let app = express()

// ========================
//          GET
// ========================
app.get('/categoria', verificar, (req, res) => {
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                categorias
            })
        })
})

// ========================
//        GET ONE
// ========================
app.get('/categoria/:id', verificar, (req, res) => {
    let id = req.params.id

    Categoria.findById(id, (err, categoria) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!categoria) {
            return res.status(400).json({
                ok: false,
                message: 'El id es incorrecto'
            })
        }

        res.json({
            ok: true,
            categoria
        })
    })
})

// ========================
//          POST
// ========================
app.post('/categoria', verificar, (req, res) => {
    let body = req.body

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    })

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: 'true',
            categoria: categoriaDB
        })
    })
})

// ========================
//          PUT
// ========================
app.put('/categoria/:id', verificar, (req, res) => {
    let id = req.params.id
    let body = req.body

    Categoria.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true
    }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })
})

// ========================
//          DELETE
// ========================
app.delete('/categoria/:id', [verificar, verificaRol], (req, res) => {
    let id = req.params.id

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            })
        }

        res.json({
            ok: true,
            message: 'Categoria Borrada'
        })
    })
})

module.exports = app