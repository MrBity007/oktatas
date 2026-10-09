// Admin felület – Oktatás rész: feladatok (osztályonként), témák, beállítások szerkesztése.
// A save…() függvények és a fájlba mentés az admin-mentes.js-ben vannak.

let feladatok = getFeladatok();
let temak = getTemak();
let beallitasok = getBeallitasok();

let aktivId = null;

const $ = id => document.getElementById(id);

function ertesit(uzenet) {
  const d = document.createElement("div");
  d.className = "ertesites";
  d.textContent = uzenet;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 2200);
}

function soronkent(szoveg) {
  return String(szoveg || "").split("\n").map(s => s.trim()).filter(s => s !== "");
}

function azonositobol(szoveg, alapertelmezett) {
  return String(szoveg || "").toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || (alapertelmezett || "elem");
}

// ===== Szöveges formátum <-> szerkezet =====

// Blokkokra bontás: "===" sor választja el őket
function blokkokraBont(szoveg) {
  return String(szoveg || "").split(/\r?\n=+[ \t]*\r?\n/);
}

// Lépések: "### Cím", kód, "---", magyarázat
function lepesekBeolvas(szoveg) {
  return blokkokraBont(szoveg)
    .map(blokk => {
      const sorok = blokk.replace(/^\s*\r?\n/, "").split(/\r?\n/);
      let cim = "";
      if (sorok.length && /^#{2,3}\s*/.test(sorok[0])) cim = sorok.shift().replace(/^#{2,3}\s*/, "").trim();
      const valaszto = sorok.findIndex(s => /^-{3,}\s*$/.test(s));
      const kod = (valaszto < 0 ? sorok : sorok.slice(0, valaszto)).join("\n").replace(/^\s*\n/, "").replace(/\s+$/, "");
      const magyarazat = valaszto < 0 ? "" : sorok.slice(valaszto + 1).join("\n").replace(/^\s*\n/, "").replace(/\s+$/, "");
      return { cim: cim, kod: kod, magyarazat: magyarazat };
    })
    .filter(l => l.cim || l.kod || l.magyarazat);
}

function lepesekKiir(lepesek) {
  return (lepesek || []).map(l =>
    (l.cim ? "### " + l.cim + "\n" : "") + (l.kod || "") + "\n---\n" + (l.magyarazat || "")
  ).join("\n===\n");
}

// Nyomkövetés: fejléc + sorok "|"-lel, opcionálisan "---" után megjegyzés
function nyomkovetesBeolvas(szoveg) {
  const egesz = String(szoveg || "").trim();
  if (!egesz) return null;
  const reszek = egesz.split(/\r?\n-{3,}\s*\r?\n/);
  const sorok = reszek[0].split(/\r?\n/).filter(s => s.trim() !== "")
    .map(s => s.split("|").map(c => c.trim()));
  if (sorok.length < 2) return null;
  const eredmeny = { fejlec: sorok[0], sorok: sorok.slice(1) };
  if (reszek[1] && reszek[1].trim()) eredmeny.megjegyzes = reszek[1].trim();
  return eredmeny;
}

function nyomkovetesKiir(ny) {
  if (!ny || !Array.isArray(ny.sorok)) return "";
  const tabla = [(ny.fejlec || [])].concat(ny.sorok).map(sor => sor.join(" | ")).join("\n");
  return tabla + (ny.megjegyzes ? "\n---\n" + ny.megjegyzes : "");
}

// "Cím | szöveg" párok
function parokBeolvas(szoveg, aKulcs, bKulcs) {
  return soronkent(szoveg).map(sor => {
    const r = sor.split("|");
    const o = {};
    o[aKulcs] = (r[0] || "").trim();
    o[bKulcs] = r.slice(1).join("|").trim();
    return o;
  }).filter(o => o[aKulcs] || o[bKulcs]);
}

function parokKiir(lista, aKulcs, bKulcs) {
  return (lista || []).map(o => (o[aKulcs] || "") + " | " + (o[bKulcs] || "")).join("\n");
}

function nemUresObjektum(obj) {
  const eredmeny = {};
  let van = false;
  Object.keys(obj).forEach(k => {
    if (String(obj[k] || "").trim() !== "") { eredmeny[k] = obj[k].trim(); van = true; }
  });
  return van ? eredmeny : null;
}

// ===== Fülek =====
$("fulek").addEventListener("click", e => {
  const gomb = e.target.closest("button[data-panel]");
  if (!gomb) return;
  $("fulek").querySelectorAll("button").forEach(b => b.classList.toggle("aktiv", b === gomb));
  ["Feladatok", "Temak", "Beallitasok"].forEach(p => {
    $("panel" + p).hidden = p !== gomb.dataset.panel;
  });
});

function inditas() {
  valasztokFeltolt();
  allapotFrissit();

  if (feladatok.length) betolt(feladatok[0].id); else ujFeladat();
  temaUrlapFeltolt();
  beallitasUrlapFeltolt();
}

// A választólisták tartalma a beállításokból jön
function valasztokFeltolt() {
  $("m-evfolyam").innerHTML = getOsztalyok()
    .map(e => '<option value="' + esc(e) + '">' + esc(osztalyNev(e)) + "</option>").join("");

  $("m-nehezseg").innerHTML = vesszosLista(beallitasok.nehezsegek || "könnyű, közepes, nehéz")
    .map((n, i) => '<option value="' + (i + 1) + '">' + "★".repeat(i + 1) + " " + esc(n) + "</option>").join("");

  $("m-tema").innerHTML = Object.keys(temak)
    .map(k => '<option value="' + esc(k) + '">' + esc(temak[k]) + "</option>").join("");
}

function allapotFrissit() {
  const sorok = [];
  getOsztalyok().forEach(n => feladatsorok(feladatok, n).forEach(s => {
    sorok.push(esc(osztalyNev(n)) + " " + s.sor + ". sor: " + s.feladatok.length + " feladat, " +
      (s.perc === 30 ? s.perc + " perc ✓" : "<strong>" + s.perc + " perc</strong>"));
  }));
  $("allapotSav").innerHTML = "Jelenleg: " + (sorok.join(" · ") || "nincs feladat") + ".";
}

/* =====================================================================
   FELADATOK
   ===================================================================== */

function listaRajzol() {
  const szo = ($("adminKereso").value || "").toLowerCase();
  const illik = f => (f.cim || "").toLowerCase().includes(szo);
  const elem = f =>
    '<button type="button" class="elem' + (f.id === aktivId ? " aktiv" : "") + '" data-id="' + esc(f.id) + '">' +
    esc(f.cim || "(cím nélkül)") + '<br><span class="kis">' + (Number(f.ido) || "?") + " perc · " +
    "★".repeat(Number(f.nehezseg) || 1) + "</span></button>";

  let html = "";
  const osztalyok = getOsztalyok();
  osztalyok.forEach(n => {
    feladatsorok(feladatok, n).forEach(s => {
      const sajat = s.feladatok.filter(illik);
      if (!sajat.length) return;
      html += '<div class="kis" style="margin:12px 10px 4px;font-weight:700">' + esc(osztalyNev(n).toUpperCase()) +
        " – " + s.sor + ". FELADATSOR (" + s.perc + " perc)</div>" + sajat.map(elem).join("");
    });
  });
  const egyeb = feladatok.filter(f => !osztalyok.includes(String(f.evfolyam)) && illik(f));
  if (egyeb.length) html += '<div class="kis" style="margin:12px 10px 4px;font-weight:700">BESOROLATLAN</div>' + egyeb.map(elem).join("");

  $("adminLista").innerHTML = html || '<p class="kis" style="padding:10px">Nincs találat.</p>';
  $("adminLista").querySelectorAll("button.elem").forEach(b => {
    b.addEventListener("click", () => betolt(b.dataset.id));
  });
}

$("adminKereso").addEventListener("input", listaRajzol);

function betolt(id) {
  const f = feladatok.find(x => x.id === id);
  if (!f) return;
  aktivId = id;
  $("m-id").value = f.id || "";
  $("m-cim").value = f.cim || "";
  $("m-ido").value = f.ido || 5;
  $("m-evfolyam").value = String(f.evfolyam || getOsztalyok()[0] || 9);
  $("m-sor").value = String(f.sor || 1);
  $("m-tema").value = f.tema || Object.keys(temak)[0] || "";
  $("m-nehezseg").value = String(f.nehezseg || 1);
  $("m-tetel").value = f.tetel || "";
  $("m-forras").value = f.forras || "";
  $("m-spec-bemenet").value = (f.specifikacio || {}).bemenet || "";
  $("m-spec-kimenet").value = (f.specifikacio || {}).kimenet || "";
  $("m-spec-feltetel").value = (f.specifikacio || {}).feltetel || "";
  $("m-gyakorlas").value = (f.gyakorlas || []).map(g => g.nev + " | " + g.url).join("\n");
  $("m-rovid").value = f.rovid || "";
  $("m-leiras").value = f.leiras || "";
  $("m-bemenet").value = f.bemenet || "";
  $("m-kimenet").value = f.kimenet || "";
  $("m-tippek").value = (f.tippek || []).join("\n");
  $("m-lepesek").value = lepesekKiir(f.lepesek);
  $("m-nyomkovetes").value = nyomkovetesKiir(f.nyomkovetes);
  $("m-megoldas").value = f.megoldas || "";
  $("m-magyarazat").value = f.magyarazat || "";
  $("elonezet").href = "feladat.html?id=" + encodeURIComponent(id);
  ["elonezet", "torlesGomb", "felGomb", "leGomb"].forEach(x => { $(x).hidden = false; });
  listaRajzol();
}

function ujFeladat() {
  aktivId = null;
  $("urlap").reset();
  $("m-ido").value = 5;
  $("m-megoldas").value = "# Ide jön a megoldás\n";
  ["elonezet", "torlesGomb", "felGomb", "leGomb"].forEach(x => { $(x).hidden = true; });
  listaRajzol();
  $("m-cim").focus();
}

function egyediId(kert, sajatId) {
  const alap = azonositobol(kert, "feladat");
  let id = alap, i = 2;
  while (feladatok.some(f => f.id === id && f.id !== sajatId)) id = alap + "-" + i++;
  return id;
}

$("urlap").addEventListener("submit", e => {
  e.preventDefault();
  const adat = {
    cim: $("m-cim").value.trim(),
    ido: Number($("m-ido").value) || 0,
    evfolyam: Number($("m-evfolyam").value),
    sor: Number($("m-sor").value) || 1,
    tema: $("m-tema").value,
    nehezseg: Number($("m-nehezseg").value),
    tetel: $("m-tetel").value.trim(),
    forras: $("m-forras").value.trim(),
    specifikacio: nemUresObjektum({
      bemenet: $("m-spec-bemenet").value,
      kimenet: $("m-spec-kimenet").value,
      feltetel: $("m-spec-feltetel").value
    }),
    gyakorlas: soronkent($("m-gyakorlas").value).map(sor => {
      const reszek = sor.split("|");
      return { nev: reszek[0].trim(), url: (reszek[1] || "").trim() };
    }).filter(g => g.url !== ""),
    rovid: $("m-rovid").value.trim(),
    leiras: $("m-leiras").value,
    bemenet: $("m-bemenet").value,
    kimenet: $("m-kimenet").value,
    tippek: soronkent($("m-tippek").value),
    lepesek: lepesekBeolvas($("m-lepesek").value),
    nyomkovetes: nyomkovetesBeolvas($("m-nyomkovetes").value),
    megoldas: $("m-megoldas").value.replace(/\s+$/, ""),
    magyarazat: $("m-magyarazat").value
  };

  const kertId = $("m-id").value.trim() || adat.cim;
  const ujId = egyediId(kertId, aktivId);

  if (aktivId) {
    const i = feladatok.findIndex(f => f.id === aktivId);
    feladatok[i] = Object.assign({ id: ujId }, adat);
  } else {
    feladatok.push(Object.assign({ id: ujId }, adat));
  }
  aktivId = ujId;

  saveFeladatok(feladatok);
  betolt(aktivId);
  allapotFrissit();
  ertesit("Mentve ✓");
});

$("ujGomb").addEventListener("click", ujFeladat);

$("torlesGomb").addEventListener("click", () => {
  if (!aktivId) return;
  const f = feladatok.find(x => x.id === aktivId);
  if (!window.confirm("Biztosan törlöd ezt a feladatot?\n\n" + f.cim)) return;
  feladatok = feladatok.filter(x => x.id !== aktivId);
  saveFeladatok(feladatok);
  allapotFrissit();
  if (feladatok.length) betolt(feladatok[0].id); else ujFeladat();
  ertesit("Törölve.");
});

// A feladatot a saját osztályának feladatai között mozgatjuk
function mozgat(irany) {
  if (!aktivId) return;
  const i = feladatok.findIndex(f => f.id === aktivId);
  const f = feladatok[i];
  const csoportbeli = x => String(x.evfolyam) === String(f.evfolyam) && (Number(x.sor) || 1) === (Number(f.sor) || 1);
  let j = i + irany;
  while (j >= 0 && j < feladatok.length && !csoportbeli(feladatok[j])) j += irany;
  if (j < 0 || j >= feladatok.length) return;
  feladatok[i] = feladatok[j];
  feladatok[j] = f;
  saveFeladatok(feladatok);
  allapotFrissit();
  listaRajzol();
  ertesit(irany < 0 ? "Előrébb került." : "Hátrébb került.");
}
$("felGomb").addEventListener("click", () => mozgat(-1));
$("leGomb").addEventListener("click", () => mozgat(1));

// Tabulátor a kódmezőkben 4 szóközt szúr be
["m-megoldas", "m-lepesek"].forEach(mezo => {
  $(mezo).addEventListener("keydown", e => {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const t = e.target, eleje = t.selectionStart;
    t.value = t.value.slice(0, eleje) + "    " + t.value.slice(t.selectionEnd);
    t.selectionStart = t.selectionEnd = eleje + 4;
  });
});

/* =====================================================================
   TÉMÁK
   ===================================================================== */

function temaUrlapFeltolt() {
  $("t-lista").value = Object.keys(temak).map(k => k + " | " + temak[k]).join("\n");
  temaHasznalatFrissit();
}

function temaHasznalatFrissit() {
  const db = {};
  feladatok.forEach(f => { db[f.tema] = (db[f.tema] || 0) + 1; });
  const ismeretlen = Object.keys(db).filter(k => !temak[k]);
  $("temaHasznalat").innerHTML = "Használat: " +
    (Object.keys(temak).map(k => esc(temak[k]) + " (" + (db[k] || 0) + ")").join(", ") || "nincs téma") +
    (ismeretlen.length ? "<br><strong>Figyelem:</strong> ezekre a témákra hivatkozik feladat, de nincsenek a listában: <code>" +
      ismeretlen.map(esc).join("</code>, <code>") + "</code>" : "");
}

$("temaUrlap").addEventListener("submit", e => {
  e.preventDefault();
  const uj = {};
  soronkent($("t-lista").value).forEach(sor => {
    const r = sor.split("|");
    const kulcs = azonositobol(r[0], "");
    if (!kulcs) return;
    uj[kulcs] = (r.slice(1).join("|") || r[0]).trim() || kulcs;
  });
  if (!Object.keys(uj).length) { ertesit("Legalább egy téma kell."); return; }
  temak = uj;
  saveTemak(temak);
  valasztokFeltolt();
  if (aktivId) betolt(aktivId);
  temaUrlapFeltolt();
  allapotFrissit();
  ertesit("Témák mentve ✓");
});

/* =====================================================================
   BEÁLLÍTÁSOK
   ===================================================================== */

// A mezők azonosítójából számoljuk ki, melyik beállítás tartozik hozzájuk:
// b-<előtag>-<név>  ->  <útvonal>.<név>
const B_ELOTAG = {
  menu: "menu", k: "kezdolap", f: "feladatokOldal", s: "feladatOldal"
};

function beallitasUtvonal(mezoId) {
  const reszek = mezoId.replace(/^b-/, "").split("-");
  if (reszek.length > 1 && B_ELOTAG[reszek[0]]) {
    return [B_ELOTAG[reszek[0]], reszek.slice(1).join("-")];
  }
  return [reszek.join("-")];
}

function utvonalErtek(obj, ut) {
  return ut.reduce((o, k) => (o && o[k] !== undefined ? o[k] : ""), obj);
}

function utvonalBeallit(obj, ut, ertek) {
  let cel = obj;
  for (let i = 0; i < ut.length - 1; i++) {
    if (typeof cel[ut[i]] !== "object" || cel[ut[i]] === null) cel[ut[i]] = {};
    cel = cel[ut[i]];
  }
  cel[ut[ut.length - 1]] = ertek;
}

function beallitasMezok() {
  return Array.from($("beallitasUrlap").querySelectorAll("input[id^='b-'], textarea[id^='b-']"))
    .filter(m => m.id !== "b-k-munkamenet" && m.id !== "b-feladatsorok");
}

function beallitasUrlapFeltolt() {
  beallitasMezok().forEach(m => {
    m.value = utvonalErtek(beallitasok, beallitasUtvonal(m.id));
  });
  $("b-k-munkamenet").value = parokKiir((beallitasok.kezdolap || {}).munkamenet, "cim", "szoveg");
  $("b-feladatsorok").value = (beallitasok.feladatsorok || [])
    .map(s => s.osztaly + " | " + s.sor + " | " + s.cim).join("\n");
}

$("beallitasUrlap").addEventListener("submit", e => {
  e.preventDefault();
  beallitasMezok().forEach(m => {
    const ut = beallitasUtvonal(m.id);
    utvonalBeallit(beallitasok, ut, m.type === "number" ? (Number(m.value) || 0) : m.value);
  });
  if (!beallitasok.kezdolap) beallitasok.kezdolap = {};
  beallitasok.kezdolap.munkamenet = parokBeolvas($("b-k-munkamenet").value, "cim", "szoveg");
  beallitasok.feladatsorok = soronkent($("b-feladatsorok").value).map(sor => {
    const r = sor.split("|").map(x => x.trim());
    return { osztaly: r[0] || "", sor: Number(r[1]) || 1, cim: r.slice(2).join(" | ") };
  }).filter(s => s.osztaly);

  saveBeallitasok(beallitasok);
  beallitasok = getBeallitasok();
  valasztokFeltolt();
  if (aktivId) betolt(aktivId); else listaRajzol();
  beallitasUrlapFeltolt();
  allapotFrissit();
  ertesit("Beállítások mentve ✓");
});

/* =====================================================================
   BIZTONSÁGI MENTÉS / VISSZATÖLTÉS
   ===================================================================== */

// Az adat.js „window.NEV = <JSON>;” sorokból áll
function kiolvas(szoveg, nev) {
  const m = szoveg.match(new RegExp("window\\." + nev + " = ([\\s\\S]*?);\\r?\\n"));
  try { return m ? JSON.parse(m[1]) : null; } catch (e) { return null; }
}

$("importFajl").addEventListener("change", e => {
  const fajl = e.target.files[0];
  if (!fajl) return;
  const olvaso = new FileReader();
  olvaso.onload = () => {
    try {
      const szoveg = String(olvaso.result) + "\n";
      let adat;
      try { adat = JSON.parse(szoveg); } catch (hiba) { adat = null; }
      if (!adat || Array.isArray(adat)) {
        adat = {};
        OKTATAS_KULCSOK.forEach(k => { adat[k] = kiolvas(szoveg, k); });
      }
      if (!Array.isArray(adat.ALAP_FELADATOK)) throw new Error("nincs benne feladatlista");

      if (!window.confirm("A visszatöltés lecseréli a most szerkesztett tartalmat (" + adat.ALAP_FELADATOK.length +
        " feladat). Az adat.js fájlba csak a mentés gombbal kerül. Folytatod?")) return;

      feladatok = adat.ALAP_FELADATOK; saveFeladatok(feladatok);
      if (adat.TEMAK && typeof adat.TEMAK === "object") { temak = adat.TEMAK; saveTemak(temak); }
      if (adat.BEALLITASOK && typeof adat.BEALLITASOK === "object") { saveBeallitasok(adat.BEALLITASOK); beallitasok = getBeallitasok(); }

      aktivId = null;
      inditas();
      ertesit("Visszatöltve.");
    } catch (hiba) {
      window.alert("Ezt a fájlt nem sikerült beolvasni. Egy korábbi adat.js (vagy .json biztonsági mentés) tölthető be.");
    } finally {
      e.target.value = "";
    }
  };
  olvaso.readAsText(fajl, "utf-8");
});

inditas();

