const SUPABASE_URL = 'https://bjpweoougxzlbnvxkmgk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcHdlb291Z3h6bGJudnhrbWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mjg2OTAsImV4cCI6MjA5MTQwNDY5MH0.dFuAXWK2H8loRs3Ormcphm1maGfbFm-hT_SkEaMyi1s';

const { createClient } = window.supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 1. Verificar si el usuario está logueado
async function checkSession() {
    const { data: { user } } = await _supabase.auth.getUser();
    if (!user) {
        window.location.href = 'index.html';
    } else {
        loadReports();
    }
}

// 2. Cargar reportes (Incluye manual_name)
async function loadReports() {
    const { data, error } = await _supabase
        .from('safety_reports')
        .select('*')
        .order('reported_at', { ascending: false });

    if (!error) renderTable(data);
}

// 3. Dibujar la tabla
function renderTable(reports) {
    const table = document.getElementById('reportsTable');
    let bien = 0, mal = 0, ayuda = 0;
    
    table.innerHTML = reports.map(r => {
        if(r.status === 'bien') bien++;
        if(r.status === 'mal') mal++;
        if(r.status === 'ayuda') ayuda++;

        const badge = r.status === 'bien' ? 'bg-success' : (r.status === 'mal' ? 'bg-warning text-dark' : 'bg-danger');
        
        // MOSTRAR NOMBRE MANUAL (Pedro) O FALLBACK A PERFIL
        const nombre = r.manual_name || "Anónimo";

        return `
        <tr>
            <td class="fw-bold">${nombre}</td>
            <td><span class="badge ${badge}">${r.status.toUpperCase()}</span></td>
            <td class="text-muted small">${new Date(r.reported_at).toLocaleString()}</td>
            <td class="text-end">
                <button onclick="eliminarReporte('${r.id}')" class="btn btn-sm btn-outline-danger border-0">Eliminar</button>
            </td>
        </tr>`;
    }).join('');

    document.getElementById('countBien').innerText = bien;
    document.getElementById('countMal').innerText = mal;
    document.getElementById('countAyuda').innerText = ayuda;
}

// 4. Lanzar Alerta y abrir Correo
document.getElementById('btnLaunch').addEventListener('click', async () => {
    const title = document.getElementById('alertTitle').value.trim();
    if (!title) return alert("Ingresa un título para la alerta");

    // Guardar alerta en Supabase
    const { data } = await _supabase.from('alerts').insert([{ title, is_active: true }]).select().single();

    // Configurar Mailto
    const destinatarios = "rorosco@grupoprinter.com, operadorcc3@grupoprinter.com";
    const asunto = encodeURIComponent("⚠️ ALERTA DE SISMO: " + title);
    const mensaje = encodeURIComponent(`Hola,\n\nSe ha activado una alerta: ${title}.\n\nPor favor reporta tu estado en este link:\nhttps://tu-sitio-web.com/reportar.html`);

    window.location.href = `mailto:${destinatarios}?subject=${asunto}&body=${mensaje}`;
    
    document.getElementById('alertTitle').value = "";
    alert("Alerta creada. Se abrirá tu correo para enviar la notificación.");
});

// 5. Eliminar reporte individual
window.eliminarReporte = async (id) => {
    if (confirm("¿Borrar este reporte?")) {
        await _supabase.from('safety_reports').delete().eq('id', id);
        loadReports();
    }
};

// 6. Limpiar todo
document.getElementById('btnClearAll').addEventListener('click', async () => {
    if (confirm("¿BORRAR TODOS LOS REPORTES?")) {
        await _supabase.from('safety_reports').delete().neq('status', 'none');
        loadReports();
    }
});

// 7. Realtime: Actualizar si hay cambios
_supabase.channel('custom-all-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'safety_reports' }, () => loadReports())
    .subscribe();

// 8. Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
    await _supabase.auth.signOut();
    window.location.href = 'index.html';
});

checkSession();