/**
 * A colour per octave, so the same pitch class in different octaves reads
 * differently (and the bass / inversion of a voicing becomes visible).
 * Tuned to the Hawaii palette: ocean → palm → sand → coral as pitch rises.
 */
export function octaveColor(oct: number): string {
  switch (oct) {
    case 1:
      return "#03045e"; // abyss
    case 2:
      return "#0077b6"; // deep ocean
    case 3:
      return "#00b4d8"; // ocean
    case 4:
      return "#52b788"; // palm
    case 5:
      return "#f4c542"; // sand / sun
    case 6:
      return "#ef6f53"; // coral
    case 7:
      return "#f43f5e"; // hibiscus
    default:
      return "#90a4ae";
  }
}
