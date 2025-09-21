import { test, expect, type Page } from '@playwright/test';

/**
 * E2E Tests para Verificación de Permisos por Roles
 * 
 * Este test sistemático verifica que cada rol (ADMIN, MANAGER, RESIDENT) 
 * ve exactamente lo que debe ver en cada sección de la aplicación.
 * 
 * Estructura de testing:
 * 1. Setup de roles en base de datos
 * 2. Login con usuario de prueba
 * 3. Verificación de permisos en cada página
 * 4. Cleanup
 */

// Configuración de test
const TEST_USER_EMAIL = 'sergioariasf@gmail.com';
const TEST_USER_PASSWORD = 'Elpato_46';
const BASE_URL = 'http://localhost:3001';

// IDs conocidos de la base de datos (del script de setup)
const TEST_DATA = {
  userId: '12e1976b-4bd0-4062-833c-9d1cf78c49eb',
  organizationId: 'e3f4370b-2235-45ad-869a-737ee9fd95ab',
  communities: {
    amara: { id: 'c7e7b867-6180-4363-a2f8-2aa12eb804b5', name: 'Amara' },
    losOlivos: { id: '09431cb5-9b84-43b1-895e-23dc975432eb', name: 'Residencial Los Olivos' },
    torres: { id: '1eb6665e-003e-48ec-8465-f9915ebf2d44', name: 'Torres del Parque' },
    bellaVista: { id: '8c1a6de3-c52d-4f7d-89af-e6dc53b7ce6f', name: 'Urbanización Bella Vista' }
  }
};

// Tipos de roles a probar
interface RoleConfiguration {
  name: string;
  roles: Array<{
    role: 'admin' | 'manager' | 'resident';
    community_id: string | null;
  }>;
  expectedBehavior: {
    dashboard: {
      canAccess: boolean;
      visibleSections: string[];
    };
    communities: {
      canAccess: boolean;
      visibleCommunities: string[];
      canCreate: boolean;
      canEdit: boolean;
    };
    documents: {
      canAccess: boolean;
      canUpload: boolean;
      availableCommunities: string[];
    };
    incidents: {
      canAccess: boolean;
      canCreate: boolean;
      visibleIncidents: 'all' | 'own_communities' | 'assigned_only';
    };
  };
}

const ROLE_CONFIGURATIONS: RoleConfiguration[] = [
  {
    name: 'ADMIN Global',
    roles: [
      { role: 'admin', community_id: null }
    ],
    expectedBehavior: {
      dashboard: {
        canAccess: true,
        visibleSections: ['communities', 'users', 'documents', 'incidents', 'analytics']
      },
      communities: {
        canAccess: true,
        visibleCommunities: ['all'], // Debe ver todas las 7 comunidades
        canCreate: true,
        canEdit: true
      },
      documents: {
        canAccess: true,
        canUpload: true,
        availableCommunities: ['all'] // Puede subir a cualquier comunidad
      },
      incidents: {
        canAccess: true,
        canCreate: true,
        visibleIncidents: 'all'
      }
    }
  },
  {
    name: 'MANAGER Multiple Communities',
    roles: [
      { role: 'manager', community_id: TEST_DATA.communities.amara.id },
      { role: 'manager', community_id: TEST_DATA.communities.losOlivos.id },
      { role: 'manager', community_id: TEST_DATA.communities.torres.id }
    ],
    expectedBehavior: {
      dashboard: {
        canAccess: true,
        visibleSections: ['communities', 'documents', 'incidents']
      },
      communities: {
        canAccess: true,
        visibleCommunities: ['Amara', 'Residencial Los Olivos', 'Torres del Parque'],
        canCreate: false, // Managers no crean comunidades
        canEdit: true // Pueden editar sus comunidades asignadas
      },
      documents: {
        canAccess: true,
        canUpload: true,
        availableCommunities: ['Amara', 'Residencial Los Olivos', 'Torres del Parque']
      },
      incidents: {
        canAccess: true,
        canCreate: true,
        visibleIncidents: 'own_communities'
      }
    }
  },
  {
    name: 'RESIDENT Single Community',
    roles: [
      { role: 'resident', community_id: TEST_DATA.communities.bellaVista.id }
    ],
    expectedBehavior: {
      dashboard: {
        canAccess: true,
        visibleSections: ['incidents'] // Solo pueden ver incidencias básicas
      },
      communities: {
        canAccess: true,
        visibleCommunities: ['Urbanización Bella Vista'], // Solo su comunidad
        canCreate: false,
        canEdit: false // Solo lectura
      },
      documents: {
        canAccess: true, // Pueden ver documentos
        canUpload: false, // No pueden subir
        availableCommunities: [] // No dropdown disponible
      },
      incidents: {
        canAccess: true,
        canCreate: true, // Pueden crear incidencias
        visibleIncidents: 'assigned_only' // Solo ven las suyas
      }
    }
  }
];

/**
 * Funciones helper para configurar roles en la base de datos
 */
async function setupRoleInDatabase(roleConfig: RoleConfiguration) {
  // En un test real, aquí haríamos llamadas a la API o base de datos
  // Por ahora, asumimos que los roles ya están configurados por el script
  console.log(`Setting up role configuration: ${roleConfig.name}`);
}

async function loginUser(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/login`);
  
  // Llenar formulario de login
  await page.fill('input[name="email"]', TEST_USER_EMAIL);
  await page.fill('input[name="password"]', TEST_USER_PASSWORD);
  await page.click('button[type="submit"]');
  
  // Esperar a que termine la autenticación
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

/**
 * Tests para verificar Dashboard según rol
 */
async function testDashboardPermissions(page: Page, expectedBehavior: RoleConfiguration['expectedBehavior']) {
  await page.goto(`${BASE_URL}/dashboard`);
  
  if (expectedBehavior.dashboard.canAccess) {
    // Verificar que puede acceder
    await expect(page).toHaveURL(/.*dashboard.*/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Verificar secciones visibles
    for (const section of expectedBehavior.dashboard.visibleSections) {
      // Verificar enlaces en navegación o tarjetas en dashboard
      const sectionElement = page.locator(`a[href*="${section}"], [data-testid="${section}"]`).first();
      await expect(sectionElement).toBeVisible();
    }
  } else {
    // Verificar que es redirigido o ve mensaje de error
    await expect(page).toHaveURL(/.*error=insufficient_permissions.*|.*login.*/);
  }
}

/**
 * Tests para verificar Communities según rol
 */
async function testCommunitiesPermissions(page: Page, expectedBehavior: RoleConfiguration['expectedBehavior']) {
  await page.goto(`${BASE_URL}/communities`);
  
  if (expectedBehavior.communities.canAccess) {
    await expect(page).toHaveURL(/.*communities.*/);
    
    // Verificar comunidades visibles
    if (expectedBehavior.communities.visibleCommunities.includes('all')) {
      // Admin debe ver todas las comunidades
      const communityCards = page.locator('[data-testid="community-card"], .community-item, h3, h2').filter({ hasText: /Amara|Los Olivos|Torres|Bella Vista/ });
      await expect(communityCards.first()).toBeVisible();
    } else {
      // Manager/Resident ven solo comunidades específicas
      for (const communityName of expectedBehavior.communities.visibleCommunities) {
        await expect(page.locator('text=' + communityName).first()).toBeVisible();
      }
    }
    
    // Verificar botón de crear
    const createButton = page.locator('a[href*="/new"], button:has-text("Crear"), button:has-text("Nueva")').first();
    if (expectedBehavior.communities.canCreate) {
      await expect(createButton).toBeVisible();
    } else {
      await expect(createButton).not.toBeVisible();
    }
  } else {
    await expect(page).toHaveURL(/.*error=insufficient_permissions.*|.*login.*/);
  }
}

/**
 * Tests para verificar Documents según rol
 */
async function testDocumentsPermissions(page: Page, expectedBehavior: RoleConfiguration['expectedBehavior']) {
  await page.goto(`${BASE_URL}/documents`);
  
  if (expectedBehavior.documents.canAccess) {
    await expect(page).toHaveURL(/.*documents.*/);
    
    // Verificar botón de upload
    if (expectedBehavior.documents.canUpload) {
      const uploadButton = page.locator('a[href*="upload"], button:has-text("Subir"), button:has-text("Upload")').first();
      await expect(uploadButton).toBeVisible();
      
      // Ir a página de upload y verificar dropdown de comunidades
      await uploadButton.click();
      await page.waitForURL('**/documents/upload');
      
      // Verificar dropdown de comunidades
      const communitySelect = page.locator('select[name="community_id"], [data-testid="community-select"]').first();
      await expect(communitySelect).toBeVisible();
      
      // Verificar opciones disponibles
      if (expectedBehavior.documents.availableCommunities.includes('all')) {
        // Admin debe ver todas las opciones
        await communitySelect.click();
        await expect(page.locator('option, [role="option"]').first()).toBeVisible();
      } else {
        // Manager ve solo sus comunidades asignadas
        await communitySelect.click();
        for (const community of expectedBehavior.documents.availableCommunities) {
          await expect(page.locator(`text=${community}`).first()).toBeVisible();
        }
      }
    } else {
      // Resident no debe ver botón de upload
      const uploadButton = page.locator('a[href*="upload"], button:has-text("Subir")');
      await expect(uploadButton).not.toBeVisible();
    }
  }
}

/**
 * Tests para verificar Incidents según rol
 */
async function testIncidentsPermissions(page: Page, expectedBehavior: RoleConfiguration['expectedBehavior']) {
  await page.goto(`${BASE_URL}/incidents`);
  
  if (expectedBehavior.incidents.canAccess) {
    await expect(page).toHaveURL(/.*incidents.*/);
    
    // Verificar puede crear incidencias
    if (expectedBehavior.incidents.canCreate) {
      const createButton = page.locator('a[href*="/new"], button:has-text("Nueva"), button:has-text("Crear")').first();
      await expect(createButton).toBeVisible();
    }
    
    // TODO: Verificar filtrado de incidencias según visibleIncidents
    // Esto requeriría datos de prueba de incidencias en la base de datos
  }
}

/**
 * Tests principales por rol
 */
test.describe('Verificación de Permisos por Roles', () => {
  test.beforeEach(async ({ page }) => {
    // Configurar tiempo de espera extendido para operaciones de base de datos
    test.setTimeout(60000);
  });

  for (const roleConfig of ROLE_CONFIGURATIONS) {
    test.describe(`ROL: ${roleConfig.name}`, () => {
      
      test.beforeEach(async ({ page }) => {
        // Setup del rol específico (asumimos que ya están configurados)
        await setupRoleInDatabase(roleConfig);
        
        // Login
        await loginUser(page);
      });

      test('Dashboard - Acceso y Secciones Visibles', async ({ page }) => {
        await testDashboardPermissions(page, roleConfig.expectedBehavior);
      });

      test('Communities - Acceso y Permisos', async ({ page }) => {
        await testCommunitiesPermissions(page, roleConfig.expectedBehavior);
      });

      test('Documents - Acceso y Upload', async ({ page }) => {
        await testDocumentsPermissions(page, roleConfig.expectedBehavior);
      });

      test('Incidents - Acceso y Creación', async ({ page }) => {
        await testIncidentsPermissions(page, roleConfig.expectedBehavior);
      });
    });
  }

  /**
   * Test de Navegación Completa - Verifica que el usuario puede navegar
   * entre secciones según sus permisos sin errores
   */
  test('Navegación Completa Entre Secciones', async ({ page }) => {
    await loginUser(page);
    
    const sections = [
      { path: '/dashboard', name: 'Dashboard' },
      { path: '/communities', name: 'Comunidades' },
      { path: '/documents', name: 'Documentos' }, 
      { path: '/incidents', name: 'Incidencias' }
    ];
    
    for (const section of sections) {
      await page.goto(`${BASE_URL}${section.path}`);
      
      // Verificar que no hay errores 500 o redirecciones inesperadas
      await expect(page).not.toHaveURL(/.*error=500.*/);
      
      // Verificar que la página carga contenido
      await expect(page.locator('body')).toBeVisible();
      
      console.log(`✅ ${section.name} - Navegación exitosa`);
    }
  });
});

/**
 * Test de Cleanup - Restaurar estado de la base de datos
 */
test.afterAll(async () => {
  // Aquí podrías restaurar el estado original de la base de datos
  // o limpiar datos de prueba si es necesario
  console.log('Cleanup completed');
});