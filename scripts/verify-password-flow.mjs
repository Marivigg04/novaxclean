import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env');
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    }),
);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

const results = [];

function log(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'OK' : 'FAIL'} | ${name}: ${detail}`);
}

async function main() {
  console.log('Verificando flujo de contraseña contra Supabase...\n');

  const { error: resetError } = await supabase.auth.resetPasswordForEmail('test@novaxclean.com', {
    redirectTo: 'http://localhost:5173/auth/restablecer',
  });
  log(
    'resetPasswordForEmail (API)',
    !resetError,
    resetError?.message || 'Solicitud aceptada por Supabase (correo enviado si el usuario existe)',
  );

  const { error: badLoginError } = await supabase.auth.signInWithPassword({
    email: 'no-existe@novaxclean.com',
    password: 'WrongPass123',
  });
  log(
    'signInWithPassword credenciales inválidas',
    Boolean(badLoginError),
    badLoginError?.message || 'Debería fallar',
  );

  const { data: usersTable, error: usersError } = await supabase.from('users').select('id, email, role').limit(3);
  log(
    'Tabla public.users accesible',
    !usersError,
    usersError?.message || `Filas visibles: ${usersTable?.length ?? 0}`,
  );

  console.log('\n--- Resumen ---');
  const passed = results.filter((r) => r.ok).length;
  console.log(`${passed}/${results.length} verificaciones pasaron`);
}

main().catch((error) => {
  console.error('Error ejecutando verificación:', error.message);
  process.exit(1);
});
