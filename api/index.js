/** @description Initialize express app */
const express = require("express");
const app = express();

/** @description Initialize sqlite db */

const sqlite3 = require('sqlite3').verbose();

const path = require('path');

const fs = require('fs');
const localTmpPath = path.join(__dirname, 'tmp');

console.log(localTmpPath);

if (!fs.existsSync(localTmpPath)) {
    fs.mkdirSync(localTmpPath);
}

const dbPath = process.env.NODE_ENV === 'production' 
    ? path.join('/tmp', 'employee.db') 
    : path.join(__dirname, 'tmp', 'employee.db');

console.log(dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database at:', dbPath);
    }
});

/** @description Initialize http server */
const http = require('http');
const server = http.createServer(app);

/** @description Create Table emp */
db.run('CREATE TABLE IF NOT EXISTS emp(id TEXT, name TEXT)');

app.get("/", (req, res) => res.send("<h3> Hi there, You are going to perform CRUD operations.............[CREATE] Please enter 'http://localhost:3000/add/(id number)/(name)' to add new employee to the database.........................[READ] 'http://localhost:3000/view/(id number)' to view an employee.........................[UPDATE] 'http://localhost:3000/update/(id number)/(new name)' to update an employee.....................[DELETE] 'http://localhost:3000/del/(id number)' to delete an employee...............................Before closing this window, kindly enter 'http://localhost:3000/close' to close the database connection <h3>"));

/** @description Create new employee */
app.get('/add/:id/:name', (req, res) => {
    
    db.serialize(() => {
        
        db.run('INSERT INTO emp(id,name) VALUES(?,?)', [req.params.id, req.params.name], function(err) {
            
            if (err) {
                return console.log(err.message);
            }

            console.log("New employee has been added");

            res.send("New employee has been added into the database with ID = "+req.params.id+ " and Name = "+req.params.name);
        });
    });
});

/** @description View single employee eetail */
app.get('/view/:id', (req, res) => {
    db.serialize(()=>{
        db.each('SELECT id ID, name NAME FROM emp WHERE id =?', [req.params.id], function(err,row){     
            if(err){
                res.send("Error encountered while displaying");
                return console.error(err.message);
            }
            res.send(` ID: ${row.ID}, Name: ${row.NAME}`);
            console.log("Entry displayed successfully");
        });
    });
});

/** @description Update existing employee */
app.get('/update/:id/:name', function(req, res){
    db.serialize(()=>{
        db.run('UPDATE emp SET name = ? WHERE id = ?', [req.params.name,req.params.id], function(err){
            if(err){
                res.send("Error encountered while updating");
                return console.error(err.message);
            }
            res.send("Entry updated successfully");
            console.log("Entry updated successfully");
        });
    });
});

/** @description Delete new employee */
app.get('/remove/:id', function(req, res){
    db.serialize(()=>{
        db.run('DELETE FROM emp WHERE id = ?', req.params.id, function(err) {
            if (err) {
                res.send("Error encountered while deleting");
                return console.error(err.message);
            }
            res.send("Entry deleted");
            console.log("Entry deleted");
        });
    });
});

/** @description Close database connection */
app.get('/close', (req, res) => {
    db.close((err) => {
        if (err) {
            res.send('There is some error in closing the database');
            return console.error(err.message);
        }
        console.log('Closing the database connection.');
        res.send('Database connection successfully closed');
    });
});

server.listen(9000, () => console.log("Server ready on port 3000."));

module.exports = app;