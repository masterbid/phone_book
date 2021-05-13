require("dotenv").config()
const express = require("express")
const cors = require("cors")
const { Client } = require('pg')

const app = express()

const PORT = process.env.PORT || 7000

const client = new Client({
    user: process.env.user,
    host: process.env.host,
    database: process.env.database,
    password: process.env.password,
    port: process.env.dbport,
    ssl: true
  })
client.connect().then(() => console.log("DB connected")).catch(err => console.error(err))

const query = `
  CREATE TABLE contacts (
      id SERIAL PRIMARY KEY,
      name CHAR(255),
      phone INT
  )
`

client.query(query, (err, res) => {
    if(err){
        console.error(err)
        return
    }
    console.log("Table created successfully")
    client.end()
})

app.use(express.json(), cors())

app.get('/', (req, res) => {
    res.send("Server connected...")
})

app.get('/contacts', (req, res) => {
    client.query('SELECT * FROM public.contacts ORDER BY id ASC ', (err, result) => {
        if(err) res.status(404).send(err.stack)
        res.status(200).json(result.rows)
        
    })

})

app.post('/addContacts', (req, res) => {
    client.query('INSERT INTO public.contacts(name, phone) VALUES($1, $2) RETURNING *', [req.body.name, req.body.phone], (err, result) => {
        if(err) res.status(404).send(err.stack)
        if(result){
            res.status(200).json(result.rows[0])
           
        } 
        
    })

})

app.delete('/contacts/:id', (req, res) => {
    client.query('DELETE FROM public.contacts WHERE id = $1 RETURNING *', [req.params.id], (err, result) => {
        if(err) res.status(404).send(err.stack)
        if(result){
            res.status(200).json(result.rows[0])
           
        } 
        
    })

})

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})