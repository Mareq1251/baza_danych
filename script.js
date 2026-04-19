// 1. Konfiguracja Supabase
const SB_URL = "https://cibbwjsixmkpyvhjpijk.supabase.co";
const SB_KEY = "sb_publishable_PJHdt2Lx1Mj_wf7LZzf7AQ_4UdPSRLp";
const db = window.supabase.createClient(SB_URL, SB_KEY);

// 2. Dane logowania (admin / admin123)
const AUTH = { u: "YWRtaW4=", p: "YWRtaW4xMjM=" };
let currentUserRole = 'user';

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

    status.innerText = `Baza online (Znaleziono: ${data.length} rekordów)`;
    renderujTabele(data);
    
    if (currentUserRole === 'admin' && data.length > 0) {
        generujFormularz(data[0]);
    }
}

function renderujTabele(dane) {
    const thead = document.getElementById('table-headers');
    const tbody = document.getElementById('table-body');
    thead.innerHTML = ""; tbody.innerHTML = "";
    
    if (!dane || dane.length === 0) { 
        tbody.innerHTML = "<tr><td colspan='100%'>Brak danych w tej tabeli</td></tr>"; 
        return; 
    }

    const wszystkieKolumny = Object.keys(dane[0]);
    // Filtracja: Ukrywamy techniczną kolumnę w tabeli
    const kolumnyDoWyswietlenia = wszystkieKolumny.filter(k => k.toLowerCase() !== 'uzytkownicy_id_uzytkownika');

    kolumnyDoWyswietlenia.forEach(k => {
        const th = document.createElement('th');
        th.innerText = k.replace(/_/g, ' ').toUpperCase();
        thead.appendChild(th);
    });
    if (currentUserRole === 'admin') thead.innerHTML += "<th>AKCJE</th>";

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

// POPRAWKA: Pole znika z formularza
function generujFormularz(wzor) {
    const form = document.getElementById('dynamic-form');
    form.innerHTML = "";
    Object.keys(wzor).forEach(k => {
        // Jeśli to pole relacji, nie twórz dla niego wejścia (Input)
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

    // POPRAWKA: Automatyczne dodawanie ID użytkownika w tle
    if (tableName === 'gracze') {
        obj['uzytkownicy_id_uzytkownika'] = 1; // Domyślnie przypisz do konta nr 1
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
