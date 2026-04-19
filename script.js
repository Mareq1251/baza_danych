// 1. Konfiguracja połączenia
const SB_URL = "https://cibbwjsixmkpyvhjpijk.supabase.co";
const SB_KEY = "sb_publishable_PJHdt2Lx1Mj_wf7LZzf7AQ_4UdPSRLp";
const db = window.supabase.createClient(SB_URL, SB_KEY);

// 2. Dane logowania (zakodowane w Base64 dla dyskrecji)
// admin / admin123
const AUTH = {
    u: "YWRtaW4=", 
    p: "YWRtaW4xMjM="
};

let currentUserRole = 'user';

// 3. Obsługa logowania
function handleLogin() {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    const msg = document.getElementById('login-msg');

    if (btoa(user) === AUTH.u && btoa(pass) === AUTH.p) {
        // Zalogowano jako ADMIN
        currentUserRole = 'admin';
        wejdzDoSystemu(true);
    } else if (user === 'widz') {
        // Zalogowano jako ZWYKŁY UŻYTKOWNIK (bez hasła)
        currentUserRole = 'user';
        wejdzDoSystemu(false);
    } else {
        msg.innerText = "Błędne dane! Wejdź jako 'admin' lub 'widz'.";
    }
}

function wejdzDoSystemu(isAdmin) {
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('admin-panel').style.display = isAdmin ? 'block' : 'none';
    zaladujDane();
}

function handleLogout() {
    location.reload();
}

// 4. Pobieranie danych i dynamiczna budowa interfejsu
async function zaladujDane() {
    const tableName = document.getElementById('table-select').value;
    const status = document.getElementById('status');
    const tableTitle = document.getElementById('current-table-name');
    
    if (tableTitle) tableTitle.innerText = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    status.innerText = `Pobieranie danych z: ${tableName}...`;

    const { data, error } = await db.from(tableName).select('*');

    if (error) {
        status.innerText = "Błąd: " + error.message;
        return;
    }

    status.innerText = "Status: Połączono";
    renderujTabele(data);
    
    // Generuj formularz tylko jeśli użytkownik jest adminem
    if (currentUserRole === 'admin' && data.length > 0) {
        generujFormularz(data[0]);
    }
}

// 5. Budowanie tabeli na podstawie dowolnych danych
function renderujTabele(dane) {
    const thead = document.getElementById('table-headers');
    const tbody = document.getElementById('table-body');
    
    thead.innerHTML = "";
    tbody.innerHTML = "";

    if (!dane || dane.length === 0) {
        tbody.innerHTML = "<tr><td colspan='100%'>Tabela jest pusta.</td></tr>";
        return;
    }

    const kolumny = Object.keys(dane[0]);

    // Nagłówki
    kolumny.forEach(k => {
        const th = document.createElement('th');
        th.innerText = k.replace(/_/g, ' ').toUpperCase();
        thead.appendChild(th);
    });

    // Wiersze
    dane.forEach(wiersz => {
        const tr = document.createElement('tr');
        kolumny.forEach(k => {
            const td = document.createElement('td');
            td.innerText = wiersz[k] !== null ? wiersz[k] : '-';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

// 6. Automatyczne tworzenie pól formularza na podstawie kolumn tabeli
function generujFormularz(wzorzec) {
    const formContainer = document.getElementById('dynamic-form');
    formContainer.innerHTML = "";

    Object.keys(wzorzec).forEach(klucz => {
        const input = document.createElement('input');
        // Jeśli wartość jest liczbą, ustaw typ pola na number
        input.type = typeof wzorzec[klucz] === 'number' ? 'number' : 'text';
        input.id = `field-${klucz}`;
        input.placeholder = klucz.replace(/_/g, ' ').toUpperCase();
        formContainer.appendChild(input);
    });
}

// 7. Uniwersalna funkcja wysyłania danych do wybranej tabeli
async function wyslijDane() {
    const tableName = document.getElementById('table-select').value;
    const inputs = document.querySelectorAll('#dynamic-form input');
    let nowyRekord = {};

    inputs.forEach(input => {
        const klucz = input.id.replace('field-', '');
        let wartosc = input.value;

        if (input.type === 'number') {
            wartosc = wartosc === "" ? null : parseInt(wartosc);
        } else {
            wartosc = wartosc === "" ? null : wartosc;
        }
        
        nowyRekord[klucz] = wartosc;
    });

    const { error } = await db.from(tableName).insert([nowyRekord]);

    if (error) {
        alert("Błąd zapisu: " + error.message);
    } else {
        alert("Pomyślnie dodano rekord do tabeli " + tableName);
        zaladujDane(); // Odśwież widok
    }
}

// 8. Eventy
document.getElementById('table-select').addEventListener('change', zaladujDane);

// Start
console.log("System gotowy.");
