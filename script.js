// 1. Konfiguracja Supabase
const SB_URL = "https://cibbwjsixmkpyvhjpijk.supabase.co";
const SB_KEY = "sb_publishable_PJHdt2Lx1Mj_wf7LZzf7AQ_4UdPSRLp";
const db = window.supabase.createClient(SB_URL, SB_KEY);

// 2. Dane logowania i stan aplikacji
const AUTH = { u: "YWRtaW4=", p: "YWRtaW4xMjM=" };
let currentUserRole = 'user';

// Zmienne do sortowania
let aktualneDane = []; 
let aktualnaKolumna = ''; 
let kierunekSortowania = 'asc'; 

// 3. System Logowania
function handleLogin() {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    const msg = document.getElementById('login-msg');

    if (btoa(user) === AUTH.u && btoa(pass) === AUTH.p) {
        currentUserRole = 'admin';
        wejdzDoSystemu(true);
    } else if (user === 'widz') {
        currentUserRole = 'user';
        wejdzDoSystemu(false);
    } else {
        msg.innerText = "Błąd! Admin wymaga hasła, widz nie.";
    }
}

function wejdzDoSystemu(isAdmin) {
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('admin-panel').style.display = isAdmin ? 'block' : 'none';
    zaladujDane();
}

function handleLogout() { location.reload(); }

// 4. Zarządzanie danymi
async function zaladujDane() {
    const tableName = document.getElementById('table-select').value;
    const tableTitle = document.getElementById('current-table-name');
    const status = document.getElementById('status');
    
    if (tableTitle) tableTitle.innerText = tableName.toUpperCase();
    status.innerText = `Pobieranie danych z: ${tableName}...`;
    
    const { data, error } = await db.from(tableName).select('*');
    
    if (error) { 
        status.innerText = "Błąd: " + error.message;
        return; 
    }

    // Reset sortowania przy zmianie tabeli
    aktualnaKolumna = ''; 
    kierunekSortowania = 'asc';
    aktualneDane = data; 

    status.innerText = `Baza online (Znaleziono: ${data.length} rekordów)`;
    
    renderujTabele(aktualneDane);
    
    if (currentUserRole === 'admin') {
        if (data.length > 0) {
            generujFormularz(data[0]);
        } else {
            document.getElementById('dynamic-form').innerHTML = 
                "<p style='grid-column: span 2; color: #ff4d4d;'>Tabela jest pusta. Dodaj pierwszy rekord ręcznie w bazie.</p>";
        }
    }
}

// Logika Sortowania
function sortuj(kolumna) {
    if (!aktualneDane || aktualneDane.length === 0) return;

    if (aktualnaKolumna === kolumna) {
        kierunekSortowania = kierunekSortowania === 'asc' ? 'desc' : 'asc';
    } else {
        aktualnaKolumna = kolumna;
        kierunekSortowania = 'asc';
    }

    aktualneDane.sort((a, b) => {
        let valA = a[kolumna];
        let valB = b[kolumna];

        if (valA === null) return 1;
        if (valB === null) return -1;

        if (typeof valA === 'string') {
            return kierunekSortowania === 'asc' 
                ? valA.localeCompare(valB) 
                : valB.localeCompare(valA);
        } else {
            return kierunekSortowania === 'asc' 
                ? valA - valB 
                : valB - valA;
        }
    });

    renderujTabele(aktualneDane);
}

// Renderowanie tabeli
function renderujTabele(dane) {
    const thead = document.getElementById('table-headers');
    const tbody = document.getElementById('table-body');
    thead.innerHTML = ""; tbody.innerHTML = "";
    
    if (!dane || dane.length === 0) { 
        tbody.innerHTML = "<tr><td colspan='100%'>Brak danych w tej tabeli</td></tr>"; 
        return; 
    }

    const wszystkieKolumny = Object.keys(dane[0]);
    // Filtracja technicznej kolumny
    const kolumnyDoWyswietlenia = wszystkieKolumny.filter(k => k.toLowerCase() !== 'uzytkownicy_id_uzytkownika');

    // Nagłówki
    kolumnyDoWyswietlenia.forEach(k => {
        const th = document.createElement('th');
        let naglowekTekst = k.replace(/_/g, ' ').toUpperCase();

        if (aktualnaKolumna === k) {
            naglowekTekst += kierunekSortowania === 'asc' ? ' 🔼' : ' 🔽';
        }

        th.innerText = naglowekTekst;
        th.title = "Kliknij, aby posortować";
        th.onclick = () => sortuj(k);
        thead.appendChild(th);
    });

    if (currentUserRole === 'admin') {
        const thAkcje = document.createElement('th');
        thAkcje.innerText = "AKCJE";
        thead.appendChild(thAkcje);
    }

    // Wiersze
    dane.forEach(wiersz => {
        const tr = document.createElement('tr');
        kolumnyDoWyswietlenia.forEach(k => {
            tr.innerHTML += `<td>${wiersz[k] !== null ? wiersz[k] : '-'}</td>`;
        });

        if (currentUserRole === 'admin') {
            const idCol = wszystkieKolumny[0]; 
            const idVal = wiersz[idCol];
            tr.innerHTML += `<td><button class="btn-delete" onclick="usunRekord('${idCol}', '${idVal}')">USUŃ</button></td>`;
        }
        tbody.appendChild(tr);
    });
}

// Generowanie formularza z ominięciem technicznego ID
function generujFormularz(wzor) {
    const form = document.getElementById('dynamic-form');
    form.innerHTML = "";
    Object.keys(wzor).forEach(k => {
        if (k.toLowerCase() === 'uzytkownicy_id_uzytkownika') return;
        let przyjaznaNazwa = k.replace(/_/g, ' ').toUpperCase();
        form.innerHTML += `<input type="${typeof wzor[k] === 'number' ? 'number' : 'text'}" id="f-${k}" placeholder="${przyjaznaNazwa}">`;
    });
}

// 5. Akcje: Dodawanie i Usuwanie
async function wyslijDane() {
    const tableName = document.getElementById('table-select').value;
    const inputs = document.querySelectorAll('#dynamic-form input');
    let obj = {};
    
    inputs.forEach(i => {
        const key = i.id.replace('f-', '');
        obj[key] = i.type === 'number' ? (i.value === "" ? null : parseInt(i.value)) : i.value;
    });

    // Automatyczne przypisywanie relacji
    if (tableName === 'gracze') {
        obj['uzytkownicy_id_uzytkownika'] = 1; 
    }

    const { error } = await db.from(tableName).insert([obj]);
    if (error) alert("Błąd: " + error.message);
    else { alert("Dodano rekord!"); zaladujDane(); }
}

async function usunRekord(col, val) {
    const table = document.getElementById('table-select').value;
    if (confirm(`UWAGA: Czy na pewno usunąć rekord gdzie ${col} = ${val}?`)) {
        const { error } = await db.from(table).delete().eq(col, val);
        if (error) alert("Błąd: " + error.message);
        else { alert("Usunięto!"); zaladujDane(); }
    }
}

document.getElementById('table-select').addEventListener('change', zaladujDane);
