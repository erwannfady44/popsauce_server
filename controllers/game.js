const {Sequelize} = require("sequelize");
const Pokemon = require('../models/index').pokemon;


exports.create = (req, res, next) => {
    const id = Math.floor(Math.random() * 999);
    console.log(id);
    res.status(200).json({gameNumber: id});db
}

exports.play = (wss) => {
    let pokemon;
    wss.on('connection', async (ws) => {
        //Si l'elt cherché n'est pas init
        ws.score = 0;
        if (!wss.search) {
            nextCard()
        }

        pokemon = await getPokemon();

        let url = "https://assets.pokemon.com/assets/cms2/img/pokedex/full/";

        if (pokemon.pokedexId < 10)
            url += "00" + pokemon.pokedexId
        else if (pokemon.pokedexId < 100)
            url += "0" + pokemon.pokedexId
        else
            url += pokemon.pokedexId
        url += ".png";

        ws.send(JSON.stringify({
            name: pokemon.name,
            url: url
        }))

        ws.on('message', (msg) => {
            const data = JSON.parse(msg.toString());
            if (data.pseudo)
                ws.pseudo = data.pseudo;
            if (data.answer === pokemon.name) {
                ws.send(JSON.stringify({state: "win"}));
                nextCard();
            }
            else
                ws.send(JSON.stringify({error : "wrong answer"}))
        })
    })

    async function nextCard() {
        wss.search = Math.floor(Math.random() * 721);
        pokemon = await getPokemon();

        let url = "https://assets.pokemon.com/assets/cms2/img/pokedex/full/";

        if (pokemon.pokedexId < 10)
            url += "00" + pokemon.pokedexId
        else if (pokemon.pokedexId < 100)
            url += "0" + pokemon.pokedexId
        else
            url += pokemon.pokedexId
        url += ".png";

        broadCast(0, {
            name: pokemon.name,
            url: url
        })
    }



    function broadCast(idGame, data) {
        for (let client of wss.clients) {
            client.send(JSON.stringify(data));
        }
    }

    function getPokemon() {
        return new Promise(((resolve, reject) => {
            Pokemon.findOne({
                where: {
                    pokedexId : wss.search
                }
            }).then((p) => resolve(p))
                .catch((e) => reject(e));
        }))
    }
}