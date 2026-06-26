const express = require('express')
const app = express();

app.use(express.json());


let plants = [
    { id: 1, name: "Snake Plant", type: "Succulent", sunlight: "Low", watered: true },
    { id: 2, name: "Pothos", type: "Vine", sunlight: "Medium", watered: false },
    { id: 3, name: "Monstera", type: "Tropical", sunlight: "Medium", watered: true },
    { id: 4, name: "Cactus", type: "Succulent", sunlight: "High", watered: false },
];

let nextId = 5;

let careNotes = [
    { id: 1, plantId: 1, text: "Water every 2 weeks" },
    { id: 2, plantId: 1, text: "Keep away from pets" },
    { id: 3, plantId: 3, text: "Mist leaves occasionally" },
];

let nextNoteId = 4;

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

app.post("/api/plants", (req, res, next) => {
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
        const plantId = Number(req.params.id);

        const foundPlant = plants.find((plant) => plant.id === plantId);

        if (!plant) {
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
        const {text} = req.body;
        const newNotes = {
            id: nextNoteId,
            plantId,
            text,
        }
        nextNoteId++;
        careNotes.push(newNotes);
        res.status(201).json(newNotes)
    } catch (err) {
        next(err);
    }
})
app.delete("/api/plants/:plantId/notes", (req, res, next) => {
    try {
        const notesId = Number(req.params.id);
        const plantId = Number(req.params.id);

        const notesIndex = careNotes.findIndex((note) => note.id === notesId && note.plantId ===plantId);

        if (notesIndex === -1) {
            return res.status(404).json({error: "thouith spilt thine tea"})
        }
        careNotes.splice(notesIndex, 1);
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
})





app.listen(8080, () => {
    console.log('Server 8080 is running!!');

})