// Dane dostępowe - nie zmieniaj nazw tych stałych
const MOJA_URL = "https://cibbwjsixmkpyvhpjijk.supabase.co";
const MOJ_KLUCZ = "sb_publishable_PJHdt2Lx1Mj_wf7LZzf7AQ_4UdPSRLp";

// Inicjalizacja pod nazwą 'mojeDane' zamiast 'supabase'
const mojeDane = window.supabase.createClient(MOJA_URL, MOJ_KLUCZ);

async function pobierzGraczy() {
    const status = document.getElementById('status');
    status.innerText = "Synchronizacja...";

    const { data, error } = await mojeDane
        .from('gracze')
        .select('*')
        .order('id_gracz', { ascending: true });

    if (error) {
        status.innerText = "Błąd: " + error.message;
    } else {
        status.innerText = "Połączono!";
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

async function dodajGracza() {
    const id = document.getElementById('gracz_id').value;
    const nick = document.getElementById('gracz_nick').value;
    const kraj = document.getElementById('gracz_kraj').value;
    const rank = document.getElementById('gracz_rank').value;

    if (!id || !nick) {
        alert("Wypełnij ID i Pseudonim!");
        return;
    }

    const { error } = await mojeDane.from('gracze').insert([
        { 
            id_gracz: parseInt(id), 
            pseudonim: nick, 
            kraj_pochodzenia: kraj, 
            ranking_punktowy: parseInt(rank) 
        }
    ]);

    if (error) {
        alert("Błąd: " + error.message);
    } else {
        alert("Dodano pomyślnie!");
        pobierzGraczy();
    }
}

// Podpięcie eventu
document.getElementById('btn-add').addEventListener('click', dodajGracza);

// Start
pobierzGraczy();
