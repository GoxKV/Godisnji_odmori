// === FORMATIRAJ DATUM: YYYY-MM-DD → dd.mm.yyyy. ===
function formatirajDatum(datum) {
  if (!datum) return '–';
  const [godina, mesec, dan] = datum.split('-');
  return `${dan}.${mesec}.${godina}.`;
}

// === PROVERA NERADNOG DANA ===
function jeNeradan(datum) {
  const d = new Date(datum);
  const danUNedelji = d.getDay(); // 0 = nedelja, 6 = subota
  const jeVikend = (danUNedelji === 0 || danUNedelji === 6);
  const godina = d.getFullYear();
  const mesec = String(d.getMonth() + 1).padStart(2, '0');
  const dan = String(d.getDate()).padStart(2, '0');
  const datumSlava = `${dan}.${mesec}`;
  const jeSlava = zaposleni.some(z => z.datumSlave === datumSlava);
  const jePraznik = (praznici[godina] || []).includes(datum);
  return jeVikend || jePraznik || jeSlava;
}

// === DODAJ RADNE DANE (bez neradnih) ===
function dodajRadneDane(pocetak, brojDana) {
  let datum = new Date(pocetak);
  let dani = 0;
  let kraj = null;
  while (dani < brojDana) {
    const iso = datum.toISOString().split('T')[0];
    if (!jeNeradan(iso)) {
      dani++;
      kraj = new Date(datum);
    }
    datum.setDate(datum.getDate() + 1);
  }
  return kraj.toISOString().split('T')[0];
}

// === GLOBALNE PROMENLJIVE ===
let zaposleni = [];
let praznici = [];

// === PRIKAZ TABOVA ===
function showTab(id) {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.style.display = 'none';
  });
  document.getElementById(id).style.display = 'block';
}

// Početni prikaz
document.getElementById('zaposleni').style.display = 'block';

// === UČITAJ PODATKE IZ localStorage ILI KORISTI PODRAZUMEVANE ===
function ucitajPodatke() {
  const izStorage = localStorage.getItem('zaposleni');
  if (izStorage) {
    zaposleni = JSON.parse(izStorage);
  } else {
    zaposleni = [
      {
        "ime": "Petar Petrović",
        "kib": "123456789",
        "goDana": 20,
        "datumSlave": "15.03",
        "delovi": 3,
        "zelje": "6,7,8"
      }
    ];
    localStorage.setItem('zaposleni', JSON.stringify(zaposleni));
  }

  const izStoragePraznici = localStorage.getItem('praznici');
  if (izStoragePraznici) {
    praznici = JSON.parse(izStoragePraznici);
  } else {
    praznici = {
      "2025": [
        "2025-01-01",
        "2025-01-02",
        "2025-02-15",
        "2025-02-16",
        "2025-05-01",
        "2025-05-02",
        "2025-11-11"
      ]
    };
    localStorage.setItem('praznici', JSON.stringify(praznici));
  }

  prikaziZaposlene();
}

// === PRIKAŽI SVE ZAPOSLENE ===
function prikaziZaposlene() {
  const tbody = document.querySelector('#tabelaZaposlenih tbody');
  tbody.innerHTML = '';
  zaposleni.forEach(z => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${z.ime}</td>
      <td>${z.kib}</td>
      <td>${z.goDana}</td>
      <td>${z.datumSlave}</td>
      <td>${z.delovi}</td>
      <td>${z.zelje || '–'}</td>
      <td>
        <button onclick="ukljuciUredjivanje('${z.kib}')">Уреди</button>
        <button onclick="obrisiZaposlenog('${z.kib}')" style="background:#dc3545;">Обриши</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// === GLOBALNO: Trenutni zaposleni za uređivanje
let trenutniZaposleni = null;

// === UKLJUČI UREĐIVANJE ===
function ukljuciUredjivanje(kib) {
  trenutniZaposleni = zaposleni.find(z => z.kib === kib);
  if (!trenutniZaposleni) return;

  document.getElementById('ime').value = trenutniZaposleni.ime;
  document.getElementById('kib').value = trenutniZaposleni.kib;
  document.getElementById('goDana').value = trenutniZaposleni.goDana;
  document.getElementById('datumSlave').value = trenutniZaposleni.datumSlave;
  document.getElementById('delovi').value = trenutniZaposleni.delovi;
  document.getElementById('zelje').value = trenutniZaposleni.zelje || '';

  const forma = document.getElementById('dodajZaposlenog');
  const dugme = forma.querySelector('button[type="submit"]');
  dugme.textContent = 'Сачувај измене';
  forma.dataset.uredjuje = 'da';
}

// === OBRADI FORMU (dodaj ili izmeni) ===
function obradiFormu(e) {
  e.preventDefault();
  const forma = e.target;

  if (forma.dataset.uredjuje === 'da') {
    sacuvajIzmene(forma);
  } else {
    const ime = document.getElementById('ime').value.trim();
    const kib = document.getElementById('kib').value.trim();
    const goDana = parseInt(document.getElementById('goDana').value);
    const datumSlave = document.getElementById('datumSlave').value.trim();
    const delovi = parseInt(document.getElementById('delovi').value);
    const zelje = document.getElementById('zelje').value.trim();

    if (zaposleni.some(z => z.kib === kib)) {
      alert(`❌ Запослени са КИБ бројем ${kib} већ постоји!`);
      return;
    }

    const novi = {
      ime,
      kib,
      goDana,
      datumSlave,
      delovi,
      zelje
    };

    zaposleni.push(novi);
    sacuvajULocalStorage();
    prikaziZaposlene();
    forma.reset();
  }
}

// === SAČUVAJ IZMENE ===
function sacuvajIzmene(forma) {
  const kib = document.getElementById('kib').value.trim();
  const stariKib = trenutniZaposleni.kib;

  if (kib !== stariKib && zaposleni.some(z => z.kib === kib)) {
    alert(`❌ Запослени са КИБ бројем ${kib} већ постоји!`);
    return;
  }

  trenutniZaposleni.ime = document.getElementById('ime').value.trim();
  trenutniZaposleni.kib = kib;
  trenutniZaposleni.goDana = parseInt(document.getElementById('goDana').value);
  trenutniZaposleni.datumSlave = document.getElementById('datumSlave').value.trim();
  trenutniZaposleni.delovi = parseInt(document.getElementById('delovi').value);
  trenutniZaposleni.zelje = document.getElementById('zelje').value.trim();

  const dugme = forma.querySelector('button[type="submit"]');
  dugme.textContent = 'Додај запосленог';
  forma.removeAttribute('data.uredjuje');
  forma.reset();
  trenutniZaposleni = null;

  sacuvajULocalStorage();
  prikaziZaposlene();
}

// === OBRIŠI ZAPOSLENOG ===
function obrisiZaposlenog(kib) {
  if (confirm(`Желите ли да обришете запосленог са КИБ бројем: ${kib}?`)) {
    zaposleni = zaposleni.filter(z => z.kib !== kib);
    sacuvajULocalStorage();
    prikaziZaposlene();
    alert(`✅ Запослени са КИБ-ом ${kib} је успешно обрисан.`);
  }
}

// === SAČUVAJ PRAZNIKE ===
function sacuvajPraznike() {
  const godina = document.getElementById('godinaPraznika').value;
  const unos = document.getElementById('prazniciInput').value;
  const lista = unos.split('\n').map(d => d.trim()).filter(d => d);
  praznici[godina] = lista;
  sacuvajULocalStorage();
  alert(`Сачувано: ${lista.length} датума за ${godina}. годину.`);
}

// === SAČUVAJ U localStorage ===
function sacuvajULocalStorage() {
  localStorage.setItem('zaposleni', JSON.stringify(zaposleni));
  localStorage.setItem('praznici', JSON.stringify(praznici));
}

// === PREUZMI PODATKE KAO JSON ===
function preuzmiPodatke() {
  const zBlob = new Blob([JSON.stringify(zaposleni, null, 2)], { type: 'application/json' });
  const zUrl = URL.createObjectURL(zBlob);
  const zLink = document.createElement('a');
  zLink.href = zUrl;
  zLink.download = 'zaposleni.json';
  zLink.click();

  const pBlob = new Blob([JSON.stringify(praznici, null, 2)], { type: 'application/json' });
  const pUrl = URL.createObjectURL(pBlob);
  const pLink = document.createElement('a');
  pLink.href = pUrl;
  pLink.download = 'praznici.json';
  pLink.click();

  alert('✅ Подаци су успешно преузети!\n\n' +
    'Преузети фајлови: zaposleni.json и praznici.json\n\n' +
    'Замените их у "data/" на другом рачунару.');
}

// === UVOZ IZ JSON FAJLA ===
function uvozIzFajla() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (Array.isArray(data)) {
          zaposleni = data;
          sacuvajULocalStorage();
          prikaziZaposlene();
          alert('✅ Успешно увучени подаци из: ' + file.name);
        } else {
          alert('❌ Фајл није исправног формата (очекује се низ зaposлених)');
        }
      } catch (err) {
        alert('❌ Грешка приликом читања фајла: ' + err.message);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// === GENERIŠI RASPORED ===
function generisiRaspored() {
  const godina = document.getElementById('godinaRaspored').value;
  const container = document.getElementById('prikazRasporeda');
  container.innerHTML = `<h3>Распоред за ${godina}. годину</h3>`;

  const godisnjiPraznici = (praznici[godina] || []);

  // Broj odsutnih po datumu
  const opterecenje = {};
  for (let m = 1; m <= 12; m++) {
    const mesec = String(m).padStart(2, '0');
    const danaUMesecu = new Date(godina, m, 0).getDate();
    for (let d = 1; d <= danaUMesecu; d++) {
      const dan = String(d).padStart(2, '0');
      const datum = `${godina}-${mesec}-${dan}`;
      opterecenje[datum] = 0;
    }
  }

  // Ažuriraj opterećenje
  function azurirajOpterecenje(pocetak, kraj) {
    let d = new Date(pocetak);
    const k = new Date(kraj);
    while (d <= k) {
      const dan = d.toISOString().split('T')[0];
      if (opterecenje[dan] !== undefined) {
        opterecenje[dan]++;
      }
      d.setDate(d.getDate() + 1);
    }
  }

  // Vrati najbolje kandidate za početak
  function najboljiDaniUMesecu(mesec, brojDana) {
    const kandidati = [];
    for (let dan = 1; dan <= 20; dan++) {
      const mesecStr = String(mesec).padStart(2, '0');
      const danStr = String(dan).padStart(2, '0');
      const pocetak = `${godina}-${mesecStr}-${danStr}`;
      if (jeNeradan(pocetak)) continue;

      const kraj = dodajRadneDane(pocetak, brojDana);
      const mesecKraja = new Date(kraj).getMonth() + 1;

      // Ograničenja
      if ((mesec >= 5 && mesec <= 9) && brojDana > 12) continue;
      if ((mesecKraja >= 5 && mesecKraja <= 9) && brojDana > 12) continue;
      if (new Date(kraj).getDay() === 5) continue; // ne završava petkom

      // Proveri opterećenje
      let maxOpt = 0;
      let danDatum = new Date(pocetak);
      const krajDatum = new Date(kraj);
      while (danDatum <= krajDatum) {
        const iso = danDatum.toISOString().split('T')[0];
        if (opterecenje[iso] !== undefined && opterecenje[iso] > maxOpt) {
          maxOpt = opterecenje[iso];
        }
        danDatum.setDate(danDatum.getDate() + 1);
      }

      kandidati.push({
        pocetak,
        kraj,
        maxOpt
      });
    }

    return kandidati.sort((a, b) => a.maxOpt - b.maxOpt);
  }

  let tabela = `
  <table class="raspored-tabela">
    <tr>
      <th>Име</th>
      <th>ГО дана</th>
      <th>Жељени месеци</th>
      <th>Периоди коришћења ГО</th>
    </tr>
  `;

  zaposleni.forEach(z => {
    const { ime, goDana, delovi, zelje } = z;
    const zeljeniMeseci = zelje
      ? zelje
        .split(',')
        .map(m => parseInt(m.trim()))
        .filter(m => m >= 1 && m <= 12)
        .sort((a, b) => a - b)
      : [];

    let periodi = [];
    let podela = [];

    if (delovi === 2) {
      const prvi = Math.floor(goDana / 2);
      podela = [prvi, goDana - prvi];
    } else {
      const prvi = Math.floor(goDana / 3);
      const drugi = Math.floor((goDana - prvi) / 2);
      podela = [prvi, drugi, goDana - prvi - drugi];
    }

    let tekuciMesec = 1;

    podela.forEach((dana, index) => {
      let pronadjen = false;
      let najbolji = null;

      // Ako nije prvi deo, počni bar 15 dana posle prethodnog kraja
      let pocetakNajranije = null;
      if (index === 0) {
        pocetakNajranije = `${godina}-${String(tekuciMesec).padStart(2, '0')}-01`;
      } else {
        const prethodniKraj = new Date(periodi[index - 1].kraj);
        prethodniKraj.setDate(prethodniKraj.getDate() + 15);
        pocetakNajranije = prethodniKraj.toISOString().split('T')[0];
        tekuciMesec = prethodniKraj.getMonth() + 1;
      }

      const meseciZaPretragu = zeljeniMeseci.length > 0
        ? zeljeniMeseci.filter(m => m >= tekuciMesec)
        : Array.from({ length: 12 }, (_, i) => i + 1).filter(m => m >= tekuciMesec);

      for (let m of meseciZaPretragu) {
        const kandidati = najboljiDaniUMesecu(m, dana);
        for (let k of kandidati) {
          if (index > 0 && k.pocetak < pocetakNajranije) continue;

          najbolji = {
            pocetak: k.pocetak,
            kraj: k.kraj,
            dana: dana
          };
          pronadjen = true;
          tekuciMesec = new Date(k.kraj).getMonth() + 2;
          break;
        }
        if (pronadjen) break;
      }

      if (!pronadjen) {
        for (let m = tekuciMesec; m <= 12; m++) {
          const kandidati = najboljiDaniUMesecu(m, dana);
          for (let k of kandidati) {
            if (index > 0 && k.pocetak < pocetakNajranije) continue;

            najbolji = {
              pocetak: k.pocetak,
              kraj: k.kraj,
              dana: dana
            };
            pronadjen = true;
            tekuciMesec = new Date(k.kraj).getMonth() + 2;
            break;
          }
          if (pronadjen) break;
        }
      }

      if (!pronadjen) {
        const pocetak = `${godina}-06-01`;
        const kraj = dodajRadneDane(pocetak, dana);
        najbolji = {
          pocetak,
          kraj,
          dana: dana
        };
        tekuciMesec = new Date(kraj).getMonth() + 2;
      }

      if (najbolji) {
        periodi.push(najbolji);
        azurirajOpterecenje(najbolji.pocetak, najbolji.kraj);
      }
    });

    const periodiHTML = periodi.map(p =>
      `${formatirajDatum(p.pocetak)} – ${formatirajDatum(p.kraj)} (${p.dana} дана)`
    ).join('<br>');

    tabela += `
    <tr>
      <td>${ime}</td>
      <td>${goDana}</td>
      <td>${zelje || '–'}</td>
      <td>${periodiHTML}</td>
    </tr>
    `;

    // ✅ KLJUČNO: Sačuvaj periodi u zaposlenom
    z.periodi = periodi;
  });

  tabela += `</table>`;
  container.innerHTML += tabela;
}

// === GENERIŠI DNEVNI IZVEŠTAJ ===
function generisiIzvestaj() {
  const godina = document.getElementById('godinaIzvestaj').value;
  const container = document.getElementById('prikazIzvestaja');
  container.innerHTML = `<h3>Број ослуствених по данима – ${godina}. година</h3>`;

  const sviDatumi = [];
  for (let m = 1; m <= 12; m++) {
    const mesec = String(m).padStart(2, '0');
    const danaUMesecu = new Date(godina, m, 0).getDate();
    for (let d = 1; d <= danaUMesecu; d++) {
      const dan = String(d).padStart(2, '0');
      sviDatumi.push(`${godina}-${mesec}-${dan}`);
    }
  }

  const izvestaj = sviDatumi.map(datum => {
    const odsutni = [];

    zaposleni.forEach(z => {
      if (z.periodi && Array.isArray(z.periodi)) {
        z.periodi.forEach(p => {
          if (p.pocetak && p.kraj && datum >= p.pocetak && datum <= p.kraj) {
            odsutni.push(z.ime);
          }
        });
      }
    });

    return {
      datum,
      broj: odsutni.length,
      imena: odsutni
    };
  });

  let tabela = `
  <table class="izvestaj-tabela">
    <tr>
      <th>Датум</th>
      <th>Број ослуствених</th>
      <th>Запослени</th>
    </tr>
  `;

  izvestaj.forEach(d => {
    const klasa = d.broj > 3 ? 'visoko' : d.broj === 0 ? 'nisko' : '';
    const datumSrpski = formatirajDatum(d.datum);
    tabela += `
    <tr class="${klasa}">
      <td>${datumSrpski}</td>
      <td>${d.broj}</td>
      <td>${d.imena.join(', ') || '–'}</td>
    </tr>
    `;
  });

  tabela += `</table>`;
  container.innerHTML += tabela;
}

// === ГЕНЕРИШИ ИЗВЕШТАЈ ПО МЕСЕЦИМА ===
function generisiIzvestajPoMesecima() {
  const godina = document.getElementById('godinaIzvestajMesec').value;
  const container = document.getElementById('prikazIzvestajaMesec');
  container.innerHTML = `<h3>Број ослуствених дана по месецима – ${godina}. година</h3>`;

  // Inicijalizuj brojač po mesecima
  const meseci = [
    'Јануар', 'Фебруар', 'Март', 'Април', 'Мај', 'Јун',
    'Јул', 'Август', 'Септембар', 'Октобар', 'Новембар', 'Децембар'
  ];

  const brojDana = Array(12).fill(0); // [0, 0, ..., 0]

  // Prođi kroz sve zaposlene i njihove periode
  zaposleni.forEach(z => {
    if (z.periodi && Array.isArray(z.periodi)) {
      z.periodi.forEach(p => {
        if (p.pocetak && p.kraj) {
          const pocetak = new Date(p.pocetak);
          const kraj = new Date(p.kraj);
          const god = pocetak.getFullYear();

          // Proveri da li je u traženoj godini
          if (god == godina) {
            let d = new Date(pocetak);
            while (d <= kraj) {
              const m = d.getMonth(); // 0 = januar, 11 = decembar
              brojDana[m]++;
              d.setDate(d.getDate() + 1);
            }
          }
        }
      });
    }
  });

  // Napravi tabelu
  let tabela = `
  <table class="izvestaj-mesec">
    <tr>
      <th>Месец</th>
      <th>Број ослуствених дана</th>
    </tr>
  `;

  meseci.forEach((mesec, index) => {
    tabela += `
    <tr>
      <td>${mesec} ${godina}.</td>
      <td>${brojDana[index]}</td>
    </tr>
    `;
  });

  tabela += `</table>`;
  container.innerHTML += tabela;
}

// === POČETNO UČITAVANJE ===
window.onload = ucitajPodatke;
