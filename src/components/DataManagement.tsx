import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Upload, 
  Database,
  FileJson,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

export function DataManagement() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const exportAllData = async () => {
    try {
      setIsExporting(true);
      
      // Fetch all data from different tables
      const [trafficData, decoyData, metricsData, mlModels] = await Promise.all([
        supabase.from('traffic_routing').select('*'),
        supabase.from('decoy_websites').select('*'),
        supabase.from('real_time_metrics').select('*'),
        supabase.from('ml_models').select('*')
      ]);

      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
          traffic_routing: trafficData.data || [],
          decoy_websites: decoyData.data || [],
          real_time_metrics: metricsData.data || [],
          ml_models: mlModels.data || []
        }
      };

      // Create JSON file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { 
        type: 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cyberhoneypot-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "All system data has been exported successfully",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export system data",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportTrafficData = async () => {
    try {
      setIsExporting(true);
      
      const { data, error } = await supabase
        .from('traffic_routing')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert to CSV
      if (data && data.length > 0) {
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => 
          Object.values(row).map(val => 
            typeof val === 'object' ? JSON.stringify(val) : val
          ).join(',')
        ).join('\n');
        
        const csv = `${headers}\n${rows}`;
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `traffic-data-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast({
          title: "Export Successful",
          description: `Exported ${data.length} traffic records`,
        });
      } else {
        toast({
          title: "No Data",
          description: "No traffic data available to export",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error exporting traffic data:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export traffic data",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportDecoyConfiguration = async () => {
    try {
      setIsExporting(true);
      
      const { data, error } = await supabase
        .from('decoy_websites')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
          type: 'application/json' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `decoy-config-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast({
          title: "Export Successful",
          description: `Exported ${data.length} decoy configurations`,
        });
      } else {
        toast({
          title: "No Data",
          description: "No decoy configurations available to export",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error exporting decoy config:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export decoy configuration",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setSelectedFile(file);
        toast({
          title: "File Selected",
          description: `Ready to import: ${file.name}`,
        });
      } else {
        toast({
          title: "Invalid File",
          description: "Please select a valid JSON backup file",
          variant: "destructive"
        });
      }
    }
  };

  const importBackupData = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a backup file to import",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsImporting(true);
      
      const text = await selectedFile.text();
      const backupData = JSON.parse(text);

      // Validate backup structure
      if (!backupData.data || !backupData.version) {
        throw new Error('Invalid backup file format');
      }

      // Import decoy websites (safe to import)
      if (backupData.data.decoy_websites && backupData.data.decoy_websites.length > 0) {
        // Remove id fields to avoid conflicts
        const decoysToImport = backupData.data.decoy_websites.map(({ id, ...rest }: any) => rest);
        
        const { error: decoyError } = await supabase
          .from('decoy_websites')
          .insert(decoysToImport);

        if (decoyError) {
          console.error('Error importing decoys:', decoyError);
          throw decoyError;
        }
      }

      toast({
        title: "Import Successful",
        description: "Configuration data has been imported successfully",
      });
      
      setSelectedFile(null);
    } catch (error) {
      console.error('Error importing backup:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import backup data",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Data Management</h3>
        <p className="text-sm text-muted-foreground">
          Export and import system data for backup and migration purposes
        </p>
      </div>

      {/* Export Section */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Export Data
          </CardTitle>
          <CardDescription>Download system data in various formats</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            className="w-full" 
            variant="outline"
            onClick={exportAllData}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            Export Complete Backup (JSON)
          </Button>
          
          <Button 
            className="w-full" 
            variant="outline"
            onClick={exportTrafficData}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileJson className="h-4 w-4 mr-2" />
            )}
            Export Traffic Data (CSV)
          </Button>

          <Button 
            className="w-full" 
            variant="outline"
            onClick={exportDecoyConfiguration}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileJson className="h-4 w-4 mr-2" />
            )}
            Export Decoy Configuration (JSON)
          </Button>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-accent" />
            Import Data
          </CardTitle>
          <CardDescription>Restore system data from backup files</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="backup-file">Select Backup File</Label>
            <Input
              id="backup-file"
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              disabled={isImporting}
            />
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-secondary" />
                {selectedFile.name}
              </div>
            )}
          </div>

          <Button 
            className="w-full" 
            onClick={importBackupData}
            disabled={!selectedFile || isImporting}
          >
            {isImporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Import Configuration
          </Button>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
            <div className="text-xs text-foreground/80">
              <p className="font-medium mb-1">Import Notes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Only configuration data will be imported</li>
                <li>Historical traffic data is not imported to prevent conflicts</li>
                <li>Duplicate decoy configurations may be created</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
