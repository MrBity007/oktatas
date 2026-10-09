// Oktatás – egy feladat részletes oldala
(function () {
  const B = getBeallitasok();
  const S = B.feladatOldal || {};
  const feladatok = getFeladatok();
  const f = feladatok.find(x => x.id === urlParam("id"));
  const doboz = document.getElementById("tartalom");

  if (!f) {
    doboz.innerHTML = '<p class="ures-uzenet">Ez a feladat nem található. <a href="feladatok.html">Vissza a feladatokhoz</a></p>';
    return;
  }
  document.title = f.cim + " – " + (B.oldalCim || "");

  const tippek = (f.tippek || []).filter(t => t.trim() !== "");
  const lepesek = (f.lepesek || []).filter(l => l && (l.kod || l.magyarazat));
  const sorrend = osztalyFeladatai(feladatok, f.evfolyam);
  const hely = sorrend.findIndex(x => x.id === f.id);
  const elozo = sorrend[hely - 1];
  const kovetkezo = sorrend[hely + 1];

  let html = '<nav class="morzsa"><a href="feladatok.html?osztaly=' + encodeURIComponent(f.evfolyam) + '">← ' +
    esc(osztalyNev(f.evfolyam)) + "</a></nav>";

  html += '<div class="feladat-fej">' +
    '<div class="cimke-sor">' + osztalyCimke(f.evfolyam) +    '<span class="cimke tema">' + esc(temaNev(f.tema)) + "</span>" +
    '<span class="cimke">' + (Number(f.ido) || "?") + " perc</span></div>" +
    "<h1>" + esc(f.cim) + "</h1>" +
    ((f.tetel || f.forras) ? '<p class="meta-sor">' + (f.tetel ? "Algoritmus / tétel: <strong>" + esc(f.tetel) + "</strong>" : "") +
      (f.tetel && f.forras ? "<br>" : "") + (f.forras ? "Forrás: " + esc(f.forras) : "") + "</p>" : "") +
    "</div>";

  const spec = specTabla(f.specifikacio);
  if (spec) {
    html += '<section class="kartya blokk"><h2>' + esc(S.specCim || "Mit kér a feladat?") + "</h2>" + spec + "</section>";
  }

  html += '<section class="kartya blokk"><h2>' + esc(S.leirasCim || "A feladat") + "</h2>" +
    formazSzoveg(f.leiras) + "</section>";

  if ((f.bemenet || "").trim() || (f.kimenet || "").trim()) {
    html += '<section class="kartya blokk"><h2>' + esc(S.peldaCim || "Példa") + '</h2><div class="pelda">';
    if ((f.bemenet || "").trim()) html += '<div><span class="felirat">' + esc(S.bemenetFelirat || "Bemenet") + "</span><pre>" + esc(f.bemenet) + "</pre></div>";
    if ((f.kimenet || "").trim()) html += '<div><span class="felirat">' + esc(S.kimenetFelirat || "Kimenet") + "</span><pre>" + esc(f.kimenet) + "</pre></div>";
    html += "</div></section>";
  }

  if (tippek.length) {
    html += '<section class="kartya blokk"><h2>' + esc(S.tippekCim || "Tippek") + "</h2>" +
      '<p style="color:var(--halvany)">' + soronBelul(S.tippekBevezeto || "") + "</p>";
    tippek.forEach((t, i) => {
      html += '<details class="tipp"><summary>' + (i + 1) + ". tipp</summary><p>" + soronBelul(t) + "</p></details>";
    });
    html += "</section>";
  }

  // Levezetés: lépésenkénti kódépítés + nyomkövetés + teljes program.
  // Először csak az első rész látszik, a többi gombnyomásra nyílik le egyenként.
  html += '<section class="kartya blokk" id="megoldas"><h2>' +
    esc(lepesek.length ? (S.megoldasCim || "Megoldás lépésről lépésre") : "Megoldás") + "</h2>";

  if (lepesek.length) {
    html += '<p style="color:var(--halvany);margin-top:0">' + soronBelul(S.lepesekBevezeto || "") + "</p>" +
      kodLepesek(lepesek);
  }

  const ny = nyomkovetesTabla(f.nyomkovetes);
  if (ny) {
    html += '<div class="megoldas-resz" data-gomb="Mutasd a nyomkövetést">' +
      '<h3 class="modul-cim" style="margin-top:28px">' + esc(S.nyomkovetesCim || "Nyomkövetés") + "</h3>" + ny + "</div>";
  }

  html += '<div class="megoldas-resz" data-gomb="Mutasd a teljes programot">' +
    '<h3 class="modul-cim" style="margin-top:28px">' + esc(S.teljesKodCim || "A teljes program") + "</h3>" +
    kodBlokk(f.megoldas || "") +
    '<p style="color:var(--halvany);font-size:.9rem;margin-bottom:0">' + soronBelul(S.teljesKodLabjegyzet || "") + "</p>" +
    "</div>" +
    '<p class="kovetkezo-sor"><button class="gomb" type="button" id="kovetkezo"></button></p>' +
    "</section>";

  if ((f.magyarazat || "").trim()) {
    html += '<section class="kartya blokk"><h2>' + esc(S.magyarazatCim || "Magyarázat") + "</h2>" +
      formazSzoveg(f.magyarazat) + "</section>";
  }

  const gyakorlas = (f.gyakorlas || []).filter(g => biztonsagosUrl(g.url));
  if (gyakorlas.length) {
    html += '<section class="kartya blokk"><h2>' + esc(S.gyakorlasCim || "") + "</h2>" +
      formazSzoveg(S.gyakorlasSzoveg || "") + "<p>" +
      gyakorlas.map(g => '<a class="gomb masodlagos kicsi" href="' + esc(biztonsagosUrl(g.url)) + '" target="_blank" rel="noopener">' + esc(g.nev) + "</a>").join(" ") + "</p></section>";
  }

  html += '<div class="lapozo">' +
    (elozo ? '<a class="gomb masodlagos" href="feladat.html?id=' + encodeURIComponent(elozo.id) + '">← ' + esc(elozo.cim) + "</a>" : "<span></span>") +
    (kovetkezo ? '<a class="gomb" href="feladat.html?id=' + encodeURIComponent(kovetkezo.id) + '">' + esc(kovetkezo.cim) + " →</a>" : "") +
    "</div>";

  doboz.innerHTML = html;
  kodokElokeszitese(doboz);

  const reszek = Array.from(document.querySelectorAll("#megoldas .kod-lepesek > li, #megoldas .megoldas-resz"));
  const gomb = document.getElementById("kovetkezo");
  reszek.slice(1).forEach(r => { r.hidden = true; });

  function gombFrissit() {
    const kov = reszek.find(r => r.hidden);
    gomb.parentElement.hidden = !kov;
    if (kov) gomb.textContent = kov.dataset.gomb || "Mutasd a következő lépést";
  }

  gomb.addEventListener("click", () => {
    const kov = reszek.find(r => r.hidden);
    if (kov) kov.hidden = false;
    gombFrissit();
  });
  gombFrissit();
})();
