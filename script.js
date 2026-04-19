// 1. Dane dostępowe do Twojego projektu w chmurze
const MOJA_URL = "https://cibbwjsixmkpyvhpjijk.supabase.co";
const MOJ_KLUCZ = "sb_publishable_PJHdt2Lx1Mj_wf7LZzf7AQ_4UdPSRLp";

// 2. Inicjalizacja połączenia (używamy unikalnej nazwy 'mojeDane')
const mojeDane = window.supabase.createClient(MOJA_URL, MOJ_KLUCZ);

// 3. Funkcja pobierająca listę graczy z bazy
async function pobierzGraczy() {
    const statusLabel = document.getElementById('status');
    statusLabel.innerText = "Synchronizacja danych...";

    const { data, error } = await mojeDane
        .from('gracze')
        .select('*')
        .order('id_gracz', { ascending: true });

    if (error) {
        statusLabel.innerText = "Błąd połączenia: " + error.message;
        console.error("Błąd Supabase:", error);
    } else {
        statusLabel.innerText = "Baza online (Healthy)";
        const tbody = document.querySelector('#tabela-graczy tbody');
        
        // Czyścimy tabelę przed załadowaniem nowych danych
        tbody.innerHTML = "";

        // Wstrzykujemy dane do tabeli
        data.forEach(gracz => {
            const row = `
                <tr>
                    <td>${gracz.id_gracz}</td>
                    <td><strong>${gracz.pseudonim}</strong></td>
                    <td>${gracz.kraj_pochodzenia || 'Brak danych'}</td>
                    <td>${gracz.ranking_punktowy || 0} pkt</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }
}

// 4. Funkcja dodająca nowego gracza
async function dodajGracza() {
    const idInput = document.getElementById('gracz_id').value;
    const nickInput = document.getElementById('gracz_nick').value;
    const krajInput = document.getElementById('gracz_kraj').value;
    const rankInput = document.getElementById('gracz_rank').value;

    // Walidacja pól
    if (!idInput || !nickInput) {
        alert("ID oraz Pseudonim są wymagane do rejestracji!");
        return;
    }

    const { error } = await mojeDane.from('gracze').insert([
        { 
            id_gracz: parseInt(idInput), 
            pseudonim: nickInput, 
            kraj_pochodzenia: krajInput, 
            ranking_punktowy: parseInt(rankInput) || 0 
        }
    ]);

    if (error) {
        alert("Błąd przy dodawaniu: " + error.message);
    } else {
        alert("Sukces! Gracz został zapisany w chmurze.");
        
        // Czyścimy pola formularza
        document.getElementById('gracz_id').value = "";
        document.getElementById('gracz_nick').value = "";
        document.getElementById('gracz_kraj').value = "";
        document.getElementById('gracz_rank').value = "";
        
        // Odświeżamy listę, aby zobaczyć nowego gracza
        pobierzGraczy();
    }
}

// 5. Podpięcie zdarzenia kliknięcia pod przycisk (z id 'btn-add')
// Upewnij się, że w HTML przycisk ma id="btn-add" lub używamy onclick w HTML
const submitBtn = document.getElementById('btn-add');
if (submitBtn) {
    submitBtn.addEventListener('click', dodajGracza);
}

// 6. Uruchomienie pobierania danych zaraz po załadowaniu strony
document.addEventListener('DOMContentLoaded', pobierzGraczy);
