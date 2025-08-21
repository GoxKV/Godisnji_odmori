// === GLOBALNE PROMENLJIVE ===
let zaposleni = [];
let praznici = [];
let trenutniZaposleni = null;

// === PRIKAZ TABOVA ===
function showTab(id) {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.style.display = 'none';
    });
    document.getElementById(id).style.display = 'block';
}

// Početni prikaz
document.getElementById('zaposleni').style.display = 'block';

// === UČITAJ PODATKE IZ JSON FAJLOVA ===
async function ucitajPodatke() {
    try {
        const zaposleniRes = await fetch('data/zaposleni.json');
        if (zaposleniRes.ok) {
            zaposleni = await zaposleniRes.json();
        } else {
            throw new Error('Fajl nije pronađen');
        }
    } catch (e) {
        const izStorage = localStorage.getItem('zaposleni');
        zaposleni = izStorage ? JSON.parse(izStorage) : [
            {
                id: 1,
                ime: "Petar Petrović",
                kib: "123456789",
                goDana: 20,
                datumSlave: "15.03",
                delovi: 2,
                zelje: "6,7,8",
                periodi: []
            }
        ];
    }

    try {
        const prazniciRes = await fetch('data/praznici.json');
        if (prazniciRes.ok) {
            praznici = await prazniciRes.json();
        }
    } catch (e) {
        const izStorage = localStorage.getItem('praznici');
        praznici = izStorage ? JSON.parse(izStorage) : {
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
    }

    // Sačuvaj u localStorage za brži pristup
    localStorage.setItem('zaposleni', JSON.stringify(zaposleni));
    localStorage.setItem('praznici', JSON.stringify(praznici));

    prikaziZaposlene();
}

// === SAČUVAJ U localStorage ===
function sacuvajULocalStorage() {
    localStorage.setItem('zaposleni', JSON.stringify(zaposleni));
    localStorage.setItem('praznici', JSON.stringify(praznici));
}

// === PRIKAŽI SVE ZAPOSLENE U TABELI ===
function prikaziZaposlene() {
    const tabela = document.getElementById('tabelaZaposlenih').querySelector('tbody');
    tabela.innerHTML = '';
    zaposleni.forEach(osoba => {
        const red = document.createElement('tr');
        red.innerHTML = `
      <td>${osoba.ime}</td>
      <td>${osoba.kib}</td>
      <td>${osoba.goDana}</td>
      <td>${osoba.datumSlave}</td>
      <td>${osoba.delovi}</td>
      <td>${osoba.zelje || '–'}</td>
      <td>
        <button onclick="obrisiZaposlenog(${osoba.id})">Обриши</button>
        <button onclick="ukljuciUredjivanje(${osoba.id})">Уреди</button>
      </td>
    `;
        tabela.appendChild(red);
    });
}

// === DODAJ NOVOG ZAPOSLENOG ===
document.getElementById('dodajZaposlenog').addEventListener('submit', function (e) {
    e.preventDefault();
    const ime = document.getElementById('ime').value.trim();
    const kib = document.getElementById('kib').value.trim();
    const goDana = parseInt(document.getElementById('goDana').value);
    const datumSlave = document.getElementById('datumSlave').value.trim();
    const delovi = parseInt(document.getElementById('delovi').value);
    const zelje = document.getElementById('zelje').value.trim();

    const novi = {
        id: Date.now(),
        ime,
        kib,
        goDana,
        datumSlave,
        delovi,
        zelje,
        periodi: []
    };

    zaposleni.push(novi);
    sacuvajULocalStorage();
    prikaziZaposlene();
    this.reset();
});

// === OBRIŠI ZAPOSLENOG ===
function obrisiZaposlenog(id) {
    if (confirm('Желите ли заиста да обришете овог запосленог?')) {
        zaposleni = zaposleni.filter(osoba => osoba.id !== id);
        sacuvajULocalStorage();
        prikaziZaposlene();
    }
}

// === UKLJUČI UREĐIVANJE ===
function ukljuciUredjivanje(id) {
    trenutniZaposleni = zaposleni.find(z => z.id === id);
    if (!trenutniZaposleni) return;

    document.getElementById('formaUredjivanja').style.display = 'block';
    document.getElementById('imeZaposlenog').textContent = trenutniZaposleni.ime;
    document.getElementById('editDelovi').value = trenutniZaposleni.delovi || 2;

    ucitajPeriode();
}

// === UCITAJ PERIODE U FORMU ===
function ucitajPeriode() {
    const container = document.getElementById('periodiForma');
    container.innerHTML = '';

    if (!trenutniZaposleni.periodi) {
        trenutniZaposleni.periodi = [];
    }

    trenutniZaposleni.periodi.forEach((p, index) => {
        const div = document.createElement('div');
        div.innerHTML = `
      <label>Појачак: <input type="date" value="${p.pocetak || ''}" onchange="azurirajPeriod(${index}, 'pocetak', this.value)" /></label>
      <label>Крај: <input type="date" value="${p.kraj || ''}" onchange="azurirajPeriod(${index}, 'kraj', this.value)" /></label>
      <button onclick="obrisiPeriod(${index})">Обриши</button>
    `;
        container.appendChild(div);
    });
}

// === DODAJ NOVI PERIOD ===
function dodajPeriod() {
    trenutniZaposleni.periodi.push({ pocetak: '', kraj: '' });
    ucitajPeriode();
}

// === AZURIRAJ PERIOD ===
function azurirajPeriod(index, polje, vrednost) {
    trenutniZaposleni.periodi[index][polje] = vrednost;
}

// === OBRIŠI PERIOD ===
function obrisiPeriod(index) {
    trenutniZaposleni.periodi.splice(index, 1);
    ucitajPeriode();
}

// === SAČUVAJ IZMENE ===
function sacuvajIzmene() {
    const delovi = parseInt(document.getElementById('editDelovi').value);
    trenutniZaposleni.delovi = delovi;

    sacuvajULocalStorage();
    prikaziZaposlene();
    zatvoriFormu();
}

// === ZATVORI FORMU ===
function zatvoriFormu() {
    document.getElementById('formaUredjivanja').style.display = 'none';
    trenutniZaposleni = null;
}

// === ČUVANJE PRAZNICA ===
function sacuvajPraznike() {
    const godina = document.getElementById('godinaPraznika').value;
    const unos = document.getElementById('prazniciInput').value;
    const lista = unos.split('\n')
        .map(d => d.trim())
        .filter(d => d);
    praznici[godina] = lista;
    sacuvajULocalStorage();
    alert(`Сачувано: ${lista.length} датума за ${godina}. годину.`);
}

// === GENERIŠI RASPORED ===
function generisiRaspored() {
    const godina = document.getElementById('godinaRaspored').value;
    const container = document.getElementById('prikazRasporeda');
    container.innerHTML = `<h3>Распоред за ${godina}. годину</h3>`;

    const godisnjiPraznici = praznici[godina] || [];

    // Tabela za prikaz
    let tabela = `
  <table class="raspored-tabela">
    <tr>
      <th>Име</th>
      <th>Периоди коришћења ГО</th>
    </tr>
  `;

    // === Provera da li je dan neradan ===
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

    // === Dodaj radne dane (bez vikenda, praznika, slave) ===
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

    // === Broj odsutnih po datumu (za ravnomernost) ===
    const opterecenje = {};
    for (let m = 1; m <= 12; m++) {
        const mes = String(m).padStart(2, '0');
        for (let d = 1; d <= 31; d++) {
            const dan = String(d).padStart(2, '0');
            const datum = `${godina}-${mes}-${dan}`;
            const test = new Date(datum);
            if (test.getFullYear() == godina && test.getMonth() + 1 == m) {
                opterecenje[datum] = 0;
            }
        }
    }

    // === Ažuriraj opterećenje nakon dodavanja perioda ===
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

    // === Opterećenje u mesecu ===
    function opterecenjeUMesecu(mesec) {
        let ukupno = 0;
        for (let d = 1; d <= 31; d++) {
            const dan = String(d).padStart(2, '0');
            const mes = String(mesec).padStart(2, '0');
            const datum = `${godina}-${mes}-${dan}`;
            if (opterecenje[datum] !== undefined) {
                ukupno += opterecenje[datum];
            }
        }
        return ukupno;
    }

    // === Za svakog zaposlenog ===
    zaposleni.forEach(z => {
        const { ime, goDana, delovi, zelje } = z;
        const zeljeniMeseci = zelje ? zelje.split(',').map(m => parseInt(m.trim())) : [];

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

            // 1. Pokušaj u željenim mesecima (od najmanje opterećenog)
            const meseciZaPretragu = zeljeniMeseci
                .filter(m => m >= tekuciMesec && m <= 12)
                .sort((a, b) => opterecenjeUMesecu(a) - opterecenjeUMesecu(b));

            for (let m of meseciZaPretragu) {
                const mesecStr = String(m).padStart(2, '0');
                for (let d = 1; d <= 20; d++) {
                    const danStr = String(d).padStart(2, '0');
                    const pocetak = `${godina}-${mesecStr}-${danStr}`;
                    const kraj = dodajRadneDane(pocetak, dana);
                    const mesecKraja = new Date(kraj).getMonth() + 1;

                    // Proveri ograničenja
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

            // 2. Ako nije u željenim, probaj bilo gde (od najmanje opterećenog)
            if (!pronadjen) {
                const sviMeseci = Array.from({ length: 12 }, (_, i) => i + 1)
                    .filter(m => m >= tekuciMesec)
                    .sort((a, b) => opterecenjeUMesecu(a) - opterecenjeUMesecu(b));

                for (let m of sviMeseci) {
                    if ((m >= 5 && m <= 9) && dana > 12) continue;
                    const mesecStr = String(m).padStart(2, '0');
                    for (let d = 1; d <= 20; d++) {
                        const danStr = String(d).padStart(2, '0');
                        const pocetak = `${godina}-${mesecStr}-${danStr}`;
                        const kraj = dodajRadneDane(pocetak, dana);
                        if (new Date(kraj).getDay() === 5) continue;

                        najboljiDatum = { pocetak, kraj, dana };
                        pronadjen = true;
                        tekuciMesec = mesecKraja + 1;
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
                azurirajOpterecenje(najboljiDatum.pocetak, najboljiDatum.kraj);
            }
        });

        // Ako ima ručno unete periode – koristi ih umesto automatskih
        if (z.periodi && z.periodi.length > 0) {
            const rucni = z.periodi.filter(p => p.pocetak && p.kraj);
            if (rucni.length > 0) {
                periodi = rucni;
            }
        }

        const periodiHTML = periodi.map(p =>
            `${p.pocetak} – ${p.kraj}`
        ).join('<br>');

        tabela += `
    <tr>
      <td>${ime}</td>
      <td>${periodiHTML}</td>
    </tr>
    `;
    });

    tabela += `</table>`;
    container.innerHTML += tabela;
}

// === PREUZMI PODATKE KAO JSON ===
function preuzmiPodatke() {
    sacuvajULocalStorage();

    // Zaposleni
    const zaposleniBlob = new Blob([JSON.stringify(zaposleni, null, 2)], { type: 'application/json' });
    const zaposleniUrl = URL.createObjectURL(zaposleniBlob);
    const zaposleniLink = document.createElement('a');
    zaposleniLink.href = zaposleniUrl;
    zaposleniLink.download = 'zaposleni.json';
    zaposleniLink.click();

    // Praznici
    const prazniciBlob = new Blob([JSON.stringify(praznici, null, 2)], { type: 'application/json' });
    const prazniciUrl = URL.createObjectURL(prazniciBlob);
    const prazniciLink = document.createElement('a');
    prazniciLink.href = prazniciUrl;
    prazniciLink.download = 'praznici.json';
    prazniciLink.click();

    alert('Фајлови су преузети: zaposleni.json и praznici.json');
}

// === POZVATI NA POČETKU ===
window.onload = () => {
    ucitajPodatke();
};