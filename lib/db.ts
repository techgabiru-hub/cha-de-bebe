// src/lib/db.ts
import Database from 'better-sqlite3';

const db = new Database('chadebebe.db');

// Inicializa o banco de dados com valores padrão se não existirem
export function initDB() {
  // Tabela de Configurações
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  // Tabela de Presentes
  db.exec(`
    CREATE TABLE IF NOT EXISTS gifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      price REAL,
      icon TEXT
    )
  `);

  // Insere dados padrão se a tabela settings estiver vazia
  const check = db.prepare('SELECT count(*) as count FROM settings').get() as any;
  if (check.count === 0) {
    const insert = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
    insert.run('babyName', 'Nome do Bebê');
    insert.run('parentsNames', 'Papai e Mamãe');
    insert.run('eventDate', '15 de Outubro de 2024');
    insert.run('eventLocation', 'Rua das Flores, 123 - Salão de Festas');
    insert.run('pixKey', '000.000.000-00');
    insert.run('whatsappNumber', '5511999999999');
    insert.run('adminPassword', 'admin123'); // Senha padrão
  }

  // Insere presentes padrão se a tabela gifts estiver vazia
  const checkGifts = db.prepare('SELECT count(*) as count FROM gifts').get() as any;
  if (checkGifts.count === 0) {
    const insertGift = db.prepare('INSERT INTO gifts (name, price, icon) VALUES (?, ?, ?)');
    insertGift.run('Pacotinho de Amor (Fraldas P)', 50, '👶');
    insertGift.run('Soninho Tranquilo (Fraldas M)', 60, '🌙');
    insertGift.run('Passos Gigantes (Fraldas G)', 70, '👣');
    insertGift.run('Banho de Espuma (Kit Higiene)', 45, 'duck');
  }
}

export default db;