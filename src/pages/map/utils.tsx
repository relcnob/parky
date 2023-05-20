type OSMdata = {
  address: {
    town?: string;
    city?: string;
    state_district: string;
    muncipality?: string;
    state?: string;
    postcode: string;
    country: string;
    country_code: string;
    village?: string;
    road?: string;
    house_number?: string;
    suburb?: string;
    hamlet?: string;
    locality?: string;
    isolated_dwelling?: string;
  };
  lat: number;
  lon: number;
  display_name: string;
  class: string;
  type: string;
  importance: string;
  icon: string;
  osm_id: number;
  osm_type: string;
  licence: string;
  place_id: number;
  boundingbox: [number];
};

export default OSMdata;
