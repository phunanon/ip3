const e = x => document.querySelector(x);
const max = BigInt(Math.ceil(Math.cbrt(256 ** 4)));
const numWords = BigInt(new Set(words).size);

//Assertion that there are no duplicate words
if (numWords !== BigInt(words.length)) {
  alert(`You have duplicate words.`);
}

//Assertion that there are enough words in the dictionary for a triplet
if (numWords !== max) {
  alert(`You have ${numWords} words but you need need exactly ${max}.`);
}

async function DomLoad() {
  e("input#domain").addEventListener("keypress", e => {
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
  const [a, b, c] = [x, y, z].map(word => BigInt(words.indexOf(word)));
  if (a < 0 || b < 0 || c < 0) return;
  const sum = a + b * max + c * max * max;
  const [b3, b2, b1, b0] = [sum, sum, sum, sum].map(
    (x, i) => (x / 256n ** BigInt(i)) % 256n,
  );
  return `${b0}.${b1}.${b2}.${b3}`;
}

function MakeTriplet(ip) {
  const [b0, b1, b2, b3] = ip.split(".").map(x => BigInt(parseInt(x)));
  const sum = b0 * 256n ** 3n + b1 * 256n ** 2n + b2 * 256n + b3;
  const digits = [sum % max, (sum / max) % max, (sum / max ** 2n) % max];
  const triplet = digits.map(i => words[Number(i)]).join("-");
  //Assertion
  const ip2 = ParseTriplet(triplet);
  if (ip !== ip2) alert(`Assertion failed: ${ip} != ${ip2}`);
  return triplet;
}

async function DomCalculate() {
  const input = e("input#domain");
  const domain = input.value;
  const regex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
  const ip = domain.match(regex) ? domain : (await GetIp(domain)) ?? domain;
  if (!ip.match(regex)) return alert("Invalid IP address or domain name.");
  input.value = ip;
  const triplet = MakeTriplet(ip);
  const result = e("h3#result");
  result.innerHTML = "";
  const a = document.createElement("a");
  a.href = `#${triplet}`;
  a.innerText = triplet;
  result.appendChild(a);
  a.addEventListener("click", () => {
    window.location.hash = triplet;
    window.location.reload();
  });
}
