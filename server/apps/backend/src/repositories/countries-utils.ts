import Big from 'big.js';

export const europeanCountries: Record<string, [number, number]> = {
  DE: [1.2, 190995],
  UK: [1.21, 152741],
  FR: [1.2, 151381],
  IT: [1.25, 143550],
  ES: [1.19, 109023],
  PL: [1.21, 90574],
  RO: [1.2, 46640],
  NL: [1.2, 39842],
  BE: [1.24, 26510],
  EL: [1.2, 25338],
  CZ: [1.19, 24755],
  PT: [1.23, 24261],
  HU: [1.27, 23141],
  SE: [1.23, 23047],
  AT: [1.22, 20254],
  BG: [1.21, 16905],
  DK: [1.21, 13348],
  FI: [1.17, 12903],
  SK: [1.18, 12767],
  IE: [1.21, 10894],
  HR: [1.23, 9952],
  LT: [1.23, 6844],
  SI: [1.24, 4858],
  LV: [1.2, 4656],
  EE: [1.22, 3094],
  CY: [1.21, 2],
  LU: [1.25, 1],
  MT: [1.2, 1],
};

export const scale = (factor: number) => (price: number) => new Big(price).times(factor).toNumber();
