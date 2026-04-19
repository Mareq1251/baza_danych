// 1. Dane dostępowe
const SB_URL = "https://cibbwjsixmkpyvhpjijk.supabase.co";
const SB_KEY = "sb_publishable_PJHdt2Lx1Mj_wf7LZzf7AQ_4UdPSRLp";

// 2. Inicjalizacja (używamy innej nazwy zmiennej - 'db')
const db = window.supabase.createClient(SB_URL, SB_KEY);

// 3. Pobieranie graczy z bazy
async function pobierzGraczy() {
    const status = document.getElementById('status');
    status.innerText = "Synchronizacja z bazą...";

    const { data, error } = await db
        .from('gracze')
        .select('*')
        .order('id_gracz', { ascending: true });

    if (error) {
        status.innerText = "Błąd: " + error.message;
    } else {
        status.innerText = "Baza online (Healthy)";
        const tbody = document.querySelector('#tabela-graczy tbody');
        tbody.innerHTML = data.map(g => `
            <tr>
                <td>${g.id_gracz}</td>
                <td><strong>${g.pseudonim}</strong></td>
                <td>${g.kraj_pochodzenia}</td>
                <td>${g.ranking_punktowy} pkt</td>
            </tr>
        `).join('');
    }
}

// 4. Dodawanie nowego gracza
async function dodajGracza() {
    const id = document.getElementById('gracz_id').value;
    const nick = document.getElementById('gracz_nick').value;
    const kraj = document.getElementById('gracz_kraj').value;
    const rank = document.getElementById('gracz_rank').value;

    if (!id || !nick) {
        alert("Wypełnij przynajmniej ID i Pseudonim!");
        return;
    }

    const { error } = await db.from('gracze').insert([
        { 
            id_gracz: parseInt(id), 
            pseudonim: nick, 
            kraj_pochodzenia: kraj, 
            ranking_punktowy: parseInt(rank) 
        }
    ]);

    if (error) {
        alert("Błąd przy zapisie: " + error.message);
    } else {
        alert("Udało się! Dane są już w chmurze.");
        document.getElementById('gracz_id').value = "";
        document.getElementById('gracz_nick').value = "";
        document.getElementById('gracz_kraj').value = "";
        document.getElementById('gracz_rank').value = "";
        pobierzGraczy();
    }
}

// 5. Podpięcie przycisku i start
document.getElementById('btn-add').addEventListener('click', dodajGracza);
pobierzGraczy();
