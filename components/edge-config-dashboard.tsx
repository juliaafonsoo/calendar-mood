import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Database, Cloud, Info, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import HybridMoodDataService from '@/lib/hybrid-data';
import EdgeConfigStore from '@/lib/edge-config';

interface DataSourceInfo {
  hasLocalData: boolean;
  hasEdgeConfigData: boolean;
  localCount: number;
  edgeConfigCount: number;
  lastSyncTime: Date | null;
}

interface EdgeConfigStats {
  totalEntries: number;
  averageMood: number;
  averageDose: number;
  averageClonazepamDrops: number;
  dataSource: string;
}

export default function EdgeConfigDashboard() {
  const [dataSourceInfo, setDataSourceInfo] = useState<DataSourceInfo | null>(null);
  const [edgeConfigStats, setEdgeConfigStats] = useState<EdgeConfigStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDataSourceInfo = async () => {
    try {
      setError(null);
      const info = await HybridMoodDataService.getDataSourceInfo();
      setDataSourceInfo(info);
      
      const stats = await EdgeConfigStore.getMoodStats();
      setEdgeConfigStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching data source info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleForceSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      await HybridMoodDataService.forceSync();
      await fetchDataSourceInfo();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
      console.error('Sync error:', err);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchDataSourceInfo();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Edge Config Dashboard...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const getDataSourceStatus = () => {
    if (!dataSourceInfo) return { status: 'unknown', color: 'secondary' };
    
    if (dataSourceInfo.hasLocalData && dataSourceInfo.hasEdgeConfigData) {
      return { status: 'synced', color: 'default' };
    } else if (dataSourceInfo.hasLocalData || dataSourceInfo.hasEdgeConfigData) {
      return { status: 'partial', color: 'destructive' };
    } else {
      return { status: 'empty', color: 'secondary' };
    }
  };

  const statusInfo = getDataSourceStatus();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Edge Config Dashboard</h2>
          <p className="text-muted-foreground">
            Manage and monitor your mood calendar data storage
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDataSourceInfo}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleForceSync}
            disabled={syncing || !dataSourceInfo?.hasEdgeConfigData}
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Force Sync
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Local Storage (IndexedDB)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={dataSourceInfo?.hasLocalData ? 'default' : 'secondary'}>
                  {dataSourceInfo?.hasLocalData ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  )}
                  {dataSourceInfo?.hasLocalData ? 'Active' : 'Empty'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Entries:</span>
                <span className="text-sm font-medium">
                  {dataSourceInfo?.localCount || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Edge Config (Vercel)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={dataSourceInfo?.hasEdgeConfigData ? 'default' : 'secondary'}>
                  {dataSourceInfo?.hasEdgeConfigData ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  )}
                  {dataSourceInfo?.hasEdgeConfigData ? 'Active' : 'Empty'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Entries:</span>
                <span className="text-sm font-medium">
                  {dataSourceInfo?.edgeConfigCount || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Info className="h-4 w-4" />
              Sync Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={statusInfo.color as any}>
                  {statusInfo.status === 'synced' && 'Synced'}
                  {statusInfo.status === 'partial' && 'Partial'}
                  {statusInfo.status === 'empty' && 'No Data'}
                  {statusInfo.status === 'unknown' && 'Unknown'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Sync:</span>
                <span className="text-sm font-medium">
                  {dataSourceInfo?.lastSyncTime 
                    ? dataSourceInfo.lastSyncTime.toLocaleString()
                    : 'Never'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Storage Overview</CardTitle>
              <CardDescription>
                Current status of your mood calendar data across different storage systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Local Storage (Fast Access)</h4>
                  <p className="text-sm text-muted-foreground">
                    IndexedDB provides fast, offline access to your mood data. 
                    Perfect for daily use and when you're offline.
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant={dataSourceInfo?.hasLocalData ? 'default' : 'secondary'}>
                      {dataSourceInfo?.localCount || 0} entries
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Edge Config (Global Sync)</h4>
                  <p className="text-sm text-muted-foreground">
                    Vercel Edge Config provides globally distributed data access 
                    and backup for your mood entries.
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant={dataSourceInfo?.hasEdgeConfigData ? 'default' : 'secondary'}>
                      {dataSourceInfo?.edgeConfigCount || 0} entries
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Edge Config Statistics</CardTitle>
              <CardDescription>
                Analytics from your Edge Config stored data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {edgeConfigStats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Entries</p>
                    <p className="text-2xl font-bold">{edgeConfigStats.totalEntries}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Average Mood</p>
                    <p className="text-2xl font-bold">{edgeConfigStats.averageMood.toFixed(1)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Average Dose</p>
                    <p className="text-2xl font-bold">{edgeConfigStats.averageDose.toFixed(0)}mg</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Data Source</p>
                    <Badge variant="outline">{edgeConfigStats.dataSource}</Badge>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No statistics available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Edge Config setup and management tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  To set up Edge Config with your mood data:
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Run the setup script to generate Edge Config data</li>
                    <li>Upload the data to your Vercel Edge Config using the CLI or Dashboard</li>
                    <li>Refresh this dashboard to see the updated status</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Edge Config Environment</h4>
                <p className="text-sm text-muted-foreground">
                  Current Edge Config URL: {process.env.NEXT_PUBLIC_EDGE_CONFIG ? '✓ Configured' : '✗ Not configured'}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Quick Actions</h4>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => HybridMoodDataService.clearCaches()}
                  >
                    Clear Caches
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleForceSync}
                    disabled={syncing}
                  >
                    Force Sync
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
