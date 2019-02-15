// =============================
//  Puerto
// =============================
process.env.PORT = process.env.PORT || 3000

// =============================
//  Entorno
// =============================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'

// =============================
//  Venicimiento del token
// =============================
// 60 segundo
// 60 minutos
// 24 horas
// 30 días
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30

// =============================
//  SEED de autenticación
// =============================
process.env.SEED = process.env.SEED || 'secret'

// =============================
//  DataBase
// =============================
let url
if (process.env.NODE_ENV === 'dev') {
    url = 'mongodb://localhost:27017/cafe'
} else {
    url = 'mongodb://acxel:acxel52341698@ds127825.mlab.com:27825/cafe'
}

process.env.URL_DB = url