require("dotenv").config();

const express = require('express');
const mysql = require("mysql2");
const app = express();
const PORT = 143;

app.use(express.json())

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to MySQL Database");
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

const pets = [
    { id: 1, name: "Bantatay", type: "Dog", age: 2, adopted: false },
    { id: 2, name: "Mingming", type: "Cat", age: 1, adopted: true }
];

//GET - Get all pets
app.get("/pets", (req, res) => {
    res.status(200).json(pets); // Returns an array of pets
});

//GET - Get pet id
app.get("/pets/:id", (req, res) => {
    const pet = pets.find(p => p.id === parseInt(req.params.id));
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    res.json(pet);
});

// POST - Add a new pet w/ database
app.post("/addpet", (req, res) => {
    const { name, type, age } = req.body;
    if (!name || !type || age === undefined) {
        return res.status(400).json({ message: "Name, type, and age are required" });
    }
    db.query("INSERT INTO pets (name, type, age) VALUES (?, ?, ?)", 
        [name, type, age], 
        (err, result) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });
            res.status(201).json({ id: result.insertId, name, type, age, adopted: false });
        }
    );
});

// PUT - Update Pet Details by ID
app.put("/pets/:id", (req, res) => {
    const pet = pets.find(p => p.id === parseInt(req.params.id));
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    const { name, type, age, adopted } = req.body;
    
    pet.name = name || pet.name;
    pet.type = type || pet.type;
    pet.age = age !== undefined ? age : pet.age;
    pet.adopted = adopted !== undefined ? adopted : pet.adopted;

    res.json(pet);
});

// DELETE - Delete a pet by ID
app.delete("/pets/:id", (req, res) => {
    const petIndex = pets.findIndex(p => p.id === parseInt(req.params.id));
    if (petIndex === -1) return res.status(404).json({ message: "Pet not found" });

    pets.splice(petIndex, 1);
    res.json({ message: "Pet removed successfully" });
});