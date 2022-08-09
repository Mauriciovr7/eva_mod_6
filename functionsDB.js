const fs = require('fs').promises;

/**
 * Función para traer los roommates del archivo 'db/roommates.json'
 * @returns roommates array de roommates
 */
const leer_roommate = async () => {
    try {
        let archivo_db = await fs.readFile('db/roommates.json', 'utf-8')
        archivo_db = JSON.parse(archivo_db)
        return archivo_db.roommates
    } catch (error) {
        console.log("Surgió un error al leer_roommate: " + error)
    }
}

/**
 * Función para agregar un nuevo roommate al archivo 'db/roommates.json'
 * @param {*} nuevo_roommate objeto roommate
 */
const crear_roommate = async (nuevo_roommate) => {
    try {
        let archivo_db = await fs.readFile('db/roommates.json', 'utf-8')
        archivo_db = JSON.parse(archivo_db)
        archivo_db.roommates.push(nuevo_roommate)
        archivo_db = JSON.stringify(archivo_db)
        await fs.writeFile('db/roommates.json', archivo_db, 'utf-8')
    } catch (error) {
        console.log("Surgió un error al crear_roommate: " + error)
    }
}

/**
 * Función para traer los gastos del archivo 'db/gastos.json'
 * @returns gastos array de gastos
 */
const leer_gastos = async () => {
    try {
        let archivo_db = await fs.readFile('db/gastos.json', 'utf-8')
        archivo_db = JSON.parse(archivo_db)
        return archivo_db.gastos
    } catch (error) {
        console.error("Surgió un error al leer_gastos: " + error)
    }
}

/**
 * Función para guardar los gastos en el archivo 'db/gastos.json'
 * @param {*} gasto objeto gasto
 */
const guardar_gasto = async (gasto) => {
    try {
        let archivo_db = await fs.readFile('db/gastos.json', 'utf-8')
        archivo_db = JSON.parse(archivo_db)
        archivo_db.gastos.push(gasto)
        archivo_db = JSON.stringify(archivo_db)
        await fs.writeFile('db/gastos.json', archivo_db, 'utf-8')

        let archivo_db_roommates = await fs.readFile('db/roommates.json', 'utf-8')
        archivo_db_roommates = JSON.parse(archivo_db_roommates)

        let monto_a_deber = parseInt(gasto.monto / archivo_db_roommates.roommates.length)

        for (let i = 0; i < archivo_db_roommates.roommates.length; i++) {
            archivo_db_roommates.roommates[i].debe += monto_a_deber

            if (gasto.id == archivo_db_roommates.roommates[i].id) {
                archivo_db_roommates.roommates[i].recibe += gasto.monto
            }
        }
        await fs.writeFile('db/roommates.json', JSON.stringify(archivo_db_roommates), 'utf-8')
    } catch (error) {
        console.log("Surgió un error al guardar_gasto: " + error)
    }
}

/**
 * Función para actualizar un gasto
 * @param {*} id id del gasto
 * @param {*} form datos del formulario
 */
const actualizar_gasto = async (id, form) => {
    let monto_ant
    try {
        let archivo_db = await fs.readFile('db/gastos.json', 'utf-8')
        archivo_db = JSON.parse(archivo_db)

        for (let i = 0; i < archivo_db.gastos.length; i++) {
            if (id == archivo_db.gastos[i].id) {
                monto_ant = archivo_db.gastos[i].monto
                archivo_db.gastos[i].monto = form.monto
            }
        }

        archivo_db = JSON.stringify(archivo_db)
        await fs.writeFile('db/gastos.json', archivo_db, 'utf-8')

        // para actualizar debe y recibe de roommates ******************
        let archivo_db_roommates = await fs.readFile('db/roommates.json', 'utf-8')
        archivo_db_roommates = JSON.parse(archivo_db_roommates)

        // restar
        let restar = parseInt(form.monto / archivo_db_roommates.roommates.length)
        let desc = monto_ant - form.monto
        let desc_debe = desc / archivo_db_roommates.roommates.length

        for (let i = 0; i < archivo_db_roommates.roommates.length; i++) {
            if (id == archivo_db_roommates.roommates[i].id) {
                archivo_db_roommates.roommates[i].recibe = archivo_db_roommates.roommates[i].recibe - desc
                archivo_db_roommates.roommates[i].debe = archivo_db_roommates.roommates[i].debe - desc_debe

            } else {
                archivo_db_roommates.roommates[i].debe = archivo_db_roommates.roommates[i].debe - desc_debe
            }
        }
        await fs.writeFile('db/roommates.json', JSON.stringify(archivo_db_roommates), 'utf-8')
    } catch (error) {
        console.log("Surgió un error al guardar_gasto: " + error)
    }
}

/**
 * Función para eliminar un gasto
 * @param {*} id id del gasto
 */
const eliminar_gasto = async (id) => {
    try {
        let archivo_db = await fs.readFile('db/gastos.json', 'utf-8')
        archivo_db = JSON.parse(archivo_db)
        let monto

        for (let i = 0; i < archivo_db.gastos.length; i++) {
            if (id == archivo_db.gastos[i].id) {
                monto = archivo_db.gastos[i].monto
                archivo_db.gastos.splice(i, 1)
            }
        }
        archivo_db = JSON.stringify(archivo_db)
        await fs.writeFile('db/gastos.json', archivo_db, 'utf-8')

        // para actualizar debe y recibe de roommates ******************
        let archivo_db_roommates = await fs.readFile('db/roommates.json', 'utf-8')
        archivo_db_roommates = JSON.parse(archivo_db_roommates)

        // restar
        let restar = parseInt(monto / archivo_db_roommates.roommates.length)

        for (let i = 0; i < archivo_db_roommates.roommates.length; i++) {
            if (id == archivo_db_roommates.roommates[i].id) {
                archivo_db_roommates.roommates[i].recibe = archivo_db_roommates.roommates[i].recibe - monto
            }
            archivo_db_roommates.roommates[i].debe = Math.max(archivo_db_roommates.roommates[i].debe - restar, 0)
        }

        await fs.writeFile('db/roommates.json', JSON.stringify(archivo_db_roommates), 'utf-8')

    } catch (error) {
        console.log("Surgió un error al eliminar_gasto: " + error);
    }
}

module.exports = { crear_roommate, leer_roommate, guardar_gasto, leer_gastos, actualizar_gasto, eliminar_gasto }