import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { T } from '@/components/ui/Typography';
import { CheckCircle, AlertCircle, XCircle, Settings, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createSupabaseClient } from '@/supabase-clients/server';
import { getGoogleVisionStatus } from '@/lib/pdf/googleVision';

export const dynamic = 'force-dynamic';

interface SystemCheckResult {
  name: string;
  status: string;
  message: string;
  details?: string[];
}

async function SystemCheck() {
  const checks: SystemCheckResult[] = [];

  try {
    // 1. Verificar conexión a Supabase
    const supabase = await createSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    checks.push({
      name: 'Conexión a Supabase',
      status: !userError && user ? 'success' : 'error',
      message: !userError && user ? `Conectado como: ${user.email}` : 'Error de autenticación',
    });

    // 2. Verificar tablas necesarias
    try {
      const { data: documents } = await supabase.from('documents').select('id').limit(1);
      const { data: agents } = await supabase.from('agents').select('id').limit(1);
      const { data: minutes } = await supabase.from('extracted_minutes').select('id').limit(1);
      const { data: invoices } = await supabase.from('extracted_invoices').select('id').limit(1);
      const { data: embeddings } = await supabase.from('vector_embeddings').select('id').limit(1);

      checks.push({
        name: 'Tablas de la base de datos',
        status: 'success',
        message: 'Todas las tablas principales están disponibles',
      });
    } catch (error) {
      checks.push({
        name: 'Tablas de la base de datos',
        status: 'error',
        message: 'Error accediendo a las tablas: ' + (error as Error).message,
      });
    }

    // 3. Verificar agentes configurados
    try {
      const { data: agents } = await supabase
        .from('agents')
        .select('name, purpose')
        .is('organization_id', null);

      const requiredAgents = ['document_classifier', 'minutes_extractor', 'invoice_extractor'];
      const existingAgents = agents?.map(a => a.name) || [];
      const missingAgents = requiredAgents.filter(name => !existingAgents.includes(name));

      if (missingAgents.length === 0) {
        checks.push({
          name: 'Agentes SaaS',
          status: 'success',
          message: `${existingAgents.length} agentes configurados correctamente`,
          details: agents?.map(a => `${a.name}: ${a.purpose}`)
        });
      } else {
        checks.push({
          name: 'Agentes SaaS',
          status: 'warning',
          message: `Faltan ${missingAgents.length} agentes: ${missingAgents.join(', ')}`,
        });
      }
    } catch (error) {
      checks.push({
        name: 'Agentes SaaS',
        status: 'error',
        message: 'Error verificando agentes: ' + (error as Error).message,
      });
    }

  } catch (error) {
    checks.push({
      name: 'Error general',
      status: 'error',
      message: (error as Error).message,
    });
  }

  // 4. Verificar Gemini API
  const hasGeminiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
  checks.push({
    name: 'Gemini API Key',
    status: hasGeminiKey ? 'success' : 'warning',
    message: hasGeminiKey ? 'API key configurada' : 'API key no configurada o usando placeholder',
  });

  // 5. Verificar Google Vision OCR
  const visionStatus = getGoogleVisionStatus();
  checks.push({
    name: 'Google Vision OCR',
    status: visionStatus.available ? 'success' : 'warning',
    message: visionStatus.message,
  });

  // 6. Verificar Supabase Storage
  try {
    const supabase = await createSupabaseClient();
    const { data: buckets } = await supabase.storage.listBuckets();
    const hasBucket = buckets?.some(bucket => bucket.name === 'documents');
    
    checks.push({
      name: 'Supabase Storage',
      status: hasBucket ? 'success' : 'warning',
      message: hasBucket ? 'Bucket "documents" configurado' : 'Bucket "documents" no encontrado',
    });
  } catch (error) {
    checks.push({
      name: 'Supabase Storage',
      status: 'error',
      message: 'Error verificando storage: ' + (error as Error).message,
    });
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  const successfulChecks = checks.filter(c => c.status === 'success').length;
  const totalChecks = checks.length;

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <Link 
          href="/documents" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Documentos
        </Link>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Verificación del Sistema</CardTitle>
          </div>
          <CardDescription>
            Estado de los componentes del sistema de procesamiento de documentos
          </CardDescription>
          
          <div className="flex items-center gap-2 mt-4">
            <T.Small>Estado general:</T.Small>
            <Badge variant={successfulChecks === totalChecks ? 'default' : 'secondary'}>
              {successfulChecks}/{totalChecks} componentes funcionando
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {checks.map((check, index) => (
            <Card key={index} className={`border-l-4 ${
              check.status === 'success' ? 'border-l-green-500' :
              check.status === 'warning' ? 'border-l-yellow-500' :
              'border-l-red-500'
            }`}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  {getStatusIcon(check.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <T.P className="font-medium mb-0">{check.name}</T.P>
                      <Badge variant={getStatusColor(check.status)}>
                        {check.status}
                      </Badge>
                    </div>
                    <T.Small className="text-muted-foreground">
                      {check.message}
                    </T.Small>
                    {check.details && (
                      <ul className="mt-2 text-xs text-muted-foreground space-y-1">
                        {check.details.map((detail, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <T.Small className="text-blue-800">
              <strong>Próximos pasos:</strong>
              {!hasGeminiKey && <span className="block mt-1">• Configurar GEMINI_API_KEY en .env.local</span>}
              {!visionStatus.available && <span className="block mt-1">• Opcional: Configurar Google Vision OCR para documentos escaneados</span>}
              <span className="block mt-1">• El sistema funciona con pdf-parse para la mayoría de documentos</span>
            </T.Small>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" asChild className="flex-1">
              <Link href="/documents">Volver a Documentos</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/documents/upload">Probar Upload</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SystemCheckPage() {
  return <SystemCheck />;
}