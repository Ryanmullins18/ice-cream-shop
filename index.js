const pg = require("pg");
const express = require("express");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_ice_cream"
);
const server = express();

const init = async () => {
    //wait for the client to connect to the database
    await client.connect();
    console.log("connected to database");
  
    //create SQL to wipe the database and create a new table based on our schema
    let SQL = `DROP TABLE IF EXISTS flavors;
      CREATE TABLE flavors(
      id SERIAL PRIMARY KEY,
      name VARCHAR(50),
      is_favorite BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
     
      );`;
    //wait for the database to process the query
    await client.query(SQL);
    console.log("tables created");
  
    //create SQL statement to insert 3 new rows of data into our table
    SQL = `INSERT INTO flavors(name, is_favorite) VALUES('Mint oreo', true);
      INSERT INTO flavors(name, is_favorite) VALUES('Birthday cake', false);
      INSERT INTO flavors(name, is_favorite) VALUES('Chocolate chip Cookiedough', false);
      INSERT INTO flavors(name, is_favorite) VALUES('Superman', false);
      INSERT INTO flavors(name, is_favorite) VALUES('Mint chip', false);
      INSERT INTO flavors(name, is_favorite) VALUES('Cookie Monster', false);
      INSERT INTO flavors(name, is_favorite) VALUES('Vanilla', false);
      INSERT INTO flavors(name, is_favorite) VALUES('Chocolate', false);
      `;
    //wait for the database to process the query
    await client.query(SQL);
    console.log("data seeded");
  
    //have the server listen on a port
    const port = process.env.PORT || 3000;
    server.listen(port, () => console.log(`listening on port ${port}`));

    
  };
  init();

  server.use(express.json())
  server.use(require("morgan")("dev"))

  server.post('/api/flavors', async (req, res, next)=> {
  try{
    const SQL = `INSERT INTO flavors(name, is_favorite)
    VALUES($1, $2) RETURNING *;`;
    const response = await client.query(SQL, [req.body.name, req.body.is_favorite]);

    res.status(201).send(response.rows[0]);
  } catch (error) {
        next(error);
  }
});
  server.get('/api/flavors', async(req, res, next)=> {
  try{
        const SQL = `SELECT * from flavors ORDER BY 
        id ASC`;
        const response = await client.query(SQL);
        res.send(response.rows);
  } catch (error) {
        next(error);
  }
});

  server.get('/api/flavors/:id', async (req, res, next)=> {
  try{
    const SQL = `SELECT DISTINCT id, name, is_favorite FROM flavors
    WHERE id=$1`;
    const response = await client.query(SQL, [req.params.id]);
    res.send(response.rows);
} catch (error) {
    next(error);
}
});
  server.put('/api/flavors/:id', async (req, res, next)=> {
  try{
    const {name, is_favorite}= req.body;
    const SQL = `UPDATE flavors SET name=$1, is_favorite=$2,
    updated_at=now() WHERE id=$3 RETURNING *;`;
    const response = await client.query(SQL, [name, is_favorite, req.params.id]);
    res.send(response.rows[0]);
} catch (error) {
    next(error);
}
});

  server.delete('/api/flavors/:id', async (req, res, next)=> {
  try{
       const SQL = `DELETE FROM flavors WHERE id=$1`;
       await client.query(SQL, [req.params.id]);
       res.sendStatus(204);
   } catch (error) {
       next(error);
   }
});