import postgres from 'postgres';
const connectionString = '' + process.env.DB_URL;
const sql = postgres(connectionString);
export default sql;
