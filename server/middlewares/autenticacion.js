const jwt = require('jsonwebtoken')

// ====================
// Verificar Token
// ====================
const verificar = (req, res, next) => {
    let token = req.get('token')

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            })
        }

        req.usuario = decoded.usuario
        next()
    })
}

// ====================
// Verificar ROL
// ====================
const verificaRol = (req, res, next) => {
    if (req.usuario.role === 'ADMIN_ROLE') {
        next()
    } else {
        res.json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        })
    }
}

module.exports = {
    verificar,
    verificaRol
}