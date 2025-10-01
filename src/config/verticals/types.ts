/**
 * ARCHIVO: types.ts
 * PROPÓSITO: Definiciones TypeScript para sistema de verticales multi-industria
 * ESTADO: development
 * DEPENDENCIAS: Ninguna
 * OUTPUTS: Interfaces y tipos para configuración vertical
 * ACTUALIZADO: 2025-10-01
 */

export interface VerticalModules {
  visible: string[];
  hidden: string[];
}

export interface VerticalLabels {
  [key: string]: string;
}

export interface VerticalNavigation {
  mainMenu: Array<{
    key: string;
    label: string;
    icon: string;
    href?: string;
  }>;
}

export interface VerticalTheme {
  primary: string;
  accent: string;
  background?: string;
}

export interface VerticalConfig {
  id: string;
  name: string;
  description: string;
  modules: VerticalModules;
  labels: VerticalLabels;
  navigation: VerticalNavigation;
  theme: VerticalTheme;
}

export type VerticalType = 'comunidades' | 'oficinas' | 'despachos' | 'educacion';

export interface UserOrganization {
  id: string;
  name: string;
  vertical_type: VerticalType;
  vertical_config: Partial<VerticalConfig>;
}