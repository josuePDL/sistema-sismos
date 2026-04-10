const SUPABASE_URL = 'https://bjpweoougxzlbnvxkmgk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcHdlb291Z3h6bGJudnhrbWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mjg2OTAsImV4cCI6MjA5MTQwNDY5MH0.dFuAXWK2H8loRs3Ormcphm1maGfbFm-hT_SkEaMyi1s';

const { createClient } = window.supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function enviarEstado(estado) {
    const inputNombre = document.getElementById('nombreEmpleado');
    const nombre = inputNombre.value.trim();
    const statusMsg = document.getElementById('statusMsg');

    // VALIDACIÓN OBLIGATORIA
    if (nombre === "" || nombre.length < 3) {
        statusMsg.innerHTML = `
            <div class="alert alert-warning border-0 shadow-sm">
                ⚠️ Por favor, ingresa tu nombre completo para reportar.
            </div>`;
        inputNombre.focus();
        return;
    }

    // Bloqueo de UI
    document.querySelectorAll('.btn-lg').forEach(btn => btn.disabled = true);
    statusMsg.innerHTML = `<div class="spinner-border text-danger" role="status"></div>`;

    try {
        // 1. Obtener última alerta
        const { data: alertData } = await _supabase
            .from('alerts')
            .select('id')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        // 2. Insertar reporte
        const { error } = await _supabase
            .from('safety_reports')
            .insert([{ 
                manual_name: nombre, 
                status: estado, 
                alert_id: alertData?.id || null 
            }]);

        if (error) throw error;

        // Éxito
        statusMsg.innerHTML = `
            <div class="alert alert-success border-0 shadow-sm">
                ✅ ¡Gracias ${nombre}! Reporte enviado.
            </div>`;
        inputNombre.disabled = true;

    } catch (err) {
        statusMsg.innerHTML = `<div class="alert alert-danger">Error: No se pudo enviar el reporte.</div>`;
        document.querySelectorAll('.btn-lg').forEach(btn => btn.disabled = false);
    }
}