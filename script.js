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
        console.error("Błąd pobierania:", error); 
        status.innerText = "Błąd: " + error.message;
        return; 
    }

    status.innerText = `Baza online (Znaleziono: ${data.length} rekordów)`;
    renderujTabele(data);
    
    // Generowanie panelu Admina
    if (currentUserRole === 'admin') {
        if (data.length > 0) {
            generujFormularz(data[0]); // Formularz widzi pełne dane (w tym ID użytkownika)
        } else {
            document.getElementById('dynamic-form').innerHTML = 
                "<p style='grid-column: span 2; color: #ff4d4d;'>Tabela jest pusta, więc system nie może zbudować formularza. Najpierw dodaj ręcznie 1 rekord w panelu Supabase.</p>";
        }
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
    // Filtracja: Ukrywamy techniczną kolumnę przed wzrokiem
    const kolumnyDoWyswietlenia = wszystkieKolumny.filter(k => k !== 'uzytkownicy_id_uzytkownika');

    // Rysowanie nagłówków
    kolumnyDoWyswietlenia.forEach(k => {
        const th = document.createElement('th');
        th.innerText = k.replace(/_/g, ' ').toUpperCase();
        thead.appendChild(th);
    });
    if (currentUserRole === 'admin') thead.innerHTML += "<th>AKCJE</th>";

    // Rysowanie wierszy z danymi
    dane.forEach(wiersz => {
        const tr = document.createElement('tr');
        
        kolumnyDoWyswietlenia.forEach(k => {
            tr.innerHTML += `<td>${wiersz[k] !== null ? wiersz[k] : '-'}</td>`;
        });

        // Przycisk usuwania (tylko dla admina)
        if (currentUserRole === 'admin') {
            const idCol = wszystkieKolumny[0]; // Bierzemy prawdziwe ID rekordu z pełnej listy
            const idVal = wiersz[idCol];
            tr.innerHTML += `<td><button class="btn-delete" onclick="usunRekord('${idCol}', '${idVal}')">USUŃ</button></td>`;
        }
        tbody.appendChild(tr);
    });
}

function generujFormularz(wzor) {
    const form = document.getElementById('dynamic-form');
    form.innerHTML = "";
    Object.keys(wzor).forEach(k => {
        form.innerHTML += `<input type="${typeof wzor[k] === 'number' ? 'number' : 'text'}" id="f-${k}" placeholder="${k.toUpperCase()}">`;
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

// 6. Inicjalizacja
document.getElementById('table-select').addEventListener('change', zaladujDane);
