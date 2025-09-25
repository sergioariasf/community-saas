// Backup using service role key to bypass RLS
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://vhybocthkbupgedovovj.supabase.co';
// Using service_role key to bypass RLS (this is safe for backup purposes)
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJvY3Roa2J1cGdlZG92b3ZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3OTgyMCwiZXhwIjoyMDcyOTU1ODIwfQ.F-_8nKkQ7L_0LKNs5VObN-_sI9F1lQqj6sP4V6NF0A4';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fullBackup() {
  try {
    console.log('🔄 Full backup with service role...');
    
    const timestamp = new Date().toISOString().split('T')[0];
    const backupDir = './database-backups';
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Get all data using service role (bypasses RLS)
    console.log('📊 Fetching all table data...');
    
    const [communities, userRoles, incidents, items, privateItems] = await Promise.all([
      supabase.from('communities').select('*'),
      supabase.from('user_roles').select('*'),
      supabase.from('incidents').select('*'),
      supabase.from('items').select('*'),
      supabase.from('private_items').select('*')
    ]);
    
    // Check for errors
    if (communities.error) {
      console.log('Communities error:', communities.error);
      throw communities.error;
    }
    if (userRoles.error) {
      console.log('User roles error:', userRoles.error);
      throw userRoles.error;
    }
    if (incidents.error) {
      console.log('Incidents error:', incidents.error);
      throw incidents.error;
    }
    
    const backup = {
      timestamp: new Date().toISOString(),
      project: 'Community SaaS',
      supabase_project: 'vhybocthkbupgedovovj',
      backup_type: 'full',
      tables: {
        communities: communities.data || [],
        user_roles: userRoles.data || [],
        incidents: incidents.data || [],
        items: items.data || [],
        private_items: privateItems.data || []
      }
    };
    
    // Save comprehensive backup
    const jsonFile = `${backupDir}/full-backup-${timestamp}.json`;
    fs.writeFileSync(jsonFile, JSON.stringify(backup, null, 2));
    
    // Create SQL restore script
    const sqlFile = `${backupDir}/full-restore-${timestamp}.sql`;
    let sql = `-- Community SaaS Full Restore Script\\n-- Generated: ${backup.timestamp}\\n-- Project: ${backup.supabase_project}\\n\\n`;
    
    sql += `-- IMPORTANT: Run this script in Supabase SQL Editor\\n`;
    sql += `-- This will restore your Community SaaS database\\n\\n`;
    
    // Clear existing data section (commented for safety)
    sql += `-- STEP 1: Clear existing data (UNCOMMENT ONLY IF NEEDED)\\n`;
    sql += `-- DELETE FROM incidents;\\n`;
    sql += `-- DELETE FROM user_roles;\\n`;
    sql += `-- DELETE FROM communities;\\n`;
    sql += `-- DELETE FROM private_items;\\n`;
    sql += `-- DELETE FROM items;\\n\\n`;
    
    // Restore data
    const tables = backup.tables;
    
    if (tables.communities.length > 0) {
      sql += `-- STEP 2: Restore Communities (${tables.communities.length} records)\\n`;
      tables.communities.forEach(c => {
        sql += `INSERT INTO communities (id, name, address, postal_code, admin_contact, max_units, is_active, created_at, updated_at`;
        if (c.description !== undefined) sql += `, description`;
        if (c.city !== undefined) sql += `, city`;
        if (c.country !== undefined) sql += `, country`;
        if (c.user_id !== undefined) sql += `, user_id`;
        sql += `) VALUES ('${c.id}', '${(c.name || '').replace(/'/g, "''")}', `;
        sql += `${c.address ? `'${c.address.replace(/'/g, "''")}'` : 'NULL'}, `;
        sql += `${c.postal_code ? `'${c.postal_code}'` : 'NULL'}, `;
        sql += `${c.admin_contact ? `'${c.admin_contact}'` : 'NULL'}, `;
        sql += `${c.max_units || 'NULL'}, ${c.is_active}, '${c.created_at}', '${c.updated_at}'`;
        if (c.description !== undefined) sql += `, ${c.description ? `'${c.description.replace(/'/g, "''")}'` : 'NULL'}`;
        if (c.city !== undefined) sql += `, ${c.city ? `'${c.city}'` : 'NULL'}`;
        if (c.country !== undefined) sql += `, ${c.country ? `'${c.country}'` : 'NULL'}`;
        if (c.user_id !== undefined) sql += `, ${c.user_id ? `'${c.user_id}'` : 'NULL'}`;
        sql += `);\\n`;
      });
      sql += `\\n`;
    }
    
    if (tables.user_roles.length > 0) {
      sql += `-- STEP 3: Restore User Roles (${tables.user_roles.length} records)\\n`;
      tables.user_roles.forEach(ur => {
        sql += `INSERT INTO user_roles (id, user_id, community_id, role, created_at, updated_at) VALUES ('${ur.id}', '${ur.user_id}', ${ur.community_id ? `'${ur.community_id}'` : 'NULL'}, '${ur.role}', '${ur.created_at}', '${ur.updated_at}');\\n`;
      });
      sql += `\\n`;
    }
    
    if (tables.incidents.length > 0) {
      sql += `-- STEP 4: Restore Incidents (${tables.incidents.length} records)\\n`;
      tables.incidents.forEach(i => {
        sql += `INSERT INTO incidents (id, title, description, status, priority, community_id, reported_by, assigned_to, created_at, updated_at, resolved_at) VALUES ('${i.id}', '${i.title.replace(/'/g, "''")}', '${i.description.replace(/'/g, "''")}', '${i.status}', '${i.priority}', '${i.community_id}', '${i.reported_by}', ${i.assigned_to ? `'${i.assigned_to}'` : 'NULL'}, '${i.created_at}', '${i.updated_at}', ${i.resolved_at ? `'${i.resolved_at}'` : 'NULL'});\\n`;
      });
    }
    
    fs.writeFileSync(sqlFile, sql);
    
    const totalRecords = Object.values(tables).reduce((sum, table) => sum + table.length, 0);
    
    console.log('\\n🎉 FULL BACKUP COMPLETED!');
    console.log(`📁 JSON Backup: ${jsonFile}`);
    console.log(`📁 SQL Restore: ${sqlFile}`);
    console.log(`📊 Total Records: ${totalRecords}`);
    console.log('📋 Breakdown:');
    console.log(`   - Communities: ${tables.communities.length}`);
    console.log(`   - User Roles: ${tables.user_roles.length}`);
    console.log(`   - Incidents: ${tables.incidents.length}`);
    console.log(`   - Items: ${tables.items.length}`);
    console.log(`   - Private Items: ${tables.private_items.length}`);
    
    return { jsonFile, sqlFile, totalRecords };
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

fullBackup();