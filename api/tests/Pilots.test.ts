describe("Create Pilot", () => {
  describe("Pre Conditions", () => {
    test("Pilot certification must be a string with length 7 composed solely of digits", async () => {
      //TODO
    });

    test("Pilot certification must have a valid Luhn's checksum", async () => {
      //TODO
    });

    test("Pilot certification must be unique among pilots", async () => {
      //TODO
    });

    test("Pilot name must be a non empty string composed solely of letters and whitespace", async () => {
      //TODO
    });

    test("Pilot age must be an integer greater or equal than 18", async () => {
      //TODO
    });

    test("Pilot credits must be a decimal", async () => {
      //TODO
    });

    test("Pilot current location id must be a non empty string", async () => {
      //TODO
    });

    test("Pilot current location id must reference an existing planet", async () => {
      //TODO
    });

    test("Pilot ship id must either be undefined, null or a string", async () => {
      //TODO
    });

    test("Pilot ship id, when not a nullable value, must reference an existing ship", async () => {
      //TODO
    });

    test("Pilot ship id, when not a nullable value, must reference a ship that is unowned", async () => {
      //TODO
    });
  });

  describe("Post Conditions", () => {
    test("Pilot is properly created", async () => {
      //TODO
    });
  });
});

describe("Travel", () => {
  describe("Pre Conditions", () => {
    test("Pilot id parameter must reference an existing pilot", async () => {
      //TODO
    });

    test("The referenced pilot must own a ship", async () => {
      //TODO
    });

    test("Destination planet id parameter must reference an existing planet", async () => {
      //TODO
    });

    test("Origin and destination planet must be different", async () => {
      //TODO
    });

    test("It must be possible to travel from the origin planet to the destination planet", async () => {
      //TODO
    });

    test("There must be enough fuel in the ship", async () => {
      //TODO
    });
  });

  describe("Post Conditions", () => {
    test("Ship fuel level is updated", async () => {
      //TODO
    });

    test("Pilot current location is updated", async () => {
      //TODO
    });

    test("Eligible contracts are closed", async () => {
      //TODO
    });
  });
});

describe("Refuel", () => {
  describe("Pre Conditions", () => {
    test("Amount must be a positive integer", async () => {
      //TODO
    });

    test("Pilot id must reference an existing pilot", async () => {
      //TODO
    });

    test("The referenced pilot must own a ship", async () => {
      //TODO
    });

    test("The referenced pilot must have sufficient funds for the refuel", async () => {
      //TODO
    });

    test("Ship must have enough room for the new fuel", async () => {
      //TODO
    });
  });

  describe("Post Conditions", () => {
    test("Refill entry is properly created", async () => {
      //TODO
    });

    test("Ship fuel level is updated", async () => {
      //TODO
    });

    test("Pilot credits is updated", async () => {
      //TODO
    });
  });
});

describe("Accept Contract", () => {
  describe("Pre Conditions", () => {
    test("Pilot id must reference an existing pilot", async () => {
      //TODO
    });

    test("Referenced pilot must own a ship", async () => {
      //TODO
    });

    test("Contract id must reference an existing contract", async () => {
      //TODO
    });

    test("Contract must be still open", async () => {
      //TODO
    });

    test("Pilot must be in the contract's origin planet to accept it", async () => {
      //TODO
    });

    test("Contract's payload weight must be within the current ship capacity", async () => {
      //TODO
    });
  });

  describe("Post Conditions", () => {

  });
});