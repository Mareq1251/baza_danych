// 1. Dane dostępowe - TUTAJ BYŁ BŁĄD (vhj zamiast vhp)
const MOJA_URL = "https://cibbwjsixmkpyvhjpijk.supabase.co";
const MOJ_KLUCZ = "sb_publishable_PJHdt2Lx1Mj_wf7LZzf7AQ_4UdPSRLp";

// 2. Inicjalizacja
const mojeDane = window.supabase.createClient(MOJA_URL, MOJ_KLUCZ);

async function pobierzGraczy() {
    const statusLabel = document.getElementById('status');
    statusLabel.innerText = "Synchronizacja danych...";

    const { data, error } = await mojeDane
        .from('gracze')
        .select('*')
        .order('id_gracz', { ascending: true });

    if (error) {
        statusLabel.innerText = "Błąd: " + error.message;
        console.error(error);
    } else {
        statusLabel.innerText = "Połączono! Baza online";
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
            ranking_punktowy: parseInt(rank) || 0 
        }
    ]);

    if (error) {
        alert("Błąd: " + error.message);
    } else {
        alert("Dodano pomyślnie!");
        document.getElementById('gracz_id').value = "";
        document.getElementById('gracz_nick').value = "";
        document.getElementById('gracz_kraj').value = "";
        document.getElementById('gracz_rank').value = "";
        pobierzGraczy();
    }
}

// Podpięcie przycisku (id musi być btn-add)
const btn = document.getElementById('btn-add');
if(btn) btn.onclick = dodajGracza;

pobierzGraczy();
