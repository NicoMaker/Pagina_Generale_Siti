const $ = (id) => document.getElementById(id);
let rgb = [42, 125, 225];

const clamp = (v, a, b) => Math.min(b, Math.max(a, Math.round(+v) || 0));
const toHex = (c) =>
  "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
const fromHex = (v) =>
  v.length === 4
    ? [1, 2, 3].map((i) => parseInt(v[i] + v[i], 16))
    : [1, 3, 5].map((i) => parseInt(v.substr(i, 2), 16));

function toHsl([r, g, b]) {
  r /= 255;
  g /= 255;
  b /= 255;
  const m = Math.max(r, g, b),
    n = Math.min(r, g, b),
    d = m - n;
  let h = 0,
    s = 0;
  const l = (m + n) / 2;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    h =
      m === r ? ((g - b) / d) % 6 : m === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}
function fromHsl(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12,
    a = s * Math.min(l, 1 - l);
  const f = (n) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)].map((v) => Math.round(v * 255));
}
function lum(c) {
  const [r, g, b] = c.map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a, b) {
  const x = lum(a),
    y = lum(b);
  return ((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2);
}

function render(skip) {
  const H = toHex(rgb),
    [h, s, l] = toHsl(rgb);
  document.documentElement.style.setProperty("--c", H);
  $("sw").style.color = lum(rgb) > 0.4 ? "#000" : "#fff";
  $("big").textContent = H.toUpperCase();
  $("pk").value = H;
  if (skip !== "hex") $("hex").value = H;
  if (skip !== "rgb") {
    $("r").value = rgb[0];
    $("g").value = rgb[1];
    $("b").value = rgb[2];
  }
  if (skip !== "hsl") {
    $("h").value = h;
    $("s").value = s;
    $("l").value = l;
  }
  $("oh").textContent = H.toUpperCase();
  $("or").textContent = `rgb(${rgb.join(", ")})`;
  $("ol").textContent = `hsl(${h}, ${s}%, ${l}%)`;
  $("rw").textContent = "Bianco " + ratio(rgb, [255, 255, 255]) + ":1";
  $("rb").textContent = "Nero " + ratio(rgb, [0, 0, 0]) + ":1";
  buildShades(h, s);
}

function buildShades(h, s) {
  const box = $("shades");
  box.innerHTML = "";
  [92, 80, 68, 56, 44, 32, 22, 12].forEach((l) => {
    const c = fromHsl(h, s, l),
      b = document.createElement("button");
    b.type = "button";
    b.style.background = toHex(c);
    b.setAttribute("aria-label", toHex(c));
    b.addEventListener("click", () => {
      rgb = c;
      render();
    });
    box.appendChild(b);
  });
}

$("hex").addEventListener("input", (e) => {
  let v = e.target.value.trim();
  if (!v.startsWith("#")) v = "#" + v;
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) {
    rgb = fromHex(v);
    render("hex");
  }
});
$("pk").addEventListener("input", (e) => {
  rgb = fromHex(e.target.value);
  render();
});
["r", "g", "b"].forEach((k, i) =>
  $(k).addEventListener("input", (e) => {
    rgb[i] = clamp(e.target.value, 0, 255);
    render("rgb");
  }),
);
["h", "s", "l"].forEach((k) =>
  $(k).addEventListener("input", () => {
    rgb = fromHsl(
      clamp($("h").value, 0, 360),
      clamp($("s").value, 0, 100),
      clamp($("l").value, 0, 100),
    );
    render("hsl");
  }),
);
$("rnd").addEventListener("click", () => {
  rgb = [0, 0, 0].map(() => Math.floor(Math.random() * 256));
  render();
});

document.querySelectorAll("button[data-c]").forEach((b) =>
  b.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText($(b.dataset.c).textContent);
      b.textContent = "Copiato";
      setTimeout(() => (b.textContent = "Copia"), 1200);
    } catch (e) {
      /* clipboard non disponibile */
    }
  }),
);

render();
