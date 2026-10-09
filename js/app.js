// Az oktatási oldalak közös segédfüggvényei.
// A tartalom az adat.js fájlban van (window.TEMAK, window.ALAP_FELADATOK …);
// szerkeszteni az admin.html oldalon lehet.

function masolat(ertek, alap) {
  return JSON.parse(JSON.stringify(ertek === undefined ? alap : ertek));
}

function getFeladatok() { return masolat(window.ALAP_FELADATOK, []); }
function getTemak() { return masolat(window.TEMAK, {}); }
function getBeallitasok() { return masolat(window.BEALLITASOK, {}); }

// Vesszővel elválasztott lista szövegből (pl. évfolyamok, címkék)
function vesszosLista(szoveg) {
  return String(szoveg == null ? "" : szoveg).split(",").map(s => s.trim()).filter(s => s !== "");
}

// Az osztályok (évfolyamok) a beállításokból, pl. "9, 10"
function getOsztalyok() {
  return vesszosLista(getBeallitasok().evfolyamok || "9, 10");
}

function osztalyNev(n) {
  return String((getBeallitasok().menu || {}).osztaly || "{n}. osztály").replace("{n}", n);
}

// Egy osztály feladatai feladatsoronként, azon belül az admin felületen beállított sorrendben
function osztalyFeladatai(feladatok, n) {
  return feladatok
    .map((f, i) => ({ f: f, i: i }))
    .filter(x => String(x.f.evfolyam) === String(n))
    .sort((a, b) => (Number(a.f.sor) || 1) - (Number(b.f.sor) || 1) || a.i - b.i)
    .map(x => x.f);
}

function feladatsorCim(osztaly, sor) {
  const talalat = (getBeallitasok().feladatsorok || [])
    .find(s => String(s.osztaly) === String(osztaly) && Number(s.sor) === Number(sor));
  return talalat ? talalat.cim : "";
}

// Feladatsor felirata: ha az osztálynak csak egy sora van, nem kell sorszám
function feladatsorFelirat(s, db) {
  const szam = db > 1 ? s.sor + ". feladatsor" : "Feladatsor";
  return szam + (s.cim ? ": " + s.cim : "");
}

// Egy osztály feladatsorai: [{ sor, cim, feladatok, perc }]
function feladatsorok(feladatok, osztaly) {
  const sorok = [];
  osztalyFeladatai(feladatok, osztaly).forEach(f => {
    const n = Number(f.sor) || 1;
    let s = sorok.find(x => x.sor === n);
    if (!s) sorok.push(s = { sor: n, cim: feladatsorCim(osztaly, n), feladatok: [], perc: 0 });
    s.feladatok.push(f);
    s.perc += Number(f.ido) || 0;
  });
  return sorok;
}

function temaNev(kulcs) {
  const t = getTemak() || {};
  return t[kulcs] || kulcs || "Egyéb";
}

function esc(szoveg) {
  return String(szoveg == null ? "" : szoveg)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Link cél ellenőrzése: csak http(s), mailto, oldalon belüli relatív cím vagy horgony.
// (Így egy elírt vagy rosszindulatú „javascript:” link sem futhat le.)
function biztonsagosUrl(url) {
  url = String(url || "").trim();
  if (/^(https?:|mailto:)/i.test(url)) return url;
  if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith("//")) return "";
  return url;
}

// Egyszerű formázás: `kód`, **félkövér**, *dőlt*, [link szövege](cím)
function soronBelul(szoveg) {
  return esc(szoveg)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (m, sz, url) => {
      const cel = biztonsagosUrl(url.replace(/&amp;/g, "&"));
      if (!cel) return sz;
      return /^https?:/i.test(cel)
        ? '<a href="' + esc(cel) + '" target="_blank" rel="noopener">' + sz + "</a>"
        : '<a href="' + esc(cel) + '">' + sz + "</a>";
    });
}

// Bekezdések: üres sor = új bekezdés, sima sortörés = <br>
function formazSzoveg(szoveg) {
  return String(szoveg || "")
    .split(/\n\s*\n/)
    .filter(b => b.trim() !== "")
    .map(b => "<p>" + soronBelul(b).replace(/\n/g, "<br>") + "</p>")
    .join("");
}

function osztalyCimke(e) {
  return '<span class="cimke e' + esc(e) + '">' + esc(osztalyNev(e)) + "</span>";
}

function urlParam(nev) {
  return new URLSearchParams(location.search).get(nev);
}

function feladatKartya(f) {
  const lepesDb = (f.lepesek || []).filter(l => l && (l.kod || l.magyarazat)).length;
  return '<a class="kartya feladat-kartya" href="feladat.html?id=' + encodeURIComponent(f.id) + '">' +
    '<div class="fejsor"><span class="cimke tema">' + esc(temaNev(f.tema)) + "</span></div>" +
    "<h3>" + esc(f.cim) + "</h3>" +
    "<p>" + soronBelul(f.rovid) + "</p>" +
    '<div class="kartya-lab"><span>' + (Number(f.ido) || "?") + " perc</span><span>" + esc(osztalyNev(f.evfolyam)) + "</span>" +
    (lepesDb ? "<span>" + lepesDb + " lépés</span>" : "") + "</div></a>";
}

// ===== Feladatoldal blokkjai =====

// Mit kér a feladat: bemenet / kimenet / feltétel
function specTabla(s) {
  if (!s) return "";
  const sorok = [
    ["Bemenet", s.bemenet],
    ["Kimenet", s.kimenet],
    ["Feltétel", s.feltetel]
  ].filter(p => String(p[1] || "").trim() !== "");
  if (!sorok.length) return "";
  return '<dl class="spec">' + sorok.map(p =>
    "<div><dt>" + p[0] + "</dt><dd>" + soronBelul(p[1]) + "</dd></div>").join("") + "</dl>";
}

// Kód lépésről lépésre: számozott lépések kóddal és magyarázattal
function kodLepesek(lepesek) {
  const lista = (lepesek || []).filter(l => l && (l.kod || l.magyarazat));
  if (!lista.length) return "";
  return '<ol class="kod-lepesek">' + lista.map(l =>
    "<li>" +
    (l.cim ? "<h3>" + soronBelul(l.cim) + "</h3>" : "") +
    (String(l.kod || "").trim() ? kodBlokk(String(l.kod).replace(/\s+$/, "")) : "") +
    (String(l.magyarazat || "").trim()
      ? '<div class="lepes-magyarazat">' + formazSzoveg(l.magyarazat) + "</div>" : "") +
    "</li>").join("") + "</ol>";
}

// Nyomkövető táblázat: { fejlec: [...], sorok: [[...]], megjegyzes: "" }
function nyomkovetesTabla(ny) {
  if (!ny || !Array.isArray(ny.sorok) || !ny.sorok.length) return "";
  const fejlec = (ny.fejlec || []).map(c => "<th>" + esc(c) + "</th>").join("");
  const torzs = ny.sorok.map(sor => {
    const kiemelt = sor.length && String(sor[sor.length - 1]) === "*";
    const cellak = (kiemelt ? sor.slice(0, -1) : sor).map(c => "<td>" + esc(c) + "</td>").join("");
    return '<tr class="' + (kiemelt ? "kiemelt" : "") + '">' + cellak + "</tr>";
  }).join("");
  return '<div class="nyomkovetes"><table>' +
    (fejlec ? "<thead><tr>" + fejlec + "</tr></thead>" : "") +
    "<tbody>" + torzs + "</tbody></table></div>" +
    (String(ny.megjegyzes || "").trim() ? formazSzoveg(ny.megjegyzes) : "");
}

// ===== Python kódszínezés =====
const PY_KULCSSZAVAK = "def return if elif else for while in not and or import from as True False None break continue pass class lambda global is try except with yield".split(" ");
const PY_BEEPITETT = "print input int float str bool len range list dict set tuple max min sum sorted abs round enumerate zip open".split(" ");

function kiemelPython(kod) {
  const minta = /(#[^\n]*)|([fF]?"[^"\n]*"|[fF]?'[^'\n]*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)/g;
  let ki = "";
  let utolso = 0;
  let m;
  while ((m = minta.exec(kod)) !== null) {
    ki += esc(kod.slice(utolso, m.index));
    const t = m[0];
    if (m[1]) ki += '<span class="py-komment">' + esc(t) + "</span>";
    else if (m[2]) ki += '<span class="py-szoveg">' + esc(t) + "</span>";
    else if (m[3]) ki += '<span class="py-szam">' + esc(t) + "</span>";
    else if (PY_KULCSSZAVAK.includes(t)) ki += '<span class="py-kulcs">' + t + "</span>";
    else if (PY_BEEPITETT.includes(t)) ki += '<span class="py-beepitett">' + t + "</span>";
    else ki += esc(t);
    utolso = minta.lastIndex;
  }
  return ki + esc(kod.slice(utolso));
}

function masolVagolapra(szoveg, gomb) {
  const kesz = () => {
    const eredeti = gomb.textContent;
    gomb.textContent = "Kimásolva";
    setTimeout(() => { gomb.textContent = eredeti; }, 1500);
  };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(szoveg).then(kesz);
  } else {
    const t = document.createElement("textarea");
    t.value = szoveg;
    document.body.appendChild(t);
    t.select();
    document.execCommand("copy");
    t.remove();
    kesz();
  }
}

function kodBlokk(kod) {
  return '<div class="kod-doboz"><button class="masol-gomb" type="button">Másolás</button>' +
    '<pre class="kod">' + kiemelPython(kod) + "</pre></div>";
}

// A lapon lévő <pre class="kod"> blokkok színezése és másoló gomb hozzáadása
function kodokElokeszitese(gyoker) {
  (gyoker || document).querySelectorAll("pre.kod").forEach(pre => {
    if (!pre.dataset.kesz) {
      const nyers = pre.textContent.replace(/^\n/, "");
      pre.innerHTML = kiemelPython(nyers);
      pre.dataset.kesz = "1";
      pre.dataset.nyers = nyers;
    }
    let doboz = pre.parentElement;
    if (!doboz.classList.contains("kod-doboz")) {
      doboz = document.createElement("div");
      doboz.className = "kod-doboz";
      pre.replaceWith(doboz);
      doboz.appendChild(pre);
    }
    let gomb = doboz.querySelector(".masol-gomb");
    if (!gomb) {
      gomb = document.createElement("button");
      gomb.className = "masol-gomb";
      gomb.type = "button";
      gomb.textContent = "Másolás";
      doboz.prepend(gomb);
    }
    gomb.onclick = () => masolVagolapra(pre.dataset.nyers || pre.textContent, gomb);
  });
}

// ===== Fejléc és lábléc minden oktatási oldalon a beállításokból =====
function keretRajzol() {
  if (document.body.dataset.admin) return;  // az admin felületnek saját fejléce van
  const b = getBeallitasok();
  const fejlec = document.querySelector(".fejlec .kontener");

  // A fejlécben csak az oldalcím van, menügombok nélkül
  if (fejlec) {
    fejlec.innerHTML = '<a class="logo" href="index.html">' +
      (b.logoJel ? '<span class="jel">' + esc(b.logoJel) + "</span> " : "") + esc(b.oldalCim || "") + "</a>";
  }

  const lablec = document.querySelector(".lablec .kontener");
  if (lablec) lablec.innerHTML = soronBelul(b.lablec || "");

  document.title = (document.body.dataset.cim ? document.body.dataset.cim + " – " : "") + (b.oldalCim || "");
}

keretRajzol();
