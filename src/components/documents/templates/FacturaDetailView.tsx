/**
 * ARCHIVO: FacturaDetailView.tsx
 * PROPÓSITO: Plantilla específica para mostrar detalles de documentos tipo Factura Comercial
 * ESTADO: development
 * DEPENDENCIAS: @/components/ui/badge, @/components/ui/card, @/components/ui/separator, @/components/ui/Typography, lucide-react
 * OUTPUTS: Vista detallada optimizada para Factura Comercial
 * ACTUALIZADO: 2025-09-24
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { T } from '@/components/ui/Typography';
import { Calendar, Clock, CreditCard, Building2, User, List, FileText } from 'lucide-react';

// Tipos basados en la tabla extracted_invoices
export type ExtractedFactura = {
  id: string;
  document_id: string;
  organization_id: string;
  created_at: string;
  provider_name: string;
  client_name: string;
  amount: number;
  invoice_date: string;
  category: string | null;
  invoice_number: string | null;
  issue_date: string | null;
  due_date: string | null;
  subtotal: number | null;
  tax_amount: number | null;
  total_amount: number | null;
  currency: string | null;
  payment_method: string | null;
  vendor_address: string | null;
  vendor_tax_id: string | null;
  vendor_phone: string | null;
  vendor_email: string | null;
  client_address: string | null;
  client_tax_id: string | null;
  client_phone: string | null;
  client_email: string | null;
  products_summary: string | null;
  products_count: number | null;
  products: any[] | null;
  payment_terms: string | null;
  notes: string | null;
  bank_details: string | null;
};

export type FacturaMetadata = {
  provider_name?: string;
  client_name?: string;
  amount?: number;
  invoice_date?: string;
  category?: string;
  invoice_number?: string;
  issue_date?: string;
  due_date?: string;
  subtotal?: number;
  tax_amount?: number;
  total_amount?: number;
  currency?: string;
  payment_method?: string;
  vendor_address?: string;
  vendor_tax_id?: string;
  vendor_phone?: string;
  vendor_email?: string;
  client_address?: string;
  client_tax_id?: string;
  client_phone?: string;
  client_email?: string;
  products_summary?: string;
  products_count?: number;
  products?: any[];
  payment_terms?: string;
  notes?: string;
  bank_details?: string;
};

// Funciones de formateo
const formatDate = (date: string | null): string => {
  if (!date) return '❌ No especificada';
  try {
    return new Date(date).toLocaleDateString('es-ES');
  } catch {
    return date;
  }
};

const formatAmount = (amount: number | null): string => {
  if (!amount) return '❌ No especificado';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

const formatArray = (arr: any[] | null): string => {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return 'No especificado';
  return arr.join(', ');
};

interface FacturaDetailViewProps {
  facturaData: ExtractedFactura;
  metadata?: FacturaMetadata;
  confidence: number;
  extractionMethod: string;
  processingTime: number;
  tokensUsed: number;
}

export function FacturaDetailView({
  facturaData,
  metadata,
  confidence,
  extractionMethod,
  processingTime,
  tokensUsed
}: FacturaDetailViewProps) {
  return (
    <div className="space-y-6">
      {/* Header con metadatos de extracción */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <T.H3>Factura Comercial</T.H3>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">Confianza: {(confidence * 100).toFixed(1)}%</Badge>
          <Badge variant="secondary">{extractionMethod}</Badge>
        </div>
      </div>

      <Separator />

          {/* 💰 Información Principal */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                <T.H4 className="mb-0">💰 Información Principal</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice Number:</span>
                  <span className={facturaData.invoice_number ? 'text-primary font-medium' : 'text-destructive'}>
                    {facturaData.invoice_number || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice Date:</span>
                  <span className={facturaData.invoice_date ? 'text-primary font-medium' : 'text-destructive'}>
                    {formatDate(facturaData.invoice_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span className={facturaData.due_date ? 'text-primary font-medium' : 'text-destructive'}>
                    {formatDate(facturaData.due_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className={facturaData.total_amount ? 'text-primary font-medium' : 'text-destructive'}>
                    {facturaData.total_amount || '❌ No especificado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 🏢 Información del Vendedor */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-green-600" />
                <T.H4 className="mb-0">🏢 Información del Vendedor</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provider Name:</span>
                  <span className={facturaData.provider_name ? 'text-primary font-medium' : 'text-destructive'}>
                    {facturaData.provider_name || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendor Address:</span>
                  <span className={facturaData.vendor_address ? 'text-primary font-medium' : 'text-destructive'}>
                    {facturaData.vendor_address || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendor Tax Id:</span>
                  <span className={facturaData.vendor_tax_id ? 'text-primary font-medium' : 'text-destructive'}>
                    {facturaData.vendor_tax_id || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendor Phone:</span>
                  <span className={facturaData.vendor_phone ? 'text-primary font-medium' : 'text-destructive'}>
                    {facturaData.vendor_phone || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendor Email:</span>
                  <span className={facturaData.vendor_email ? 'text-primary font-medium' : 'text-destructive'}>
                    {facturaData.vendor_email || '❌ No especificado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 👤 Información del Cliente */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                <T.H4 className="mb-0">👤 Información del Cliente</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client Name:</span>
                  <span className={facturaData.client_name ? 'text-primary font-medium' : 'text-destructive'}>
                    {facturaData.client_name || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client Address:</span>
                  <span className={facturaData.client_address ? 'text-primary font-medium' : 'text-destructive'}>
                    {facturaData.client_address || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client Tax Id:</span>
                  <span className={facturaData.client_tax_id ? 'text-primary font-medium' : 'text-destructive'}>
                    {facturaData.client_tax_id || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client Phone:</span>
                  <span className={facturaData.client_phone ? 'text-primary font-medium' : 'text-destructive'}>
                    {facturaData.client_phone || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client Email:</span>
                  <span className={facturaData.client_email ? 'text-primary font-medium' : 'text-destructive'}>
                    {facturaData.client_email || '❌ No especificado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 📋 Productos/Servicios */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <List className="h-5 w-5 text-green-600" />
                <T.H4 className="mb-0">📋 Productos/Servicios</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Products Summary:</span>
                  <span className={facturaData.products_summary ? 'text-primary font-medium' : 'text-destructive'}>
                    {facturaData.products_summary || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Products Count:</span>
                  <span className={facturaData.products_count ? 'text-primary font-medium' : 'text-destructive'}>
                    {facturaData.products_count || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className={facturaData.subtotal ? 'text-primary font-medium' : 'text-destructive'}>
                    {facturaData.subtotal || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax Amount:</span>
                  <span className={facturaData.tax_amount ? 'text-primary font-medium' : 'text-destructive'}>
                    {facturaData.tax_amount || '❌ No especificado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 💳 Detalles de Pago */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                <T.H4 className="mb-0">💳 Detalles de Pago</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className={facturaData.payment_method ? 'text-primary font-medium' : 'text-destructive'}>
                    {facturaData.payment_method || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Terms:</span>
                  <span className={facturaData.payment_terms ? 'text-primary font-medium' : 'text-destructive'}>
                    {facturaData.payment_terms || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank Details:</span>
                  <span className={facturaData.bank_details ? 'text-primary font-medium' : 'text-destructive'}>
                    {facturaData.bank_details || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currency:</span>
                  <span className={facturaData.currency ? 'text-primary font-medium' : 'text-destructive'}>
                    {facturaData.currency || '❌ No especificado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 📝 Información Adicional */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                <T.H4 className="mb-0">📝 Información Adicional</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Notes:</span>
                  <span className={facturaData.notes ? 'text-primary font-medium' : 'text-destructive'}>
                    {facturaData.notes || '❌ No especificado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

      {/* Estadísticas de procesamiento */}
      <Card className="bg-muted/20">
        <CardContent className="pt-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Tiempo: {processingTime}ms</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Tokens: {tokensUsed}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FacturaDetailView;
