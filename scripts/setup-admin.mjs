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

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@novaxclean.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminNovax2026!';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Administrador Novax';

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function main() {
  console.log('Configurando cuenta administrador...\n');

  // 1. Intentar login (cuenta ya existe)
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  let userId = loginData?.user?.id;

  if (loginError) {
    console.log('Login falló:', loginError.message);
    console.log('Intentando registro...\n');

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      options: { data: { name: ADMIN_NAME } },
    });

    if (signUpError) {
      console.error('Registro falló:', signUpError.message);
      process.exit(1);
    }

    userId = signUpData?.user?.id;
    console.log('Registro OK. ID:', userId);

    if (!signUpData.session) {
      console.log('\n⚠ Confirmación de email requerida. Revisa el correo o desactívala en Supabase Dashboard → Authentication → Providers → Email.');
      console.log('Luego ejecuta este script de nuevo para promover el rol a Admin.\n');
    }
  } else {
    console.log('Login OK. ID:', userId);
  }

  if (!userId) {
    console.error('No se obtuvo userId.');
    process.exit(1);
  }

  // 2. Leer perfil actual
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, email, role, name')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.log('\nPerfil no accesible:', profileError.message);
    console.log('Puede que el trigger handle_new_user no esté aplicado o falte confirmar email.');
    process.exit(1);
  }

  console.log('Perfil actual:', profile);

  // 3. Promover a Admin si hace falta
  if (profile.role === 'Admin') {
    console.log('\n✓ La cuenta ya es Admin.');
  } else {
    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update({ role: 'Admin' })
      .eq('id', userId)
      .select('id, email, role')
      .single();

    if (updateError) {
      console.error('\nNo se pudo promover a Admin:', updateError.message);
      console.log('\nEjecuta manualmente en Supabase SQL Editor:');
      console.log(`UPDATE public.users SET role = 'Admin' WHERE email = '${ADMIN_EMAIL}';`);
      process.exit(1);
    }

    console.log('\n✓ Rol actualizado:', updated);
  }

  console.log('\n--- Credenciales de acceso ---');
  console.log('Email:   ', ADMIN_EMAIL);
  console.log('Password:', ADMIN_PASSWORD);
  console.log('URL:      http://localhost:5173/auth → login → /admin');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
