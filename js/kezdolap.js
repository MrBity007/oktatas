// Oktatás – kezdőlap: osztály-kártyák, munkamenet, témakörök
(function () {
  const B = getBeallitasok();
  const K = B.kezdolap || {};
  const feladatok = getFeladatok();
  const temak = getTemak();

  let html = '<section class="nyito">' +
    '<div class="cimke-sor">' +
      vesszosLista(K.cimkek).map(c => '<span class="cimke">' + esc(c) + "</span>").join("") +
    "</div>" +
    "<h1>" + esc(K.cim || "") + "</h1>" +
    '<p class="bevezeto">' + soronBelul(K.bevezeto || "") + "</p>" +
    "</section>";

  // Osztály-kártyák
  html += '<section class="racs-2">';
  getOsztalyok().forEach(n => {
    const sorok = feladatsorok(feladatok, n);
    const db = sorok.reduce((o, s) => o + s.feladatok.length, 0);
    html += '<a class="kartya osztaly-kartya e' + esc(n) + '" href="feladatok.html?osztaly=' + encodeURIComponent(n) + '">' +
      "<h2>" + esc(osztalyNev(n)) + "</h2>" +
      sorok.map(s => '<p class="feladatsor-cim">' + esc(feladatsorFelirat(s, sorok.length)) + " · " + s.perc + " perc</p>" +
        "<ul>" + s.feladatok.map(f => "<li>" + esc(f.cim) + "</li>").join("") + "</ul>").join("") +
      '<div class="kartya-lab"><span>' + db + " feladat</span><span>" + sorok.reduce((o, s) => o + s.perc, 0) + " perc</span></div>" +
      (K.osztalyGomb ? '<p style="margin:14px 0 0;color:var(--kek)">' + esc(K.osztalyGomb) + "</p>" : "") + "</a>";
  });
  html += "</section>";

  // Munkamenet
  const munkamenet = (K.munkamenet || []).filter(m => m.cim || m.szoveg);
  if (munkamenet.length) {
    html += '<section class="szakasz"><h2 class="modul-cim">' + esc(K.munkamenetCim || "") + "</h2>" +
      '<ol class="lepesek">' +
      munkamenet.map(m => "<li><strong>" + soronBelul(m.cim) + "</strong><br>" + soronBelul(m.szoveg) + "</li>").join("") +
      "</ol></section>";
  }

  // Témakörök
  const temaKulcsok = Object.keys(temak).filter(k => feladatok.some(f => f.tema === k));
  if (temaKulcsok.length) {
    html += '<section class="szakasz"><h2 class="modul-cim">' + esc(K.temakCim || "") + "</h2>" +
      (K.temakBevezeto ? '<p style="color:var(--halvany);margin-top:0">' + soronBelul(K.temakBevezeto) + "</p>" : "") +
      '<div class="racs">' +
      temaKulcsok.map(k => {
        const sajat = feladatok.filter(f => f.tema === k);
        return '<a class="kartya" href="feladatok.html?tema=' + encodeURIComponent(k) + '">' +
          "<h3>" + esc(temak[k]) + "</h3>" +
          '<p style="margin:0;color:var(--halvany);font-size:.95rem">' +
          sajat.map(f => esc(f.cim)).join(" · ") + "</p></a>";
      }).join("") + "</div></section>";
  }

  document.getElementById("tartalom").innerHTML = html;
})();
