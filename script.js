// 1. Konfiguracja
const MOJA_URL = "https://cibbwjsixmkpyvhjpijk.supabase.co";
const MOJ_KLUCZ = "sb_publishable_PJHdt2Lx1Mj_wf7LZzf7AQ_4UdPSRLp";

const db = window.supabase.createClient(MOJA_URL, MOJ_KLUCZ);

// 2. Pobieranie danych
async function zaladujDane() {
    const selector = document.getElementById('table-select');
    const tableName = selector.value;
    const status = document.getElementById('status');
    
    status.innerText = `Pobieranie tabeli: ${tableName}...`;

    const { data, error } = await db.from(tableName).select('*');

    if (error) {
        status.innerText = "Błąd: " + error.message;
        return;
    }

    status.innerText = `Status: Połączono (Tabela: ${tableName})`;
    renderujTabele(data);
}

// 3. Renderowanie dynamiczne
function renderujTabele(dane) {
    const headRow = document.getElementById('table-headers');
    const body = document.getElementById('table-body');
    
    headRow.innerHTML = "";
    body.innerHTML = "";

    if (!dane || dane.length === 0) {
        body.innerHTML = "<tr><td colspan='100%'>Brak rekordów.</td></tr>";
        return;
    }

    const kolumny = Object.keys(dane[0]);

    kolumny.forEach(klucz => {
        const th = document.createElement('th');
        th.innerText = klucz.replace(/_/g, ' ').toUpperCase();
        headRow.appendChild(th);
    });

    dane.forEach(wiersz => {
        const tr = document.createElement('tr');
        kolumny.forEach(klucz => {
            const td = document.createElement('td');
            td.innerText = wiersz[klucz] !== null ? wiersz[klucz] : '-';
            tr.appendChild(td);
        });
        body.appendChild(tr);
    });
}

// 4. Poprawiona funkcja dodawania (obsługuje ID Użytkownika)
async function dodajGracza() {
    const id = document.getElementById('gracz_id').value;
    const nick = document.getElementById('gracz_nick').value;
    const kraj = document.getElementById('gracz_kraj').value;
    const rank = document.getElementById('gracz_rank').value;
    const userId = document.getElementById('user_id').value; // Nowe pole

    if (!id || !nick) {
        alert("Podaj ID i Pseudonim!");
        return;
    }

    const { error } = await db.from('gracze').insert([
        { 
            id_gracz: parseInt(id), 
            pseudonim: nick, 
            kraj_pochodzenia: kraj, 
            ranking_punktowy: parseInt(rank) || 0,
            uzytkownicy_id_uzytkownika: userId ? parseInt(userId) : null // Tu wpada ID użytkownika
        }
    ]);

    if (error) {
        alert("Błąd: " + error.message);
    } else {
        alert("Dodano zawodnika!");
        // Czyszczenie pól
        document.getElementById('gracz_id').value = "";
        document.getElementById('gracz_nick').value = "";
        document.getElementById('gracz_kraj').value = "";
        document.getElementById('gracz_rank').value = "";
        document.getElementById('user_id').value = "";
        zaladujDane();
    }
}

// 5. Eventy
document.getElementById('table-select').addEventListener('change', zaladujDane);
document.getElementById('btn-add').addEventListener('click', dodajGracza);

document.addEventListener('DOMContentLoaded', zaladujDane);
