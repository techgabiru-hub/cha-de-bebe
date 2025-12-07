'use server';

import { sql } from '@/lib/db'; // Importando do arquivo isolado
import { revalidatePath } from 'next/cache';

// 1. CRIAÇÃO DAS TABELAS (Gifts e Settings)
export async function createTables() {
  // Tabela de Presentes (agora com is_locked)
  await sql`
    CREATE TABLE IF NOT EXISTS gifts (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      icon VARCHAR(50) NOT NULL,
      max_quantity INTEGER DEFAULT 1,
      used_quantity INTEGER DEFAULT 0,
      is_locked BOOLEAN DEFAULT FALSE
    );
  `;

  // Tabela de Configurações (Chave -> Valor)
  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key VARCHAR(50) PRIMARY KEY,
      value TEXT
    );
  `;
}

// --- FUNÇÕES DE CONFIGURAÇÃO ---

// Busca configurações (se não existir, retorna padrão)
export async function getSettings() {
  try {
    const { rows } = await sql`SELECT * FROM settings`;
    const settingsMap: any = {};
    rows.forEach(row => { settingsMap[row.key] = row.value; });
    return settingsMap;
  } catch (error) {
    await createTables();
    return {};
  }
}

// Salva as configurações
export async function updateSettings(formData: FormData) {
  const keys = ['babyName', 'parentsNames', 'eventDate', 'eventLocation', 'pixKey', 'whatsappNumber', 'googleFormLink'];
  
  for (const key of keys) {
    const value = formData.get(key) as string;
    // UPSERT: Atualiza se existe, Insere se não existe
    await sql`
      INSERT INTO settings (key, value) VALUES (${key}, ${value})
      ON CONFLICT (key) DO UPDATE SET value = ${value};
    `;
  }
  revalidatePath('/');
}

// --- FUNÇÕES DE PRESENTES ---

export async function getGifts() {
  try {
    const { rows } = await sql`
      SELECT * FROM gifts 
      ORDER BY is_locked ASC, (used_quantity >= max_quantity) ASC, id ASC
    `;
    return rows;
  } catch (error) {
    await createTables();
    return [];
  }
}

// Adicionar ou Editar Presente
export async function saveGift(formData: FormData) {
  const id = formData.get('id') as string; // Se tiver ID, é edição
  const name = formData.get('name') as string;
  const price = formData.get('price') as string;
  const icon = formData.get('icon') as string || '🎁';
  const max_quantity = formData.get('max_quantity') as string || '1';

  if (id) {
    // ATUALIZAR
    await sql`
      UPDATE gifts 
      SET name=${name}, price=${price}, icon=${icon}, max_quantity=${max_quantity}
      WHERE id=${id}
    `;
  } else {
    // CRIAR NOVO
    await sql`
      INSERT INTO gifts (name, price, icon, max_quantity, used_quantity, is_locked)
      VALUES (${name}, ${price}, ${icon}, ${max_quantity}, 0, FALSE)
    `;
  }
  revalidatePath('/');
}

export async function deleteGift(id: number) {
  await sql`DELETE FROM gifts WHERE id = ${id}`;
  revalidatePath('/');
}

// Travar/Destravar um presente manualmente
export async function toggleGiftLock(id: number, currentStatus: boolean) {
  await sql`UPDATE gifts SET is_locked = ${!currentStatus} WHERE id = ${id}`;
  revalidatePath('/');
}

export async function markGiftAsTaken(id: number) {
  await sql`
    UPDATE gifts 
    SET used_quantity = used_quantity + 1 
    WHERE id = ${id} AND used_quantity < max_quantity AND is_locked = FALSE
  `;
  revalidatePath('/');
}