type Airport = {
    icao: string;
    name: string;
    cover_image_url: string | null;
};

type Aircraft = {
    type: string;
    tail_number: string;
    cover_image_url: string | null;
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
  