const { createConnection } = require("typeorm");
const uuid = require("uuid").v4;
require("dotenv").config();

async function main() {
  const connection = await createConnection({
    type: process.env.TYPEORM_CONNECTION,
    host: process.env.TYPEORM_HOST,
    database: process.env.TYPEORM_DATABASE,
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    port: process.env.TYPEORM_PORT
  });

  async function createPlanet(name) {
    const id = uuid();
    await connection.query(`
      INSERT INTO Planets (id, name)
      VALUES ('${id}', '${name}')
    `);

    return id;
  }

  async function createTravellingData(originPlanetId,
                                      destinationPlanetId,
                                      fuelConsumption) {
    const id = uuid();
    await connection.query(`
      INSERT INTO TravellingData (id, originPlanetId, destinationPlanetId, fuelConsumption)
      VALUES ('${id}', '${originPlanetId}', '${destinationPlanetId}', ${fuelConsumption})
    `);
  }
  
  const [
    andvariId,
    demeterId,
    aquaId,
    calasId
  ] = await Promise.all([
    createPlanet("Andvari"),
    createPlanet("Demeter"),
    createPlanet("Aqua"),
    createPlanet("Calas")
  ]);

  await Promise.all([
    createTravellingData(andvariId, aquaId, 13),
    createTravellingData(andvariId, calasId, 23),

    createTravellingData(demeterId, aquaId, 22),
    createTravellingData(demeterId, calasId, 25),

    createTravellingData(aquaId, demeterId, 30),
    createTravellingData(aquaId, calasId, 12),
    
    createTravellingData(calasId, andvariId, 20),
    createTravellingData(calasId, demeterId, 25),
    createTravellingData(calasId, aquaId, 15),
  ]);

  await connection.close();
}

main();