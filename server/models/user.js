// Variables
const mongoose = require('mongoose')
const unique = require('mongoose-unique-validator')

// Asignamos los roles validos en una enum
let roles = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol valido'
}

// Creamos el schema de mongo con sus filas y propiedades
let Schema = mongoose.Schema
let userSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido']
    },
    email: {
        type: String,
        required: [true, 'El correo es requerido'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'El password es requerido']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: roles
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
})

// Eliminamos el campo password de la respuesta
// así evitamos mostrar el campo en la respuesta y en el front-end
userSchema.methods.toJSON = function () {
    let user = this
    let userObj = user.toObject()
    delete userObj.password

    return userObj
}

// Hacemos que un campo sea único, y así evitamos registros iguales
userSchema.plugin(unique, {
    message: '{PATH} debe de se único'
})

// Exportamos el modelo con un nombre
module.exports = mongoose.model('Usuario', userSchema)