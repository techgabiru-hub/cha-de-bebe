// src/app/actions.ts
'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';

// Atualizamos a tabela para ter quantidade
export async function createTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS gifts (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      icon VARCHAR(50) NOT NULL,
      max_quantity INTEGER DEFAULT 1,
      used_quantity INTEGER DEFAULT 0
    );
  `;
}

export async function getGifts() {
  try {
    // Ordena para que os esgotados fiquem por último
    const { rows } = await sql`
      SELECT * FROM gifts 
      ORDER BY (used_quantity >= max_quantity) ASC, id ASC
    `;
    return rows;
  } catch (error) {
    await createTable();
    return [];
  }
}

export async function addGift(formData: FormData) {
  const name = formData.get('name') as string;
  const price = formData.get('price') as string;
  const icon = formData.get('icon') as string || '🎁';
  const max_quantity = formData.get('max_quantity') as string || '1';

  await sql`
    INSERT INTO gifts (name, price, icon, max_quantity, used_quantity)
    VALUES (${name}, ${price}, ${icon}, ${max_quantity}, 0)
  `;
  revalidatePath('/');
}

export async function deleteGift(id: number) {
  await sql`DELETE FROM gifts WHERE id = ${id}`;
  revalidatePath('/');
}

// NOVA FUNÇÃO: Marca que +1 item foi comprado
export async function markGiftAsTaken(id: number) {
  await sql`
    UPDATE gifts 
    SET used_quantity = used_quantity + 1 
    WHERE id = ${id} AND used_quantity < max_quantity
  `;
  revalidatePath('/');
}