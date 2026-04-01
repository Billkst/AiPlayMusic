#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  const sql = fs.readFileSync(
    path.join(__dirname, 'supabase/create-user-tables.sql'),
    'utf8'
  );

  console.log('执行 SQL...');
  
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.error('错误:', error);
    process.exit(1);
  }
  
  console.log('✅ 数据库表创建成功');
}

createTables();
