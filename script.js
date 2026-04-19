const MOJA_URL = "https://cibbwjsixmkpyvhjpijk.supabase.co";
const MOJ_KLUCZ = "sb_publishable_PJHdt2Lx1Mj_wf7LZzf7AQ_4UdPSRLp";
const db = window.supabase.createClient(MOJA_URL, MOJ_KLUCZ);

// Główna funkcja pobierająca dowolną tabelę
async function zaladujDane() {
    const tableName = document.getElementById('table-select').value;
    const status = document.getElementById('status');
    status.innerText = `Pobieranie tabeli: ${tableName}...`;

    const { data, error } = await db.from(tableName).select('*');

    if (error) {
        status.innerText = "Błąd: " + error.message;
        return;
    }

    status.innerText = `Wyświetlasz: ${tableName} (${data.length} rekordów)`;
    renderujTabele(data);
}

// Funkcja, która tworzy kolumny na podstawie danych
function renderujTabele(dane) {
    const thead = document.getElementById('table-headers');
    const tbody = document.getElementById('table-body');
    
    thead.innerHTML = "";
    tbody.innerHTML = "";

    if (dane.length === 0) {
        tbody.innerHTML = "<tr><td colspan='100%'>Tabela jest pusta</td></tr>";
        return;
    }

    // 1. Tworzymy nagłówki na podstawie kluczy z pierwszego obiektu
    const kolumny = Object.keys(dane[0]);
    kolumny.forEach(kol => {
        const th = document.createElement('th');
        th.innerText = kol.replace(/_/g, ' ').toUpperCase(); // czytelniejsze nazwy
        thead.appendChild(th);
    });

    // 2. Wypełniamy wiersze
    dane.forEach(wiersz => {
        const tr = document.createElement('tr');
        kolumny.forEach(kol => {
            const td = document.createElement('td');
            td.innerText = wiersz[kol] !== null ? wiersz[kol] : '-';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

// Eventy
document.getElementById('table-select').addEventListener('change', zaladujDane);

// Jeśli masz przycisk do dodawania gracza, upewnij się że nadal działa
const btnAdd = document.getElementById('btn-add');
if(btnAdd) {
    btnAdd.onclick = async () => {
        // ... tutaj zostaw swoją funkcję dodajGracza ...
        // po dodaniu wywołaj zaladujDane()
    };
}

// Start aplikacji
document.addEventListener('DOMContentLoaded', zaladujDane);
