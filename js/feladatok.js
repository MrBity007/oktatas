// Oktatás – feladatlista osztály szerint, téma- és szövegszűréssel
(function () {
  const B = getBeallitasok();
  const F = B.feladatokOldal || {};
  const feladatok = getFeladatok();
  const osztalyok = getOsztalyok();
  const temak = getTemak();
  const allapot = { osztaly: urlParam("osztaly") || "", tema: urlParam("tema") || "", kereses: "" };

  document.getElementById("oldalCim").textContent = F.cim || "Feladatok";
  document.getElementById("oldalBevezeto").innerHTML = soronBelul(F.bevezeto || "");

  const temaValaszto = document.getElementById("temaValaszto");
  Object.keys(temak).forEach(k => {
    temaValaszto.insertAdjacentHTML("beforeend", '<option value="' + esc(k) + '">' + esc(temak[k]) + "</option>");
  });
  temaValaszto.value = allapot.tema;

  function megjelenit() {
    document.title = (allapot.osztaly ? osztalyNev(allapot.osztaly) : (F.cim || "Feladatok")) + " – " + (B.oldalCim || "");

    const szo = allapot.kereses.toLowerCase();
    const talalat = feladatok.filter(f =>
      (!allapot.osztaly || String(f.evfolyam) === allapot.osztaly) &&
      (!allapot.tema || f.tema === allapot.tema) &&
      (!szo || (f.cim + " " + f.rovid + " " + (f.tetel || "")).toLowerCase().includes(szo))
    );

    const doboz = document.getElementById("lista");
    if (talalat.length === 0) {
      doboz.innerHTML = '<p class="ures-uzenet">Nincs a szűrésnek megfelelő feladat.</p>';
      return;
    }

    let html = "";
    osztalyok.forEach(n => {
      const sorok = feladatsorok(talalat, n);
      if (!sorok.length) return;
      html += '<h2 class="csoport-cim">' + osztalyCimke(n) + "</h2>";
      sorok.forEach(s => {
        html += '<h3 class="feladatsor-cim">' + esc(feladatsorFelirat(s, sorok.length)) +
          ' <span class="cimke">' + s.perc + " perc</span></h3>" +
          '<div class="racs">' + s.feladatok.map(feladatKartya).join("") + "</div>";
      });
    });
    const egyeb = talalat.filter(f => !osztalyok.includes(String(f.evfolyam)));
    if (egyeb.length) html += '<h2 class="csoport-cim">Egyéb feladatok</h2><div class="racs">' + egyeb.map(feladatKartya).join("") + "</div>";
    doboz.innerHTML = html;
  }

  temaValaszto.addEventListener("change", () => { allapot.tema = temaValaszto.value; megjelenit(); });
  document.getElementById("kereso").addEventListener("input", e => { allapot.kereses = e.target.value; megjelenit(); });

  megjelenit();
})();
