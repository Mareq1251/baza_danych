const SB_URL = "https://cibbwjsixmkpyvhjpijk.supabase.co";
const SB_KEY = "sb_publishable_PJHdt2Lx1Mj_wf7LZzf7AQ_4UdPSRLp";
const db = window.supabase.createClient(SB_URL, SB_KEY);

let currentUserRole = null;

// 1. Logowanie
function handleLogin() {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    const msg = document.getElementById('login-msg');

    if (user === 'admin' && pass === 'admin123') {
        currentUserRole = 'admin';
    } else if (user === 'user' && pass === 'user123') {
        currentUserRole = 'user';
    } else {
        msg.innerText = "Błędne dane logowania!";
        return;
    }

    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    if (currentUserRole === 'admin') document.getElementById('admin-panel').style.display = 'block';
    zaladujDane();
}

function handleLogout() { location.reload(); }

// 2. Dynamiczne pobieranie i budowanie formularza
async function zaladujDane() {
    const tableName = document.getElementById('table-select').value;
    document.getElementById('current-table-name').innerText = tableName.toUpperCase();
    
    const { data, error } = await db.from(tableName).select('*');
    if (error) return;

    renderujTabele(data);
    if (currentUserRole === 'admin') generujFormularz(data[0]);
}

function renderujTabele(dane) {
    const thead = document.getElementById('table-headers');
    const tbody = document.getElementById('table-body');
    thead.innerHTML = ""; tbody.innerHTML = "";
    if (!dane || dane.length === 0) return;

    const kolumny = Object.keys(dane[0]);
    kolumny.forEach(k => thead.innerHTML += `<th>${k.replace(/_/g, ' ')}</th>`);
    
    dane.forEach(w => {
        const row = kolumny.map(k => `<td>${w[k] !== null ? w[k] : '-'}</td>`).join('');
        tbody.innerHTML += `<tr>${row}</tr>`;
    });
}

function generujFormularz(przyklad) {
    const formContainer = document.getElementById('dynamic-form');
    formContainer.innerHTML = "";
    if (!przyklad) return;

    Object.keys(przyklad).forEach(klucz => {
        const input = document.createElement('input');
        input.type = typeof przyklad[klucz] === 'number' ? 'number' : 'text';
        input.id = `f-${klucz}`;
        input.placeholder = klucz.replace(/_/g, ' ').toUpperCase();
        formContainer.appendChild(input);
    });
}

// 3. Uniwersalne wysyłanie danych
async function wyslijDane() {
    const tableName = document.getElementById('table-select').value;
    const fields = document.querySelectorAll('#dynamic-form input');
    let payload = {};

    fields.forEach(input => {
        const key = input.id.replace('f-', '');
        payload[key] = input.type === 'number' ? parseInt(input.value) : input.value;
    });

    const { error } = await db.from(tableName).insert([payload]);

    if (error) alert("Błąd: " + error.message);
    else {
        alert("Dodano rekord!");
        zaladujDane();
    }
}

document.getElementById('table-select').addEventListener('change', zaladujDane);
