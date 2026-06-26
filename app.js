const express = require('express')
const app = express();

app.use(express.json());

function logger(req, res, next) {
    console.log(req.method, req.url);
    next();
}
app.use(logger);

//Explain: if the middleware is below the routes. it may not run for requests 
//that already matched a route and sent a response. Express runs middleware
//and routes from top to bottom 


let plants = [
    { id: 1, name: "Snake Plant", type: "Succulent", sunlight: "Low", watered: true },
    { id: 2, name: "Pothos", type: "Vine", sunlight: "Medium", watered: false },
    { id: 3, name: "Monstera", type: "Tropical", sunlight: "Medium", watered: true },
    { id: 4, name: "Cactus", type: "Succulent", sunlight: "High", watered: false },
];

let nextId = 5;

let careNotes = [
    { id: 1, plantId: 1, note: "Water every 2 weeks" },
    { id: 2, plantId: 1, note: "Keep away from pets" },
    { id: 3, plantId: 3, note: "Mist leaves occasionally" },
];

let nextNoteId = 4;


function validatePlant(req, res, next) {
    const {name, type} = req.body;

    if (!name || !type) {
        return res.status(404).json({error: "name and type are required"})
    }
    next(); 
}

//Explain: the middleware here is good because it checks the data before the route create something. 
// if middleware never calls next() and never sends request get stuck. postman keeps waiting because express was never
//told to continue or finish. 


app.get("/api/plants", (req, res, next) => {
    try {
        const type = req.query.type;
        if (type) {
            const matchingPlants = plants.filter((plant) => plant.type === type);
            res.json(matchingPlants);
        }
        res.json(plants);
    } catch (err) {
        next(err);
    }
})
// Explain: What is the difference between req.params and req.query ?Give one example of when you would use each one.

// req.params is for things that are specifically named in the url path
//that are designated within the objects within the array. /api/plants/3 you would use req.params.id to referenct the plant with the id: 3 
//whereas req.query would be used for to filter or sort for a match
//and thats where i used req.query.type  to specify matches for Succulents in the which is what /api/plants?type=Succulent

app.get("/api/plants/:id", async (req, res, next) => {
    try {
        const plantId = Number(req.params.id);

        const foundPlant = plants.find((plant) => plant.id === plantId);

        if (!foundPlant) {
            return res.status(404).json({ error: "Plant not found" })
        }
        await new Promise((resolve) =>
            setTimeout(resolve, 500));

        res.json(foundPlant);
    } catch (err) {
        next(err);
    }
})

app.post("/api/plants", validatePlant, (req, res, next) => {
    try {
        const { name, type, sunlight, watered } = req.body;
        const newPlant = {
            id: nextId,
            name,
            type,
            sunlight,
            watered
        }
        nextId++;
        plants.push(newPlant);
        res.status(201).json(newPlant)
    } catch (err) {
        next(err)
    }
})

app.patch("/api/plants/:id", (req, res, next) => {
    try {
        const plantId = Number(req.params.id);
        const foundPlant = plants.find((plant) => plant.id === plantId);

        if (!foundPlant) {
            return res.status(404).json({ error: "PLaNt No DER" })
        }
        Object.assign(foundPlant, req.body);

        res.status(200).json(foundPlant)
    } catch (err) {
        next(err);
    }
})

app.delete("/api/plants/:id", (req, res, next) => {
    try {
        const plantId = Number(req.params.id);
        const plantIndex = plants.findIndex((plant) => plant.id === plantId)
        if (plantIndex === -1) {
            return res.status(404).json({ error: "plant says say less girrrl" })
        }
        plants.splice(plantIndex, 1);

        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
})



//CARENOTES ROUTES!!

app.get("/api/plants/:plantId/notes", (req, res, next) => {
    try {
        const plantId = Number(req.params.plantId);

        const foundPlant = plants.find((plant) => plant.id === plantId);

        if (!foundPlant) {
            return res.status(404).json({error: "Plant Not Found"})
        }

        const notesForPlant = careNotes.filter((notes) => notes.plantId === plantId)

        res.json(notesForPlant);
    } catch(err) {
        next (err);
    }
})
app.post("/api/plants/:plantId/notes", (req, res, next) => {
    try {
        const plantId = Number(req.params.plantId)
        const {note} = req.body;
        const newNotes = {
            id: nextNoteId,
            plantId: plantId,
            note: note,
        }
        nextNoteId++;
        careNotes.push(newNotes);
        res.status(201).json(newNotes)
    } catch (err) {
        next(err);
    }
})
app.delete("/api/notes/:id", (req, res, next) => {
    try {
        const notesId = Number(req.params.id);
        const plantId = Number(req.params.id);

        const notesIndex = careNotes.findIndex((note) => note.id === notesId);

        if (notesIndex === -1) {
            return res.status(404).json({error: "thouith spilt thine tea"})
        }
        careNotes.splice(notesIndex, 1);
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
})


app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({error: "something went wrong on the server"})
})

// Explain: Express knows this is error-handling middleware because it has four
// parameters: err, req, res, next. The first parameter receives the error that
// was passed from next(err).

app.listen(8080, () => {
    console.log('Server 8080 is running!!');

})

// Part 4 Explain:

// If I stop and restart node app.js the plants array releaseEvents because it is only stored
//in memory. 

//If two people send requrest to the same api here while the server is running they will 
//see the same plant array since both are using the same running servery memory.

//for the data to survive a restart, it would need to live somewhere outside the running server
//memory, like a database or local file. when the server starts again, it can load the saved data back. 