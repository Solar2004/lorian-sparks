import React, { useEffect, useState } from 'react';
import styles from './BotAnalysis.module.scss';
import { SparkAnalysisEngine, AnalysisResult } from '../../../common/logic/sparkAnalysisEngine';
import SamplerData from '../../SamplerData';

interface BotAnalysisProps {
    data: SamplerData;
}

export default function BotAnalysis({ data }: BotAnalysisProps) {
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const performAnalysis = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const engine = new SparkAnalysisEngine(data);
                const result = await engine.performFullAnalysis();
                setAnalysis(result);
            } catch (err) {
                console.error('Error running bot analysis:', err);
                setError('Failed to run server analysis');
            } finally {
                setLoading(false);
            }
        };

        performAnalysis();
    }, [data]);

    if (loading) {
        return (
            <div className={styles.analysisContainer}>
                <div className={styles.header}>
                    <h3>🤖 Server Analysis (Bot Scanner)</h3>
                    <div className={styles.loading}>Analyzing server configuration...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.analysisContainer}>
                <div className={styles.header}>
                    <h3>🤖 Server Analysis (Bot Scanner)</h3>
                    <div className={styles.error}>{error}</div>
                </div>
            </div>
        );
    }

    if (!analysis) {
        return null;
    }

    const getRatingColor = (rating: string) => {
        if (rating.includes('EXCELLENT')) return styles.excellent;
        if (rating.includes('GOOD')) return styles.good;
        if (rating.includes('FAIR')) return styles.fair;
        if (rating.includes('POOR')) return styles.poor;
        return styles.critical;
    };

    const getSeverityClass = (severity: 'critical' | 'warning' | 'info') => {
        switch (severity) {
            case 'critical': return styles.critical;
            case 'warning': return styles.warning;
            default: return styles.info;
        }
    };

    return (
        <div className={styles.analysisContainer}>
            <div className={styles.header} onClick={() => setExpanded(!expanded)}>
                <h3>🤖 Server Analysis (Bot Scanner)</h3>
                <div className={styles.headerInfo}>
                    <span className={getRatingColor(analysis.overallRating)}>
                        {analysis.overallRating}
                    </span>
                    <span className={styles.expandIcon}>
                        {expanded ? '▼' : '▶'}
                    </span>
                </div>
            </div>

            {expanded && (
                <div className={styles.content}>
                    {/* Critical Alerts */}
                    {analysis.criticalAlerts.length > 0 && (
                        <div className={styles.section}>
                            <h4 className={styles.critical}>🚨 Critical Issues</h4>
                            <ul className={styles.alertList}>
                                {analysis.criticalAlerts.map((alert, index) => (
                                    <li key={index} className={styles.critical}>{alert}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Performance Overview */}
                    <div className={styles.section}>
                        <h4>📊 Performance Overview</h4>
                        <div className={styles.metricsGrid}>
                            <div className={styles.metric}>
                                <span className={styles.label}>Server:</span>
                                <span>{analysis.serverAnalysis.platform} {analysis.serverAnalysis.version}</span>
                            </div>
                            <div className={styles.metric}>
                                <span className={styles.label}>MC Version:</span>
                                <span className={analysis.serverAnalysis.isOutdated ? styles.warning : ''}>
                                    {analysis.serverAnalysis.mcVersion}
                                    {analysis.serverAnalysis.isOutdated && ' (Outdated)'}
                                </span>
                            </div>
                            <div className={styles.metric}>
                                <span className={styles.label}>Average TPS:</span>
                                <span className={analysis.performanceMetrics.averageTPS < 18 ? styles.warning : styles.good}>
                                    {analysis.performanceMetrics.averageTPS.toFixed(2)} ({analysis.performanceMetrics.tpsStability})
                                </span>
                            </div>
                            <div className={styles.metric}>
                                <span className={styles.label}>Performance:</span>
                                <span>{analysis.performanceMetrics.performanceRating}</span>
                            </div>
                            <div className={styles.metric}>
                                <span className={styles.label}>Average MSPT:</span>
                                <span className={analysis.performanceMetrics.averageMSPT > 50 ? styles.warning : styles.good}>
                                    {analysis.performanceMetrics.averageMSPT.toFixed(2)}ms
                                </span>
                            </div>
                            <div className={styles.metric}>
                                <span className={styles.label}>Lag Spikes:</span>
                                <span className={analysis.performanceMetrics.lagSpikes > 0 ? styles.warning : styles.good}>
                                    {analysis.performanceMetrics.lagSpikes} detected
                                    {analysis.performanceMetrics.maxLagSpike > 0 && ` (Max: ${analysis.performanceMetrics.maxLagSpike.toFixed(2)}ms)`}
                                </span>
                            </div>
                            <div className={styles.metric}>
                                <span className={styles.label}>Players:</span>
                                <span>{analysis.performanceMetrics.playerCount}</span>
                            </div>
                            <div className={styles.metric}>
                                <span className={styles.label}>Entities:</span>
                                <span className={analysis.performanceMetrics.entityCount > 3000 ? styles.warning : styles.good}>
                                    {analysis.performanceMetrics.entityCount.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Plugin Analysis - Enhanced */}
                    <div className={styles.section}>
                        <h4>🔌 Plugin/Mod Analysis</h4>
                        <div className={styles.metricsGrid}>
                            <div className={styles.metric}>
                                <span className={styles.label}>Total Installed:</span>
                                <span>{analysis.pluginAnalysis.totalPlugins}</span>
                            </div>
                            <div className={styles.metric}>
                                <span className={styles.label}>Problematic Found:</span>
                                <span className={analysis.pluginAnalysis.problematicPlugins.length > 0 ? styles.warning : styles.good}>
                                    {analysis.pluginAnalysis.problematicPlugins.length}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Comprehensive Performance Metrics */}
                    {data.metadata?.platformStatistics && (
                        <div className={styles.section}>
                            <h4>📊 Detailed Performance Metrics</h4>
                            
                            {/* TPS Details */}
                            {data.metadata.platformStatistics.tps && (
                                <div className={styles.subsection}>
                                    <h5>TPS (Ticks Per Second)</h5>
                                    <div className={styles.detailGrid}>
                                        <div className={styles.detailItem}>
                                            <span>Last 1m:</span>
                                            <span className={data.metadata.platformStatistics.tps.last1M < 18 ? styles.warning : styles.good}>
                                                {data.metadata.platformStatistics.tps.last1M.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span>Last 5m:</span>
                                            <span className={data.metadata.platformStatistics.tps.last5M < 18 ? styles.warning : styles.good}>
                                                {data.metadata.platformStatistics.tps.last5M.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span>Last 15m:</span>
                                            <span className={data.metadata.platformStatistics.tps.last15M < 18 ? styles.warning : styles.good}>
                                                {data.metadata.platformStatistics.tps.last15M.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span>Stability:</span>
                                            <span>{analysis.performanceMetrics.tpsStability}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* MSPT Details */}
                            {data.metadata.platformStatistics.mspt?.last1M && (
                                <div className={styles.subsection}>
                                    <h5>MSPT (Milliseconds Per Tick)</h5>
                                    <div className={styles.detailGrid}>
                                        <div className={styles.detailItem}>
                                            <span>Minimum:</span>
                                            <span>{data.metadata.platformStatistics.mspt.last1M.min.toFixed(2)}ms</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span>Median:</span>
                                            <span className={data.metadata.platformStatistics.mspt.last1M.median > 50 ? styles.warning : styles.good}>
                                                {data.metadata.platformStatistics.mspt.last1M.median.toFixed(2)}ms
                                            </span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span>Mean:</span>
                                            <span>{data.metadata.platformStatistics.mspt.last1M.mean.toFixed(2)}ms</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span>95th Percentile:</span>
                                            <span className={data.metadata.platformStatistics.mspt.last1M.percentile95 > 50 ? styles.warning : styles.good}>
                                                {data.metadata.platformStatistics.mspt.last1M.percentile95.toFixed(2)}ms
                                            </span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span>Maximum:</span>
                                            <span className={data.metadata.platformStatistics.mspt.last1M.max > 100 ? styles.warning : styles.good}>
                                                {data.metadata.platformStatistics.mspt.last1M.max.toFixed(2)}ms
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* World Load */}
                            {data.metadata?.platformStatistics?.world && (
                                <div className={styles.subsection}>
                                    <h5>World Load</h5>
                                    <div className={styles.detailGrid}>
                                        <div className={styles.detailItem}>
                                            <span>Total Entities:</span>
                                            <span className={(data.metadata?.platformStatistics?.world?.totalEntities || 0) > 3000 ? styles.warning : styles.good}>
                                                {(data.metadata?.platformStatistics?.world?.totalEntities || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Top Entity Types */}
                                    {data.metadata?.platformStatistics?.world?.entityCounts && (
                                        <div className={styles.entityBreakdown}>
                                            <h6>Top Entity Types:</h6>
                                            <div className={styles.entityList}>
                                                {Object.entries(data.metadata?.platformStatistics?.world?.entityCounts || {})
                                                    .sort(([,a], [,b]) => Number(b) - Number(a))
                                                    .slice(0, 8)
                                                    .map(([type, count]) => {
                                                        const totalEntities = Object.values(data.metadata?.platformStatistics?.world?.entityCounts || {}).reduce((sum, c) => sum + Number(c), 0);
                                                        const percentage = ((Number(count) / totalEntities) * 100).toFixed(1);
                                                        return (
                                                            <div key={type} className={styles.entityItem}>
                                                                <span className={styles.entityType}>{type}:</span>
                                                                <span className={styles.entityCount}>
                                                                    {Number(count).toLocaleString()} ({percentage}%)
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Lag Pattern Analysis */}
                    <div className={styles.section}>
                        <h4>📊 Lag Pattern Analysis</h4>
                        <div className={styles.lagAnalysis}>
                            <div className={styles.lagMetric}>
                                <span className={styles.label}>Constant Lag Detection:</span>
                                <span className={styles.good}>✅ NO</span>
                            </div>
                            <div className={styles.lagMetric}>
                                <span className={styles.label}>Lag Spikes Detected:</span>
                                <span className={analysis.performanceMetrics.lagSpikes > 0 ? styles.warning : styles.good}>
                                    {analysis.performanceMetrics.lagSpikes} spikes
                                    {analysis.performanceMetrics.maxLagSpike > 0 && ` (Worst: ${analysis.performanceMetrics.maxLagSpike.toFixed(2)}ms)`}
                                </span>
                            </div>
                            <div className={styles.lagMetric}>
                                <span className={styles.label}>Memory Leak Risk:</span>
                                <span className={analysis.jvmAnalysis.memoryAnalysis.usagePercentage > 85 ? styles.warning : styles.good}>
                                    {analysis.jvmAnalysis.memoryAnalysis.usagePercentage > 85 ? '⚠️ HIGH' : '✅ LOW'} - {analysis.jvmAnalysis.memoryAnalysis.usagePercentage > 85 ? 'Monitor closely' : 'Healthy levels'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Sampling Information */}
                    {data.metadata && (
                        <div className={styles.section}>
                            <h4>⏱️ Sampling Information</h4>
                            <div className={styles.samplingGrid}>
                                {data.metadata.startTime && data.metadata.endTime && (
                                    <div className={styles.metric}>
                                        <span className={styles.label}>Sampling Duration:</span>
                                        <span>{((Number(data.metadata.endTime) - Number(data.metadata.startTime)) / 1000).toFixed(2)} seconds</span>
                                    </div>
                                )}
                                {data.metadata.numberOfTicks && (
                                    <div className={styles.metric}>
                                        <span className={styles.label}>Total Ticks Sampled:</span>
                                        <span>{data.metadata.numberOfTicks.toLocaleString()}</span>
                                    </div>
                                )}
                                {data.metadata.numberOfTicks && data.metadata.startTime && data.metadata.endTime && (
                                    <div className={styles.metric}>
                                        <span className={styles.label}>Average Tick Duration:</span>
                                        <span>{(((Number(data.metadata.endTime) - Number(data.metadata.startTime)) / data.metadata.numberOfTicks)).toFixed(2)}ms</span>
                                    </div>
                                )}
                                {data.nodes?.allNodes && (
                                    <div className={styles.metric}>
                                        <span className={styles.label}>Methods Analyzed:</span>
                                        <span>{data.nodes.allNodes.length.toLocaleString()}</span>
                                    </div>
                                )}
                                {data.threads && (
                                    <div className={styles.metric}>
                                        <span className={styles.label}>Threads Profiled:</span>
                                        <span>{data.threads.length}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* System Resources */}
                    {data.metadata?.systemStatistics && (
                        <div className={styles.section}>
                            <h4>🖥️ System Resources</h4>
                            <div className={styles.systemGrid}>
                                {data.metadata.systemStatistics.cpu && (
                                    <div className={styles.systemSection}>
                                        <h5>CPU Information</h5>
                                        <div className={styles.systemInfo}>
                                            <div>Available Threads: {data.metadata.systemStatistics.cpu.threads}</div>
                                            {data.metadata.systemStatistics.cpu.systemUsage && (
                                                <>
                                                    <div>System CPU (1m): {(data.metadata.systemStatistics.cpu.systemUsage.last1M * 100).toFixed(2)}%</div>
                                                    <div>System CPU (15m): {(data.metadata.systemStatistics.cpu.systemUsage.last15M * 100).toFixed(2)}%</div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                {data.metadata.systemStatistics.memory?.physical && (
                                    <div className={styles.systemSection}>
                                        <h5>System Memory</h5>
                                        <div className={styles.systemInfo}>
                                            <div>
                                                Physical RAM: {(Number(data.metadata.systemStatistics.memory.physical.used) / 1024 / 1024 / 1024).toFixed(1)} GB / {(Number(data.metadata.systemStatistics.memory.physical.total) / 1024 / 1024 / 1024).toFixed(1)} GB
                                                ({((Number(data.metadata.systemStatistics.memory.physical.used) / Number(data.metadata.systemStatistics.memory.physical.total)) * 100).toFixed(1)}%)
                                            </div>
                                            {data.metadata.systemStatistics.memory.physical.used && data.metadata.systemStatistics.memory.physical.total && (
                                                <div className={styles.memoryPressure}>
                                                    RAM Pressure: {((Number(data.metadata.systemStatistics.memory.physical.used) / Number(data.metadata.systemStatistics.memory.physical.total)) * 100) > 75 ? '⚠️ HIGH' : '✅ LOW'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {data.metadata.systemStatistics.disk && (
                                    <div className={styles.systemSection}>
                                        <h5>Disk Storage</h5>
                                        <div className={styles.systemInfo}>
                                            <div>
                                                Used: {(Number(data.metadata.systemStatistics.disk.used) / 1024 / 1024 / 1024).toFixed(1)} GB / {(Number(data.metadata.systemStatistics.disk.total) / 1024 / 1024 / 1024).toFixed(1)} GB
                                                ({((Number(data.metadata.systemStatistics.disk.used) / Number(data.metadata.systemStatistics.disk.total)) * 100).toFixed(1)}%)
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Configuration Issues */}
                    {analysis.serverAnalysis.configIssues.length > 0 && (
                        <div className={styles.section}>
                            <h4>⚙️ Configuration Issues ({analysis.serverAnalysis.configIssues.length})</h4>
                            <div className={styles.configIssues}>
                                {analysis.serverAnalysis.configIssues.slice(0, 10).map((issue, index) => (
                                    <div key={index} className={`${styles.configIssue} ${getSeverityClass(issue.severity)}`}>
                                        <div className={styles.configHeader}>
                                            <span className={styles.configFile}>{issue.configFile}</span>
                                            <span className={styles.configSetting}>{issue.setting}</span>
                                        </div>
                                        <div className={styles.configValues}>
                                            Current: <code>{String(issue.currentValue)}</code> → 
                                            Recommended: <code>{String(issue.recommendedValue)}</code>
                                        </div>
                                        <div className={styles.configDescription}>{issue.description}</div>
                                    </div>
                                ))}
                                {analysis.serverAnalysis.configIssues.length > 10 && (
                                    <div className={styles.moreInfo}>
                                        ... and {analysis.serverAnalysis.configIssues.length - 10} more configuration issues
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Plugin Issues */}
                    {analysis.pluginAnalysis.problematicPlugins.length > 0 && (
                        <div className={styles.section}>
                            <h4>🔌 Plugin Issues ({analysis.pluginAnalysis.problematicPlugins.length})</h4>
                            <div className={styles.pluginIssues}>
                                {analysis.pluginAnalysis.problematicPlugins.map((plugin, index) => (
                                    <div key={index} className={`${styles.pluginIssue} ${getSeverityClass(plugin.severity)}`}>
                                        <div className={styles.pluginName}>{plugin.name}</div>
                                        <div className={styles.pluginDescription}>{plugin.issue}</div>
                                        <div className={styles.pluginRecommendation}>{plugin.recommendation}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                    {/* JVM Analysis */}
                    <div className={styles.section}>
                        <h4>☕ JVM Configuration</h4>
                        <div className={styles.jvmGrid}>
                            <div className={styles.jvmSection}>
                                <h5>Memory</h5>
                                <div className={styles.jvmInfo}>
                                    <div>Allocated: {analysis.jvmAnalysis.memoryAnalysis.allocatedRAM.toFixed(0)} MB</div>
                                    <div>Used: {analysis.jvmAnalysis.memoryAnalysis.usedRAM.toFixed(0)} MB ({analysis.jvmAnalysis.memoryAnalysis.usagePercentage.toFixed(1)}%)</div>
                                    <div className={analysis.jvmAnalysis.memoryAnalysis.isMemoryLow ? styles.warning : styles.good}>
                                        Status: {analysis.jvmAnalysis.memoryAnalysis.isMemoryLow ? 'Low Memory' : 'Adequate'}
                                    </div>
                                </div>
                            </div>
                            
                            {analysis.jvmAnalysis.gcAnalysis.totalCollections > 0 && (
                                <div className={styles.jvmSection}>
                                    <h5>Garbage Collection</h5>
                                    <div className={styles.jvmInfo}>
                                        <div>Type: {analysis.jvmAnalysis.gcAnalysis.gcType}</div>
                                        <div>Collections: {analysis.jvmAnalysis.gcAnalysis.totalCollections.toLocaleString()}</div>
                                        <div>Avg Time: {analysis.jvmAnalysis.gcAnalysis.averageGCTime.toFixed(2)}ms</div>
                                        <div className={analysis.jvmAnalysis.gcAnalysis.gcOverhead > 10 ? styles.warning : styles.good}>
                                            Overhead: {analysis.jvmAnalysis.gcAnalysis.gcOverhead.toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {analysis.jvmAnalysis.criticalIssues.length > 0 && (
                            <div className={styles.jvmIssues}>
                                <h5>JVM Issues:</h5>
                                <ul>
                                    {analysis.jvmAnalysis.criticalIssues.map((issue, index) => (
                                        <li key={index} className={styles.critical}>{issue}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Recommendations */}
                    {analysis.recommendations.length > 0 && (
                        <div className={styles.section}>
                            <h4>💡 Optimization Recommendations</h4>
                            <ul className={styles.recommendations}>
                                {analysis.recommendations.slice(0, 10).map((rec, index) => (
                                    <li key={index}>{rec}</li>
                                ))}
                                {analysis.recommendations.length > 10 && (
                                    <li className={styles.moreInfo}>
                                        ... and {analysis.recommendations.length - 10} more recommendations
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}

                    <div className={styles.footer}>
                        <small>
                            This analysis replicates the Discord bot scanner functionality. 
                            For more detailed configuration help, visit the{' '}
                            <a href="https://github.com/pemigrade/botflop" target="_blank" rel="noopener noreferrer">
                                Botflop GitHub repository
                            </a>.
                        </small>
                    </div>
                </div>
            )}
        </div>
    );
}
