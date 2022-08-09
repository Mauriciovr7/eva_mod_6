const express = require('express')
const uuid = require('uuid')
const axios = require('axios')
const fs = require('fs').promises
const DB = require('./functionsDB'); // Funciones para guardar los datos en el archivo json 
const f = require('./functionsUtils'); // Funciones útiles
const nodemailer = require('nodemailer')
const {clave, correo} = require('./clave.js')

const app = express()
const port = 3000
app.use(express.static('public'))

let transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: correo,
    pass: clave
  }
})


// RUTAS
// Obtener roommates (roommates GET)
app.get('/roommates', async (req, res) => {
  try {
    const roommates = await DB.leer_roommate() // functionsDB
    res.status(200).json({ roommates })
  } catch (error) {
    return res.status(400).redirect('/')
  }
})

// crear roommates con ayuda de randomuser (roommates POST)
app.post('/roommates', async (req, res) => {
  let datos
  try {
    datos = await axios.get('https://randomuser.me/api')
    const random_roommate = datos.data.results[0]
    const roommate = {
      id: uuid.v4(),
      nombre: `${random_roommate.name.first} ${random_roommate.name.last}`,
      debe: 0,
      recibe: 0
    }
    await DB.crear_roommate(roommate) // functionsDB
    res.status(200).redirect('/roommates')
  } catch (error) {
    console.log("Surgió un error: " + error);
    return res.status(400).redirect('/')
  }
})

// Obtener los gastos (gastos GET)
app.get('/gastos', async (req, res) => {
  try {
    const gastos = await DB.leer_gastos() // functionsDB
    res.status(200).json({ gastos })
  } catch (error) {
    console.log("Surgió un error: " + error);
    return res.status(400).redirect('/')
  }
})

// Agregar gastos (gastos POST)
app.post('/gastos', async (req, res) => {

  // envío de correo para verificar esta funcionalidad ******************

  await transport.sendMail({
    from: correo, // sender address
    to: correo, // list of receivers
    subject: 'Roommates', // Subject line
    html: 'Nuevo gasto en Roommates', // html body
  })

  try {
    const form = await f.getForm(req) // functionsUtils

    archivo_db = await fs.readFile('db/roommates.json', 'utf8')
    archivo_db = JSON.parse(archivo_db)

    for (let i = 0; i < archivo_db.roommates.length; i++) {
      if (form.roommates == archivo_db.roommates[i].nombre) {
        id = archivo_db.roommates[i].id
      }
    }

    let gasto = {
      id,
      roommates: form.roommates,
      descripcion: form.descripcion,
      monto: form.monto
    }
    await DB.guardar_gasto(gasto) // functionsDB
    res.status(200).redirect('/gastos')
  } catch (error) {
    console.log("Surgió un error: " + error);
    return res.status(400).redirect('/');
  }

})

// Actualizar gastos (gastos PUT)
app.put('/gastos', async (req, res) => {
  const id = req.query.id;
  if (id) {
    try {
      const form = await f.getForm(req);  // functionsUtils
      await DB.actualizar_gasto(id, form); // functionsDB
      res.status(200).redirect('/');
    } catch (error) {
      console.log("Surgió un error: " + error);
      return res.status(400).redirect('/') // 400 error
    }
  }
})

// Eliminar un gasto (gastos DELETE)
app.delete('/gastos', async (req, res) => {
  const id = req.query.id;
  if (id) {
    try {
      await DB.eliminar_gasto(id); // functionsDB
      res.status(200).redirect('/') // eliminado
    } catch (error) {
      console.log("Surgió un error: " + error);
      return res.status(400).redirect('/') // 400 error
    }
  }
})

/* app.get('*', (req, res) => {
  res.send(`
  <html>
    <h2>...ruta no existe</h2>
    <a href="/">
      <button>Volver</button>
    </a>
  </html>`)
}) */

app.use((req, res) => {
  res.status(404).send(`
  <html>
    <h2>...ruta no existe</h2>
    <a href="/">
      <button>Volver</button>
    </a>
  </html>`)
})

app.listen(port, function () {
  console.log(`server running http://localhost:${port}/`)
})

// nodemon server
