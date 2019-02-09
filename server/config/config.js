/**
 * Puerto
 */
process.env.PORT = process.env.PORT || 3000

/**
 *  Entorno
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'

/**
 * Base de Datos
 */
let url

if (process.env.NODE_ENV === 'dev') {
    url = 'mongodb://localhost:27017/cafe'
} else {
    url = 'mongodb://cafe-admin:Ca52341698RoCk_@ds127825.mlab.com:27825/cafe'
}

process.env.URL_DB = url