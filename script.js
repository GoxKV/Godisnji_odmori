// === FORMATIRAJ DATUM: YYYY-MM-DD → dd.mm.yyyy. ===
function formatirajDatum(datum) {
  if (!datum) return '–';
  const [godina, mesec, dan] = datum.split('-');
  return `${dan}.${mesec}.${godina}.`;
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
        "delovi": 2,
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

  const godisnjiPraznici = praznici[godina] || [];

  let tabela = `
  <table class="raspored-tabela">
    <tr>
      <th>Име</th>
      <th>Жељени месеци</th>
      <th>Периоди коришћења ГО</th>
    </tr>
  `;

  // Provera da li je dan neradan
  function jeNeradan(datum) {
    const d = new Date(datum);
    const danUNedelji = d.getDay(); // 0 = nedelja, 6 = subota
    const jeVikend = (danUNedelji === 0 || danUNedelji === 6);
    const jePraznik = godisnjiPraznici.includes(datum);
    const mesec = String(d.getMonth() + 1).padStart(2, '0');
    const dan = String(d.getDate()).padStart(2, '0');
    const datumSlava = `${dan}.${mesec}`;
    const jeSlava = zaposleni.some(z => z.datumSlave === datumSlava);
    return jeVikend || jePraznik || jeSlava;
  }

  // Dodaj radne dane (bez neradnih)
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

  // Za svakog zaposlenog
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

    // Podeli dane
    if (delovi === 2) {
      const prvi = Math.floor(goDana / 2);
      podela = [prvi, goDana - prvi];
    } else {
      const prvi = Math.floor(goDana / 3);
      const drugi = Math.floor((goDana - prvi) / 2);
      podela = [prvi, drugi, goDana - prvi - drugi];
    }

    let tekuciMesec = 1;

    podela.forEach(dana => {
      let pronadjen = false;
      let najboljiDatum = null;

      // 1. Pokušaj u željenim mesecima
      if (zeljeniMeseci.length > 0) {
        for (let m of zeljeniMeseci) {
          if (m < tekuciMesec) continue;
          for (let d = 1; d <= 20; d++) {
            const mesecStr = String(m).padStart(2, '0');
            const danStr = String(d).padStart(2, '0');
            const pocetak = `${godina}-${mesecStr}-${danStr}`;
            const kraj = dodajRadneDane(pocetak, dana);
            const mesecKraja = new Date(kraj).getMonth() + 1;

            // Ograničenje za 5–9
            if ((m >= 5 && m <= 9) && dana > 12) continue;
            if ((mesecKraja >= 5 && mesecKraja <= 9) && dana > 12) continue;
            if (new Date(kraj).getDay() === 5) continue; // ne završava petkom

            najboljiDatum = { pocetak, kraj, dana };
            pronadjen = true;
            tekuciMesec = mesecKraja + 1;
            break;
          }
          if (pronadjen) break;
        }
      }

      // 2. Ako nema mesta u željenim, probaj bilo gde
      if (!pronadjen) {
        for (let m = tekuciMesec; m <= 12; m++) {
          if ((m >= 5 && m <= 9) && dana > 12) continue;
          for (let d = 1; d <= 20; d++) {
            const mesecStr = String(m).padStart(2, '0');
            const danStr = String(d).padStart(2, '0');
            const pocetak = `${godina}-${mesecStr}-${danStr}`;
            const kraj = dodajRadneDane(pocetak, dana);
            if (new Date(kraj).getDay() === 5) continue;

            najboljiDatum = { pocetak, kraj, dana };
            pronadjen = true;
            tekuciMesec = new Date(kraj).getMonth() + 2;
            break;
          }
          if (pronadjen) break;
        }
      }

      // 3. Fallback
      if (!pronadjen) {
        const pocetak = `${godina}-06-01`;
        const kraj = dodajRadneDane(pocetak, dana);
        najboljiDatum = { pocetak, kraj, dana };
        tekuciMesec = new Date(kraj).getMonth() + 2;
      }

      if (najboljiDatum) {
        periodi.push(najboljiDatum);
      }
    });

    const periodiHTML = periodi.map(p =>
      `${formatirajDatum(p.pocetak)} – ${formatirajDatum(p.kraj)}`
    ).join('<br>');

    tabela += `
    <tr>
      <td>${ime}</td>
      <td>${zelje || '–'}</td>
      <td>${periodiHTML}</td>
    </tr>
    `;
  });

  tabela += `</table>`;
  container.innerHTML += tabela;
}

// === POČETNO UČITAVANJE ===
window.onload = ucitajPodatke;