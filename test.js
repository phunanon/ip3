for (let a = 0; a < 255; ++a) {
  for (let b = 0; b < 255; ++b) {
    console.log(`${a}.${b}.0.0`);
    for (let c = 0; c < 255; ++c) {
      for (let d = 0; d < 255; ++d) {
        const ip = `${a}.${b}.${c}.${d}`;
        const triplet = MakeTriplet(ip);
        const parsedTriplet = ParseTriplet(triplet);
        if (parsedTriplet !== ip) {
          console.log(ip, triplet, parsedTriplet);
          a = 255;
          b = 255;
          c = 255;
          d = 255;
          break;
        }
      }
    }
  }
}
