const express = require('express')
const fileUpload = require('express-fileupload')
const fs = require('fs')
const path = require('path')

const Usuario = require('../models/user')
const Producto = require('../models/producto')

const app = express()

// configuración del middleware
app.use(fileUpload({
    useTempFiles: true
}))

// Ruta para subir la imagen
app.put('/upload/:tipo/:id', (req, res) => {
    let tipo = req.params.tipo
    let id = req.params.id

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningún archivo.'
            }
        })
    }

    // Validar tipo
    let tipos = ['productos', 'usuarios']

    if (tipos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: `Los tipos permitidos son -> ${tipos.join(', ')}`,
                tipo
            }
        })
    }

    // Obtenemos el archivo posteado y su extensión
    let archivo = req.files.archivo
    let nombreArchivoCortado = archivo.name.split('.')
    let extension = nombreArchivoCortado[nombreArchivoCortado.length - 1]

    // Extenciones permitidas
    let extensiones = ['jpg', 'jpeg', 'png', 'gif']

    // Validamos
    if (extensiones.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: `Las extensiónes permitidas son -> ${extensiones.join(', ')}`,
                extension
            }
        })
    } else {
        // Cambiar el nombre a el archivo
        let nuevoNombre = `${id}-${new Date().getMilliseconds()}.${extension}`

        // Método para subir la imagen a el server
        archivo.mv(`uploads/${tipo}/${nuevoNombre}`, (err) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            // Aquí ya esta cargada la imagen
            if (tipo === 'usuarios') {
                imagenUsuario(id, res, nuevoNombre)
            } else {
                imagenProducto(id, res, nuevoNombre)
            }

            res.json({
                ok: true,
                message: 'Imagen subida correctamente'
            })
        })
    }
})

const imagenUsuario = (id, res, nombreArchivo) => {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borrarArchivo(nombreArchivo, 'usuarios')
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!usuarioDB) {
            borrarArchivo(nombreArchivo, 'usuarios')
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El usuario no existe'
                }
            })
        }

        borrarArchivo(usuarioDB.img, 'usuarios')

        usuarioDB.img = nombreArchivo

        usuarioDB.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
        })
    })
}

const imagenProducto = (id, res, nombreArchivo) => {
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borrarArchivo(nombreArchivo, 'productos')
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!productoDB) {
            borrarArchivo(nombreArchivo, 'productos')
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            })
        }

        borrarArchivo(productoDB.img, 'productos')

        productoDB.img = nombreArchivo

        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
        })
    })
}

const borrarArchivo = (nombreImagen, tipo) => {
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`)

    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen)
    }
}

module.exports = app