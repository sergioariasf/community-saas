// Backup script using existing Supabase client
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://vhybocthkbupgedovovj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJvY3Roa2J1cGdlZG92b3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNzk4MjAsImV4cCI6MjA3Mjk1NTgyMH0.vbsKRZEv8woCY-rGhK1zRtty7iGkrMj35P1kk8xuGu8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function backupAllData() {
  try {
    console.log('🔄 Starting Community SaaS data backup...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = './database-backups';
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const backup = {
      timestamp: new Date().toISOString(),
      project: 'Community SaaS',
      supabase_project: 'vhybocthkbupgedovovj',
      data: {}
    };
    
    // Backup communities
    console.log('📋 Backing up communities...');
    const { data: communities, error: commError } = await supabase
      .from('communities')
      .select('*');
    
    if (commError) throw commError;
    backup.data.communities = communities;
    console.log(`✅ Communities: ${communities.length} records`);
    
    // Backup user_roles  
    console.log('👥 Backing up user roles...');
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');
    
    if (rolesError) throw rolesError;
    backup.data.user_roles = userRoles;
    console.log(`✅ User roles: ${userRoles.length} records`);
    
    // Backup incidents
    console.log('🚨 Backing up incidents...');
    const { data: incidents, error: incError } = await supabase
      .from('incidents')
      .select('*');
    
    if (incError) throw incError;
    backup.data.incidents = incidents;
    console.log(`✅ Incidents: ${incidents.length} records`);
    
    // Backup items (legacy NextBase data)
    console.log('📦 Backing up items...');
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('*');
    
    if (itemsError) throw itemsError;
    backup.data.items = items;
    console.log(`✅ Items: ${items.length} records`);
    
    // Backup private_items
    console.log('🔐 Backing up private items...');
    const { data: privateItems, error: privError } = await supabase
      .from('private_items')
      .select('*');
    
    if (privError) throw privError;
    backup.data.private_items = privateItems;
    console.log(`✅ Private items: ${privateItems.length} records`);
    
    // Save backup file
    const backupFile = `${backupDir}/community-saas-data-${timestamp}.json`;
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    
    // Create restoration script
    const restoreScript = `
-- Community SaaS Data Restoration Script
-- Generated: ${backup.timestamp}
-- Records: ${Object.values(backup.data).reduce((sum, table) => sum + table.length, 0)} total

-- Clear existing data (CAREFUL!)
-- DELETE FROM incidents;
-- DELETE FROM user_roles; 
-- DELETE FROM communities;
-- DELETE FROM private_items;
-- DELETE FROM items;

-- Restore communities
${communities.map(c => 
  `INSERT INTO communities (id, name, address, postal_code, admin_contact, max_units, is_active, created_at, updated_at, description, city, country, user_id) VALUES (
    '${c.id}', 
    '${c.name?.replace(/'/g, "''")}', 
    ${c.address ? `'${c.address.replace(/'/g, "''")}'` : 'NULL'}, 
    ${c.postal_code ? `'${c.postal_code}'` : 'NULL'}, 
    ${c.admin_contact ? `'${c.admin_contact}'` : 'NULL'}, 
    ${c.max_units || 'NULL'}, 
    ${c.is_active}, 
    '${c.created_at}', 
    '${c.updated_at}',
    ${c.description ? `'${c.description.replace(/'/g, "''")}'` : 'NULL'},
    ${c.city ? `'${c.city}'` : 'NULL'},
    ${c.country ? `'${c.country}'` : 'NULL'},
    ${c.user_id ? `'${c.user_id}'` : 'NULL'}
  );`
).join('\\n')}

-- Restore user_roles  
${userRoles.map(ur => 
  `INSERT INTO user_roles (id, user_id, community_id, role, created_at, updated_at) VALUES (
    '${ur.id}', 
    '${ur.user_id}', 
    ${ur.community_id ? `'${ur.community_id}'` : 'NULL'}, 
    '${ur.role}', 
    '${ur.created_at}', 
    '${ur.updated_at}'
  );`
).join('\\n')}

-- Restore incidents
${incidents.map(i => 
  `INSERT INTO incidents (id, title, description, status, priority, community_id, reported_by, assigned_to, created_at, updated_at, resolved_at) VALUES (
    '${i.id}', 
    '${i.title.replace(/'/g, "''")}', 
    '${i.description.replace(/'/g, "''")}', 
    '${i.status}', 
    '${i.priority}', 
    '${i.community_id}', 
    '${i.reported_by}', 
    ${i.assigned_to ? `'${i.assigned_to}'` : 'NULL'}, 
    '${i.created_at}', 
    '${i.updated_at}', 
    ${i.resolved_at ? `'${i.resolved_at}'` : 'NULL'}
  );`
).join('\\n')}
`;
    
    const restoreFile = `${backupDir}/restore-community-saas-${timestamp}.sql`;
    fs.writeFileSync(restoreFile, restoreScript);
    
    // Summary
    const summary = {
      backup_completed: new Date().toISOString(),
      files_created: [backupFile, restoreFile],
      total_records: Object.values(backup.data).reduce((sum, table) => sum + table.length, 0),
      tables: {
        communities: communities.length,
        user_roles: userRoles.length,
        incidents: incidents.length,
        items: items.length,
        private_items: privateItems.length
      }
    };
    
    console.log('\\n🎉 BACKUP COMPLETED SUCCESSFULLY!');
    console.log('📁 Files created:');
    console.log(`   - Data backup: ${backupFile}`);
    console.log(`   - Restore script: ${restoreFile}`);
    console.log(`📊 Total records: ${summary.total_records}`);
    
    // Save summary
    fs.writeFileSync(`${backupDir}/backup-summary-${timestamp}.json`, JSON.stringify(summary, null, 2));
    
    return summary;
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

backupAllData();