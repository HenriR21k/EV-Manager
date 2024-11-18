class Location {
    constructor(id, evlocation, reservations = [] ) {
            this.id = id;
            this.evlocation = evlocation;
            this.reservations = reservations;
    }
}

export default Location;