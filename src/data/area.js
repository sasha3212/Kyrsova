export const AREA = {
  name: 'Одеська акваторія · умовний сектор',
  bbox: {
    west: 30.4,
    east: 30.95,
    south: 46.35,
    north: 46.6,
  },
  width: 1000,
  height: 620,
};

export const OBSERVATION_POST = {
  id: 'OP-1',
  name: 'Пост спостереження «.Argus-1»',
  lat: 46.485,
  lon: 30.73,
};

export const COASTLINE = [
  [30.4, 46.6],
  [30.52, 46.575],
  [30.62, 46.545],
  [30.68, 46.52],
  [30.72, 46.5],
  [30.745, 46.478],
  [30.77, 46.455],
  [30.8, 46.43],
  [30.84, 46.408],
  [30.88, 46.385],
  [30.95, 46.36],
];

export const LAND_POLYGON = [
  ...COASTLINE,
  [30.95, 46.6],
  [30.4, 46.6],
];

export const WATER_POLYGON = [
  ...COASTLINE,
  [30.95, 46.35],
  [30.4, 46.35],
];

export const RANGE_RINGS_NM = [2, 5, 10];
