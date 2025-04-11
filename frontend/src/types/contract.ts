type Airport = {
    icao: string;
    name: string;
    cover_image_url: string | null;
    lat: number;
    lon: number;
};

type Aircraft = {
    id: string;
    type: string;
    tail_number: string;
    fuel_liters: number;
    cover_image_url: string | null;
    aircraft_maintenance_state: any;
};

export type Contract = {
    id: string;
    name: string;
    description: string;
    from_airport: Airport;
    to_airport: Airport;
    aircraft_id: Aircraft;
    payload: string;
    payout: number;
    deadline: string;
    status: string;
};
  