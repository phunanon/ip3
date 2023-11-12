const e = (x) => document.querySelector(x);

async function DomLoad() {
  e("input#domain").addEventListener("keypress", (e) => {
    if (e.key !== "Enter") return;
    DomCalculate();
  });
  const hash = window.location.hash;
  if (!hash) return;
  const [_, triplet, path] = [...hash.match(/^#(.+?-.+?-.+?)(\/.+?)?$/)];
  const ip = ParseTriplet(triplet);
  e("section#interstitial").style.display = "block";
  e("b#words").innerText = triplet;
  e("b#ip").innerText = ip;
  const url = path ? `${ip}${path}` : ip;
  e("#http-address").innerText = url;
  e("button#http").addEventListener("click", () => {
    window.location.href = `http://${url}`;
  });
}

async function GetIp(domain) {
  const url = `https://dns.google.com/resolve?name=${domain}&type=A`;
  const response = await fetch(url);
  const json = await response.json();
  if (!("Answer" in json)) return;
  const ip = json.Answer[0].data;
  return ip;
}

function ParseTriplet(triplet) {
  const [x, y, z] = triplet.split("-");
  if (!x || !y || !z) return;
  const [a, b, c] = [x, y, z].map((word) => words.indexOf(word));
  if (a < 0 || b < 0 || c < 0) return;
  const sum = a + b * words.length + c * words.length * words.length;
  const [b0, b1, b2, b3] = [sum, sum, sum, sum].map(
    (x, i) => Math.floor(x / 256 ** i) % 256
  );
  return `${b0}.${b1}.${b2}.${b3}`;
}

//Due to there being 12 billion available word combinations,
//  each IP can have three triplets each.
function MakeHashes(ip) {
  const len = BigInt(words.length);
  const max = 256n ** 4n;
  const [b0, b1, b2, b3] = ip.split(".").map((x) => BigInt(parseInt(x)));
  const sum = b0 + b1 * 256n + b2 * 256n * 256n + b3 * 256n * 256n * 256n;
  const makeTriplet = (sum) => [
    sum % len,
    (sum / len) % len,
    (sum / len ** 2n) % len,
  ];
  const sums = [sum, max + sum, max + max + sum].map(makeTriplet);
  const triplets = sums.map((x) => x.map((i) => words[Number(i)]).join("-"));
  //Assertion
  triplets.forEach((triplet) => {
    const ip2 = ParseTriplet(triplet);
    if (ip !== ip2) alert(`Assertion failed: ${ip} != ${ip2}`);
  });
  return triplets;
}

async function DomCalculate() {
  const input = e("input#domain");
  const domain = input.value;
  const regex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
  const ip = domain.match(regex) ? domain : (await GetIp(domain)) ?? domain;
  if (!ip.match(regex)) return alert("Invalid IP address or domain name.");
  input.value = ip;
  const triplets = MakeHashes(ip);
  const results = e("ul#results");
  results.innerHTML = "";
  triplets.forEach((triplet) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#${triplet}`;
    a.innerText = triplet;
    li.appendChild(a);
    results.appendChild(li);
    a.addEventListener("click", () => {
      window.location.hash = triplet;
      window.location.reload();
    });
  });
}
