
export const IMAGES = {
  hotel_adlon: require('../assets/hotel_adlon.png'),
  bayerischer_hof: require('../assets/bayerischer_hof.png'),
  atlantic_hamburg: require('../assets/atlantic_hamburg.png'),
  hotel_elephant: require('../assets/hotel_elephant.png'),
  brenners_baden: require('../assets/brenners_baden.png'),
  the_fontenay: require('../assets/the_fontenay.png'),
  mandarin_munich: require('../assets/mandarin_munich.png'),
  das_stue: require('../assets/das_stue.png'),

  englischer_garten: require('../assets/park_englischer_garten.png'),
  tiergarten: require('../assets/park_tiergarten.png'),
  herrenhausen: require('../assets/park_herrenhausen.png'),
  viktoriapark: require('../assets/park_viktoriapark.png'),
  luisenpark: require('../assets/park_luisenpark.png'),
  palmengarten: require('../assets/park_palmengarten.png'),
  zwinger_gardens: require('../assets/park_zwinger_gardens.png'),
  babelsberg: require('../assets/park_babelsberg.png'),

  brandenburg_gate: require('../assets/mon_brandenburg_gate.png'),
  neuschwanstein: require('../assets/mon_neuschwanstein.png'),
  cologne_cathedral: require('../assets/mon_cologne_cathedral.png'),
  reichstag: require('../assets/mon_reichstag.png'),
  frauenkirche: require('../assets/mon_frauenkirche.png'),
  heidelberg_castle: require('../assets/mon_heidelberg_castle.png'),
  porta_nigra: require('../assets/mon_porta_nigra.png'),
  museum_island: require('../assets/mon_museum_island.png'),
  fallback: require('../assets/mon_brandenburg_gate.png'),
} as const;

export type ImageKey = keyof typeof IMAGES;
