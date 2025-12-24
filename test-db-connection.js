import fs from 'fs';
import YAML from 'yaml';
import pkg from 'pg';
const { Client } = pkg;

const cfg = YAML.parse(fs.readFileSync(new URL('./config.yml', import.meta.url), 'utf8'));
const db = cfg.db;

const client = new Client({
    host: db.host,
    port: db.port,
    user: db.username,
    password: db.password,
    database: db.database,
});
try {
    await client.connect();
    console.log('Connected to DB OK');
    const res = await client.query('SELECT now()');
    console.log(res.rows);
    await client.end();
} catch (err) {
    console.error('DB connection error:', err.message || err);
    process.exit(1);
}
