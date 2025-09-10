// Simple backup script using CommonJS
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://vhybocthkbupgedovovj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJvY3Roa2J1cGdlZG92b3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNzk4MjAsImV4cCI6MjA3Mjk1NTgyMH0.vbsKRZEv8woCY-rGhK1zRtty7iGkrMj35P1kk8xuGu8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function quickBackup() {
  try {
    console.log('🔄 Quick backup of Community SaaS data...');
    
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const backupDir = './database-backups';
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Get all critical data
    const [communities, userRoles, incidents] = await Promise.all([
      supabase.from('communities').select('*'),
      supabase.from('user_roles').select('*'),
      supabase.from('incidents').select('*')
    ]);
    
    if (communities.error) throw communities.error;
    if (userRoles.error) throw userRoles.error; 
    if (incidents.error) throw incidents.error;
    
    const backup = {
      timestamp: new Date().toISOString(),
      project: 'Community SaaS',
      communities: communities.data || [],
      user_roles: userRoles.data || [],
      incidents: incidents.data || []
    };
    
    // Save JSON backup
    const jsonFile = `${backupDir}/backup-${timestamp}.json`;
    fs.writeFileSync(jsonFile, JSON.stringify(backup, null, 2));
    
    // Create simple restore script
    const sqlFile = `${backupDir}/restore-${timestamp}.sql`;
    let sql = `-- Community SaaS Restore Script - ${backup.timestamp}\n\n`;
    
    // Communities
    if (backup.communities.length > 0) {
      sql += `-- Communities (${backup.communities.length} records)\n`;
      backup.communities.forEach(c => {
        sql += `INSERT INTO communities (id, name, address, postal_code, admin_contact, max_units, is_active, created_at, updated_at, description, city, country, user_id) VALUES ('${c.id}', '${(c.name || '').replace(/'/g, "''")}', ${c.address ? `'${c.address.replace(/'/g, "''")}'` : 'NULL'}, ${c.postal_code ? `'${c.postal_code}'` : 'NULL'}, ${c.admin_contact ? `'${c.admin_contact}'` : 'NULL'}, ${c.max_units || 'NULL'}, ${c.is_active}, '${c.created_at}', '${c.updated_at}', ${c.description ? `'${c.description.replace(/'/g, "''")}'` : 'NULL'}, ${c.city ? `'${c.city}'` : 'NULL'}, ${c.country ? `'${c.country}'` : 'NULL'}, ${c.user_id ? `'${c.user_id}'` : 'NULL'});\n`;
      });
      sql += '\n';
    }
    
    // User roles
    if (backup.user_roles.length > 0) {
      sql += `-- User Roles (${backup.user_roles.length} records)\n`;
      backup.user_roles.forEach(ur => {
        sql += `INSERT INTO user_roles (id, user_id, community_id, role, created_at, updated_at) VALUES ('${ur.id}', '${ur.user_id}', ${ur.community_id ? `'${ur.community_id}'` : 'NULL'}, '${ur.role}', '${ur.created_at}', '${ur.updated_at}');\n`;
      });
      sql += '\n';
    }
    
    // Incidents
    if (backup.incidents.length > 0) {
      sql += `-- Incidents (${backup.incidents.length} records)\n`;
      backup.incidents.forEach(i => {
        sql += `INSERT INTO incidents (id, title, description, status, priority, community_id, reported_by, assigned_to, created_at, updated_at, resolved_at) VALUES ('${i.id}', '${i.title.replace(/'/g, "''")}', '${i.description.replace(/'/g, "''")}', '${i.status}', '${i.priority}', '${i.community_id}', '${i.reported_by}', ${i.assigned_to ? `'${i.assigned_to}'` : 'NULL'}, '${i.created_at}', '${i.updated_at}', ${i.resolved_at ? `'${i.resolved_at}'` : 'NULL'});\n`;
      });
    }
    
    fs.writeFileSync(sqlFile, sql);
    
    const totalRecords = backup.communities.length + backup.user_roles.length + backup.incidents.length;
    
    console.log('✅ BACKUP COMPLETED!');
    console.log(`📁 JSON: ${jsonFile}`);
    console.log(`📁 SQL: ${sqlFile}`);
    console.log(`📊 Records: ${totalRecords} (${backup.communities.length} communities, ${backup.user_roles.length} roles, ${backup.incidents.length} incidents)`);
    
    return { jsonFile, sqlFile, totalRecords };
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

quickBackup();