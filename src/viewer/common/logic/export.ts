import { getFileExtension, SparkContentType } from './contentType';
import SamplerData from '../../sampler/SamplerData';
import HeapData from '../../heap/HeapData';
import HealthData from '../../health/HealthData';
import { SparkAnalysisEngine, AnalysisResult } from './sparkAnalysisEngine';

export type ExportCallback = () => void;
export type ExportTxtCallback = () => void;

export function createExportCallback(
    code: string,
    buf: ArrayBuffer,
    contentType: SparkContentType
): ExportCallback {
    return () => {
        const url = URL.createObjectURL(new Blob([buf], { type: contentType }));

        const el = document.createElement('a');
        el.setAttribute('href', url);
        el.setAttribute('download', `${code}.${getFileExtension(contentType)}`);
        el.click();

        URL.revokeObjectURL(url);
    };
}

export function createExportTxtCallback(
    code: string,
    data: SamplerData | HeapData | HealthData,
    contentType: SparkContentType
): ExportTxtCallback {
    return async () => {
        const txtContent = await generateTxtContent(data, contentType);
        const blob = new Blob([txtContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const el = document.createElement('a');
        el.setAttribute('href', url);
        el.setAttribute('download', `${code}.txt`);
        el.click();

        URL.revokeObjectURL(url);
    };
}

async function generateTxtContent(
    data: SamplerData | HeapData | HealthData,
    contentType: SparkContentType
): Promise<string> {
    const lines: string[] = [];
    
    lines.push('='.repeat(80));
    lines.push('LORIAN SPARKS - PROFILE DATA EXPORT');
    lines.push('='.repeat(80));
    lines.push('');
    
    // Add timestamp
    lines.push(`Export Date: ${new Date().toISOString()}`);
    lines.push('');

    // Add metadata
    if (data.metadata) {
        lines.push('METADATA');
        lines.push('-'.repeat(40));
        
        if ('platform' in data.metadata && data.metadata.platform) {
            const platform = data.metadata.platform;
            lines.push(`Platform: ${platform.name || 'Unknown'}`);
            lines.push(`Version: ${platform.version || 'Unknown'}`);
            lines.push(`Minecraft Version: ${platform.minecraftVersion || 'N/A'}`);
            lines.push(`Spark Version: ${platform.sparkVersion || 'Unknown'}`);
            lines.push(`Brand: ${platform.brand || 'Unknown'}`);
        }

        if ('user' in data.metadata && data.metadata.user) {
            lines.push(`User: ${data.metadata.user.name || 'Unknown'}`);
        }

        if ('startTime' in data.metadata && data.metadata.startTime) {
            lines.push(`Start Time: ${new Date(Number(data.metadata.startTime)).toISOString()}`);
        }

        if ('endTime' in data.metadata && data.metadata.endTime) {
            lines.push(`End Time: ${new Date(Number(data.metadata.endTime)).toISOString()}`);
        }

        if ('interval' in data.metadata && data.metadata.interval) {
            lines.push(`Sampling Interval: ${data.metadata.interval}ms`);
        }

        // Información de mods/plugins si está disponible
        if ('sources' in data.metadata && data.metadata.sources) {
            const sources = Object.entries(data.metadata.sources);
            if (sources.length > 0) {
                lines.push('');
                lines.push('INSTALLED MODS/PLUGINS:');
                lines.push('-'.repeat(30));
                sources.forEach(([name, info]) => {
                    lines.push(`• ${name}`);
                    if (typeof info === 'object' && info !== null) {
                        if ('version' in info && info.version) lines.push(`  Version: ${info.version}`);
                        if ('author' in info && info.author) lines.push(`  Author: ${info.author}`);
                        if ('description' in info && info.description) lines.push(`  Description: ${info.description}`);
                    }
                });
            }
        }

        lines.push('');
    }

    // Content-specific data
    switch (contentType) {
        case 'application/x-spark-sampler':
            lines.push(...await generateSamplerContent(data as SamplerData));
            break;
        case 'application/x-spark-heap':
            lines.push(...generateHeapContent(data as HeapData));
            break;
        case 'application/x-spark-health':
            lines.push(...generateHealthContent(data as HealthData));
            break;
    }

    lines.push('');
    lines.push('='.repeat(80));
    lines.push('END OF REPORT');
    lines.push('='.repeat(80));

    return lines.join('\n');
}

async function generateSamplerContent(data: SamplerData): Promise<string[]> {
    const lines: string[] = [];
    
    lines.push('COMPREHENSIVE LAG ANALYSIS & PERFORMANCE DIAGNOSTICS');
    lines.push('='.repeat(60));
    lines.push('');

    // NUEVO ANÁLISIS INTEGRADO DEL BOT DE DISCORD
    let botAnalysis: AnalysisResult | null = null;
    try {
        const analysisEngine = new SparkAnalysisEngine(data);
        botAnalysis = await analysisEngine.performFullAnalysis();
    } catch (error) {
        console.warn('Failed to run bot analysis engine:', error);
    }

    if (botAnalysis) {
        lines.push('🤖 SPARK BOT ANALYSIS - SERVIDOR OPTIMIZATION REPORT');
        lines.push('='.repeat(60));
        lines.push(`Overall Server Rating: ${botAnalysis.overallRating}`);
        lines.push(`Server Platform: ${botAnalysis.serverAnalysis.platform} ${botAnalysis.serverAnalysis.version}`);
        lines.push(`Minecraft Version: ${botAnalysis.serverAnalysis.mcVersion}${botAnalysis.serverAnalysis.isOutdated ? ' (OUTDATED)' : ''}`);
        lines.push('');

        // ALERTAS CRÍTICAS DEL BOT
        if (botAnalysis.criticalAlerts.length > 0) {
            lines.push('🚨 CRITICAL ISSUES DETECTED BY BOT ANALYSIS');
            lines.push('='.repeat(50));
            botAnalysis.criticalAlerts.forEach((alert, index) => {
                lines.push(`${index + 1}. ${alert}`);
            });
            lines.push('');
        }

        // ANÁLISIS DE CONFIGURACIÓN DEL SERVIDOR
        if (botAnalysis.serverAnalysis.configIssues.length > 0) {
            lines.push('⚙️ SERVER CONFIGURATION ANALYSIS');
            lines.push('='.repeat(40));
            lines.push(`Configuration Issues Found: ${botAnalysis.serverAnalysis.configIssues.length}`);
            lines.push('');

            const criticalConfigIssues = botAnalysis.serverAnalysis.configIssues.filter(i => i.severity === 'critical');
            const warningConfigIssues = botAnalysis.serverAnalysis.configIssues.filter(i => i.severity === 'warning');

            if (criticalConfigIssues.length > 0) {
                lines.push('❌ CRITICAL CONFIGURATION ISSUES:');
                criticalConfigIssues.forEach((issue, index) => {
                    lines.push(`  ${index + 1}. ${issue.configFile} - ${issue.setting}`);
                    lines.push(`     Current: ${issue.currentValue} | Recommended: ${issue.recommendedValue}`);
                    lines.push(`     Impact: ${issue.description}`);
                    lines.push('');
                });
            }

            if (warningConfigIssues.length > 0) {
                lines.push('⚠️ CONFIGURATION WARNINGS:');
                warningConfigIssues.slice(0, 10).forEach((issue, index) => {
                    lines.push(`  ${index + 1}. ${issue.configFile} - ${issue.setting}`);
                    lines.push(`     Current: ${issue.currentValue} | Recommended: ${issue.recommendedValue}`);
                });
                if (warningConfigIssues.length > 10) {
                    lines.push(`     ... and ${warningConfigIssues.length - 10} more configuration optimizations available`);
                }
                lines.push('');
            }
        }

        // ANÁLISIS DE PLUGINS
        if (botAnalysis.pluginAnalysis.totalPlugins > 0) {
            lines.push('🔌 PLUGIN ANALYSIS');
            lines.push('='.repeat(25));
            lines.push(`Total Plugins Installed: ${botAnalysis.pluginAnalysis.totalPlugins}`);
            lines.push(`Problematic Plugins Found: ${botAnalysis.pluginAnalysis.problematicPlugins.length}`);
            lines.push('');

            if (botAnalysis.pluginAnalysis.problematicPlugins.length > 0) {
                const criticalPlugins = botAnalysis.pluginAnalysis.problematicPlugins.filter(p => p.severity === 'critical');
                const warningPlugins = botAnalysis.pluginAnalysis.problematicPlugins.filter(p => p.severity === 'warning');

                if (criticalPlugins.length > 0) {
                    lines.push('❌ CRITICAL PLUGIN ISSUES:');
                    criticalPlugins.forEach((plugin, index) => {
                        lines.push(`  ${index + 1}. ${plugin.name}`);
                        lines.push(`     Issue: ${plugin.issue}`);
                        lines.push(`     Recommendation: ${plugin.recommendation}`);
                        lines.push('');
                    });
                }

                if (warningPlugins.length > 0) {
                    lines.push('⚠️ PLUGIN WARNINGS:');
                    warningPlugins.slice(0, 5).forEach((plugin, index) => {
                        lines.push(`  ${index + 1}. ${plugin.name}: ${plugin.issue}`);
                    });
                    if (warningPlugins.length > 5) {
                        lines.push(`     ... and ${warningPlugins.length - 5} more plugin issues detected`);
                    }
                    lines.push('');
                }
            }
        }

        // RECOMENDACIONES DE MODS BASADAS EN USEFULMODS
        if (botAnalysis.modRecommendations && botAnalysis.modRecommendations.length > 0) {
            lines.push('📦 MOD RECOMMENDATIONS FROM USEFULMODS');
            lines.push('='.repeat(42));
            lines.push(`Found ${botAnalysis.modRecommendations.length} recommended mods for your setup:`);
            lines.push('');

            const categorized = {
                performance: botAnalysis.modRecommendations.filter(m => m.category === 'performance'),
                bugfix: botAnalysis.modRecommendations.filter(m => m.category === 'bugfix'),
                enhancement: botAnalysis.modRecommendations.filter(m => m.category === 'enhancement'),
                alternative: botAnalysis.modRecommendations.filter(m => m.category === 'alternative')
            };

            Object.entries(categorized).forEach(([category, mods]) => {
                if (mods.length > 0) {
                    const emoji = {
                        performance: '⚡',
                        bugfix: '🔧',
                        enhancement: '✨',
                        alternative: '🔄'
                    }[category] || '📦';

                    lines.push(`${emoji} ${category.toUpperCase()} MODS:`);
                    mods.slice(0, 3).forEach((mod, index) => {
                        lines.push(`  ${index + 1}. ${mod.name} by ${mod.author}`);
                        lines.push(`     ${mod.description}`);
                        lines.push(`     Why: ${mod.reason}`);
                        
                        if (mod.links.modrinth || mod.links.curseforge || mod.links.github) {
                            lines.push(`     Download:`);
                            if (mod.links.modrinth) lines.push(`       - Modrinth: ${mod.links.modrinth}`);
                            if (mod.links.curseforge) lines.push(`       - CurseForge: ${mod.links.curseforge}`);
                            if (mod.links.github) lines.push(`       - GitHub: ${mod.links.github}`);
                        }
                        
                        lines.push(`     Compatible: ${mod.platforms.map(p => p.type).join(', ')} (${mod.versions.join(', ')})`);
                        lines.push('');
                    });

                    if (mods.length > 3) {
                        lines.push(`     ... and ${mods.length - 3} more ${category} mods available`);
                        lines.push('');
                    }
                }
            });

            lines.push('Visit https://github.com/TheUsefulLists/UsefulMods for the complete list');
            lines.push('');
        }

        // ANÁLISIS JVM DETALLADO
        lines.push('☕ JVM ANALYSIS & OPTIMIZATION');
        lines.push('='.repeat(35));
        
        if (botAnalysis.jvmAnalysis.criticalIssues.length > 0) {
            lines.push('❌ CRITICAL JVM ISSUES:');
            botAnalysis.jvmAnalysis.criticalIssues.forEach((issue, index) => {
                lines.push(`  ${index + 1}. ${issue}`);
            });
            lines.push('');
        }

        // Análisis de memoria
        const memory = botAnalysis.jvmAnalysis.memoryAnalysis;
        lines.push('MEMORY CONFIGURATION:');
        lines.push(`  Allocated RAM: ${memory.allocatedRAM.toFixed(0)} MB`);
        lines.push(`  Used RAM: ${memory.usedRAM.toFixed(0)} MB (${memory.usagePercentage.toFixed(1)}%)`);
        lines.push(`  Memory Status: ${memory.isMemoryLow ? '❌ LOW - Needs more RAM' : '✅ ADEQUATE'}`);
        
        if (memory.memoryRecommendations.length > 0) {
            lines.push('  Memory Recommendations:');
            memory.memoryRecommendations.forEach((rec, index) => {
                lines.push(`    ${index + 1}. ${rec}`);
            });
        }
        lines.push('');

        // Análisis de Garbage Collection
        const gc = botAnalysis.jvmAnalysis.gcAnalysis;
        if (gc.totalCollections > 0) {
            lines.push('GARBAGE COLLECTION ANALYSIS:');
            lines.push(`  GC Type: ${gc.gcType}`);
            lines.push(`  Total Collections: ${gc.totalCollections.toLocaleString()}`);
            lines.push(`  Average GC Time: ${gc.averageGCTime.toFixed(2)}ms`);
            lines.push(`  GC Overhead: ${gc.gcOverhead.toFixed(2)}% ${gc.gcOverhead > 10 ? '⚠️ HIGH' : '✅ NORMAL'}`);
            
            if (gc.gcRecommendations.length > 0) {
                lines.push('  GC Recommendations:');
                gc.gcRecommendations.forEach((rec, index) => {
                    lines.push(`    ${index + 1}. ${rec}`);
                });
            }
            lines.push('');
        }

        // JVM Flags usados
        if (botAnalysis.jvmAnalysis.flags.length > 0) {
            lines.push('JVM FLAGS DETECTED:');
            const flagsText = botAnalysis.jvmAnalysis.flags.join(' ');
            lines.push(`  ${flagsText}`);
            lines.push('');
        }

        // MÉTRICAS DE RENDIMIENTO AVANZADAS
        const perf = botAnalysis.performanceMetrics;
        lines.push('📊 ADVANCED PERFORMANCE METRICS');
        lines.push('='.repeat(35));
        lines.push(`Performance Rating: ${perf.performanceRating}`);
        lines.push(`Average TPS: ${perf.averageTPS.toFixed(2)} (${perf.tpsStability})`);
        lines.push(`Average MSPT: ${perf.averageMSPT.toFixed(2)}ms`);
        lines.push(`Lag Spikes: ${perf.lagSpikes} detected (Max: ${perf.maxLagSpike.toFixed(2)}ms)`);
        lines.push(`Players Online: ${perf.playerCount}`);
        lines.push(`Total Entities: ${perf.entityCount.toLocaleString()}`);
        lines.push('');

        // RECOMENDACIONES FINALES DEL BOT
        if (botAnalysis.recommendations.length > 0) {
            lines.push('💡 BOT OPTIMIZATION RECOMMENDATIONS');
            lines.push('='.repeat(40));
            botAnalysis.recommendations.slice(0, 15).forEach((rec, index) => {
                lines.push(`${index + 1}. ${rec}`);
            });
            if (botAnalysis.recommendations.length > 15) {
                lines.push(`... and ${botAnalysis.recommendations.length - 15} more recommendations available`);
            }
            lines.push('');
        }

        lines.push('🔍 DISCORD BOT ANALYSIS COMPLETE');
        lines.push('='.repeat(40));
        lines.push('This analysis replicates the functionality of the Discord bot scanner.');
        lines.push('For detailed configuration help, visit: https://github.com/pemigrade/botflop');
        lines.push('');
        lines.push('='.repeat(80));
        lines.push('');
    }

    // ANÁLISIS INTEGRAL ORIGINAL DE TODOS LOS DATOS
    const comprehensiveAnalysis = performComprehensiveAnalysis(data);
    
    lines.push('🔍 EXECUTIVE SUMMARY - LAG DIAGNOSIS');
    lines.push('='.repeat(45));
    lines.push(`Overall Performance Rating: ${comprehensiveAnalysis.overallRating}`);
    lines.push(`Primary Lag Source: ${comprehensiveAnalysis.primaryLagSource}`);
    lines.push(`Lag Consistency: ${comprehensiveAnalysis.lagConsistency}`);
    lines.push(`Performance Trend: ${comprehensiveAnalysis.performanceTrend}`);
    lines.push(`Optimization Priority: ${comprehensiveAnalysis.optimizationPriority}`);
    lines.push('');

    // ALERTAS CRÍTICAS
    if (comprehensiveAnalysis.criticalAlerts.length > 0) {
        lines.push('🚨 CRITICAL PERFORMANCE ALERTS');
        lines.push('='.repeat(40));
        comprehensiveAnalysis.criticalAlerts.forEach((alert, index) => {
            lines.push(`${index + 1}. ${alert}`);
        });
        lines.push('');
    }

    // RECOMENDACIONES ESPECÍFICAS
    lines.push('💡 OPTIMIZATION RECOMMENDATIONS');
    lines.push('='.repeat(40));
    comprehensiveAnalysis.recommendations.forEach((rec, index) => {
        lines.push(`${index + 1}. ${rec.priority}: ${rec.description}`);
        if (rec.technicalDetails) {
            lines.push(`   Technical: ${rec.technicalDetails}`);
        }
        if (rec.expectedImprovement) {
            lines.push(`   Expected Impact: ${rec.expectedImprovement}`);
        }
        lines.push('');
    });

    // ANÁLISIS DE PATRONES DE LAG
    lines.push('📊 LAG PATTERN ANALYSIS');
    lines.push('='.repeat(30));
    lines.push(`Constant Lag Detection: ${comprehensiveAnalysis.constantLag.detected ? '🚨 YES' : '✅ NO'}`);
    if (comprehensiveAnalysis.constantLag.detected) {
        lines.push(`  Avg Constant Lag: ${comprehensiveAnalysis.constantLag.averageDelay}ms`);
        lines.push(`  Affected Methods: ${comprehensiveAnalysis.constantLag.affectedMethods}`);
        lines.push(`  Root Cause: ${comprehensiveAnalysis.constantLag.rootCause}`);
    }
    
    lines.push(`Lag Spikes Detected: ${comprehensiveAnalysis.lagSpikes.count} spikes`);
    if (comprehensiveAnalysis.lagSpikes.count > 0) {
        lines.push(`  Worst Spike: ${comprehensiveAnalysis.lagSpikes.worstSpike}ms`);
        lines.push(`  Spike Frequency: ${comprehensiveAnalysis.lagSpikes.frequency}`);
        lines.push(`  Common Spike Causes: ${comprehensiveAnalysis.lagSpikes.commonCauses.join(', ')}`);
    }
    
    lines.push(`Memory Leak Risk: ${comprehensiveAnalysis.memoryLeakRisk}`);
    lines.push(`Thread Contention: ${comprehensiveAnalysis.threadContention}`);
    lines.push(`I/O Bottlenecks: ${comprehensiveAnalysis.ioBottlenecks}`);
    lines.push('');

    // Información general del profiling
    const totalSamplingTime = data.metadata?.endTime && data.metadata?.startTime 
        ? Number(data.metadata.endTime) - Number(data.metadata.startTime) 
        : 0;
    
    if (totalSamplingTime > 0) {
        lines.push(`Total Sampling Duration: ${(totalSamplingTime / 1000).toFixed(2)} seconds`);
    }
    
    if (data.metadata?.numberOfTicks) {
        lines.push(`Total Ticks Sampled: ${data.metadata.numberOfTicks}`);
        const avgTickTime = totalSamplingTime > 0 ? (totalSamplingTime / data.metadata.numberOfTicks).toFixed(2) : '0';
        lines.push(`Average Tick Duration: ${avgTickTime}ms`);
    }
    
    lines.push('');

    // MÉTRICAS CRÍTICAS DE RENDIMIENTO
    if (data.metadata?.platformStatistics) {
        const stats = data.metadata.platformStatistics;
        
        lines.push('CRITICAL PERFORMANCE METRICS');
        lines.push('='.repeat(45));
        
        // TPS detallado
        if (stats.tps) {
            lines.push('TPS (TICKS PER SECOND):');
            lines.push(`  Current: ${stats.tps.last1M.toFixed(2)} TPS ${getTpsStatus(stats.tps.last1M)}`);
            lines.push(`  Last 1m: ${stats.tps.last1M.toFixed(2)} TPS`);
            lines.push(`  Last 5m: ${stats.tps.last5M.toFixed(2)} TPS`);
            lines.push(`  Last 15m: ${stats.tps.last15M.toFixed(2)} TPS`);
            
            // Análisis de estabilidad TPS
            const tpsVariance = Math.abs(stats.tps.last1M - stats.tps.last15M);
            const stability = tpsVariance < 0.5 ? 'STABLE' : tpsVariance < 2.0 ? 'UNSTABLE' : 'HIGHLY UNSTABLE';
            lines.push(`  Stability: ${stability} (variance: ${tpsVariance.toFixed(2)})`);
            lines.push('');
        }

        // MSPT crítico para lag analysis
        if (stats.mspt) {
            lines.push('MSPT (MILLISECONDS PER TICK) - LAG ANALYSIS:');
            if (stats.mspt.last1M) {
                lines.push(`  Minimum: ${stats.mspt.last1M.min.toFixed(2)}ms`);
                lines.push(`  Median: ${stats.mspt.last1M.median.toFixed(2)}ms ${getMsptStatus(stats.mspt.last1M.median)}`);
                lines.push(`  Mean: ${stats.mspt.last1M.mean.toFixed(2)}ms`);
                lines.push(`  95th Percentile: ${stats.mspt.last1M.percentile95.toFixed(2)}ms`);
                lines.push(`  Maximum: ${stats.mspt.last1M.max.toFixed(2)}ms ${getLagSeverity(stats.mspt.last1M.max)}`);
                
                // Análisis de lag spikes
                const lagSpikes = stats.mspt.last1M.max > 100;
                const severeLag = stats.mspt.last1M.percentile95 > 50;
                lines.push(`  Lag Spikes: ${lagSpikes ? 'DETECTED' : 'None'} ${lagSpikes ? `(Max: ${stats.mspt.last1M.max.toFixed(2)}ms)` : ''}`);
                lines.push(`  Consistent Lag: ${severeLag ? 'YES - 95% of ticks > 50ms' : 'No'}`);
            }
            if (stats.mspt.last5M) {
                lines.push(`  5m Average: ${stats.mspt.last5M.mean.toFixed(2)}ms`);
                lines.push(`  5m Maximum: ${stats.mspt.last5M.max.toFixed(2)}ms`);
            }
            lines.push('');
        }

        // CPU Analysis detallado  
        lines.push('CPU UTILIZATION ANALYSIS:');
        // Nota: Las estadísticas de CPU vienen del systemStatistics, no platformStatistics
        lines.push('');  // Se mostrará más abajo en la sección de system resources

        // Memory Analysis crítico
        if (stats.memory) {
            lines.push('MEMORY PRESSURE ANALYSIS:');
            if (stats.memory.heap) {
                const heapUsedMB = Number(stats.memory.heap.used) / 1024 / 1024;
                const heapMaxMB = stats.memory.heap.max ? Number(stats.memory.heap.max) / 1024 / 1024 : 0;
                const heapUsedPercent = heapMaxMB > 0 ? (heapUsedMB / heapMaxMB * 100) : 0;
                
                lines.push(`  Heap Usage: ${heapUsedMB.toFixed(0)} MB / ${heapMaxMB.toFixed(0)} MB (${heapUsedPercent.toFixed(1)}%)`);
                lines.push(`  Memory Pressure: ${getMemoryPressure(heapUsedPercent)}`);
                
                if (stats.memory.heap.committed) {
                    const heapCommittedMB = Number(stats.memory.heap.committed) / 1024 / 1024;
                    const commitRatio = heapMaxMB > 0 ? (heapCommittedMB / heapMaxMB * 100) : 0;
                    lines.push(`  Committed: ${heapCommittedMB.toFixed(0)} MB (${commitRatio.toFixed(1)}% of max)`);
                }
            }
            lines.push('');
        }

        // Garbage Collection Analysis crítico
        if (stats.gc && Object.keys(stats.gc).length > 0) {
            lines.push('GARBAGE COLLECTION IMPACT ANALYSIS:');
            let totalGcTime = 0;
            let totalCollections = 0;
            
            Object.entries(stats.gc).forEach(([gcName, gcStats]) => {
                const gcImpact = (gcStats.total * gcStats.avgTime) / 1000; // segundos totales en GC
                const gcFreqPerMin = gcStats.avgFrequency;
                
                lines.push(`  ${gcName}:`);
                lines.push(`    Collections: ${gcStats.total.toLocaleString()}`);
                lines.push(`    Avg Duration: ${gcStats.avgTime.toFixed(2)}ms ${getGcImpact(gcStats.avgTime)}`);
                lines.push(`    Frequency: ${gcFreqPerMin.toFixed(2)} collections/min`);
                lines.push(`    Total GC Time: ${gcImpact.toFixed(2)}s`);
                
                totalGcTime += gcImpact;
                totalCollections += gcStats.total;
            });
            
            const gcOverhead = totalSamplingTime > 0 ? (totalGcTime * 1000 / totalSamplingTime * 100) : 0;
            lines.push(`  TOTAL GC OVERHEAD: ${gcOverhead.toFixed(2)}% of sampling time ${getGcOverhead(gcOverhead)}`);
            lines.push(`  Total Collections: ${totalCollections.toLocaleString()}`);
            lines.push('');
        }

        // Player/World load analysis
        if (stats.playerCount !== undefined) {
            lines.push(`WORLD LOAD ANALYSIS:`);
            lines.push(`  Players Online: ${stats.playerCount}`);
        }
        
        if (stats.world) {
            lines.push(`  Total Entities: ${stats.world.totalEntities.toLocaleString()} ${getEntityLoadStatus(stats.world.totalEntities)}`);
            
            if (stats.world.entityCounts && Object.keys(stats.world.entityCounts).length > 0) {
                const totalEntitiesFromCounts = Object.values(stats.world.entityCounts).reduce((sum, count) => sum + Number(count), 0);
                const topEntities = Object.entries(stats.world.entityCounts)
                    .sort((a, b) => Number(b[1]) - Number(a[1]))
                    .slice(0, 5);
                
                lines.push(`  Top Entity Types (potential lag sources):`);
                topEntities.forEach(([type, count]) => {
                    const percentage = totalEntitiesFromCounts > 0 ? (Number(count) / totalEntitiesFromCounts * 100).toFixed(1) : '0';
                    lines.push(`    ${type}: ${Number(count).toLocaleString()} (${percentage}%) ${getEntityTypeWarning(type, Number(count))}`);
                });
            }
        }
        lines.push('');
    }

    // System Resources Impact
    if (data.metadata?.systemStatistics) {
        const sysStats = data.metadata.systemStatistics;
        
        lines.push('SYSTEM RESOURCES IMPACT:');
        lines.push('-'.repeat(35));
        
        if (sysStats.cpu) {
            lines.push(`  System CPU (1m): ${((sysStats.cpu.systemUsage?.last1M || 0) * 100).toFixed(2)}%`);
            lines.push(`  System CPU (15m): ${((sysStats.cpu.systemUsage?.last15M || 0) * 100).toFixed(2)}%`);
            lines.push(`  Available CPU Threads: ${sysStats.cpu.threads}`);
        }
        
        if (sysStats.memory?.physical) {
            const physUsedGB = Number(sysStats.memory.physical.used) / 1024 / 1024 / 1024;
            const physTotalGB = Number(sysStats.memory.physical.total) / 1024 / 1024 / 1024;
            const physUsedPercent = (physUsedGB / physTotalGB * 100);
            
            lines.push(`  System RAM: ${physUsedGB.toFixed(1)} GB / ${physTotalGB.toFixed(1)} GB (${physUsedPercent.toFixed(1)}%)`);
            lines.push(`  RAM Pressure: ${getSystemMemoryPressure(physUsedPercent)}`);
        }
        
        if (sysStats.disk) {
            const diskUsedGB = Number(sysStats.disk.used) / 1024 / 1024 / 1024;
            const diskTotalGB = Number(sysStats.disk.total) / 1024 / 1024 / 1024;
            const diskUsedPercent = (diskUsedGB / diskTotalGB * 100);
            
            lines.push(`  Disk Usage: ${diskUsedGB.toFixed(1)} GB / ${diskTotalGB.toFixed(1)} GB (${diskUsedPercent.toFixed(1)}%)`);
        }
        lines.push('');
    }

    lines.push('');

    // Análisis detallado de threads y call stack
    if (data.threads && data.threads.length > 0) {
        lines.push('THREAD ANALYSIS');
        lines.push('-'.repeat(30));
        lines.push(`Total Threads Profiled: ${data.threads.length}`);
        lines.push('');
        
        // Análisis simplificado de threads
        lines.push('THREADS DETECTED:');
        data.threads.forEach((thread, index) => {
            lines.push(`  ${index + 1}. Thread ID: ${thread.id || 'Unknown'}`);
        });
        lines.push('');
        
        // Nota sobre análisis de call stack
        lines.push('📝 Note: Detailed call stack analysis available in the web interface.');
        lines.push('   Use the interactive viewer for comprehensive method-level profiling.');
        lines.push('');
    }

    // ANÁLISIS DETALLADO DE PERFORMANCE HOTSPOTS
    if (data.nodes && data.nodes.allNodes) {
        lines.push('🔥 PERFORMANCE HOTSPOTS - METHOD ANALYSIS');
        lines.push('='.repeat(50));
        
        lines.push(`Total Methods Analyzed: ${data.nodes.allNodes.length}`);
        lines.push('');
        
        // Análisis simplificado de nodos
        lines.push('📊 METHOD BREAKDOWN:');
        const nodeSample = data.nodes.allNodes.slice(0, 10);
        nodeSample.forEach((node, index) => {
            const methodName = (node as any).methodName || 'Unknown Method';
            const className = (node as any).className || 'Unknown Class';
            
            lines.push(`${(index + 1).toString().padStart(2)}. ${className}.${methodName}()`);
            
            // Detectar tipo de lag si es posible
            const lagType = detectLagSource(className, methodName);
            if (lagType) {
                lines.push(`    🔍 ${lagType}`);
            }
        });
        
        lines.push('');
        lines.push('📝 Note: Complete method timing analysis available in the web interface.');
        lines.push('   Use the interactive flame graph for detailed performance profiling.');
        lines.push('');
    }

    // Análisis de mods/plugins por actividad
    if (data.nodes && data.nodes.allNodes) {
        const modStats = new Map<string, Set<string>>();
        
        // Detectar mods/plugins basados en patrones de nombres de clase
        data.nodes.allNodes.forEach(node => {
            const className = (node as any).className;
            const methodName = (node as any).methodName;
            
            if (className) {
                let modName = detectModFromClassName(className);
                if (modName) {
                    const current = modStats.get(modName) || new Set<string>();
                    if (methodName) {
                        current.add(`${className}.${methodName}`);
                    }
                    modStats.set(modName, current);
                }
            }
        });

        if (modStats.size > 0) {
            const sortedMods = Array.from(modStats.entries())
                .sort((a, b) => b[1].size - a[1].size)
                .slice(0, 15);

            lines.push('MOD/PLUGIN ACTIVITY ANALYSIS');
            lines.push('-'.repeat(40));
            
            sortedMods.forEach(([modName, methods], index) => {
                lines.push(`${(index + 1).toString().padStart(3)}. ${modName}`);
                lines.push(`     Methods Detected: ${methods.size}`);
                lines.push('');
            });
        }

        // Análisis de paquetes generales
        const packageStats = new Map<string, number>();
        
        data.nodes.allNodes.forEach(node => {
            const className = (node as any).className;
            if (className) {
                const parts = className.split('.');
                if (parts.length >= 2) {
                    const packageName = parts.slice(0, 2).join('.');
                    packageStats.set(packageName, (packageStats.get(packageName) || 0) + 1);
                }
            }
        });

        if (packageStats.size > 0) {
            const sortedPackages = Array.from(packageStats.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 15);

            lines.push('TOP 15 PACKAGES BY METHOD COUNT');
            lines.push('-'.repeat(40));
            
            sortedPackages.forEach(([packageName, count], index) => {
                lines.push(`${(index + 1).toString().padStart(3)}. ${packageName}`);
                lines.push(`     Methods: ${count}`);
                lines.push('');
            });
        }
    }

    // ANÁLISIS DE TENDENCIAS TEMPORALES
    if (data.timeWindows && data.timeWindows.length > 0) {
        lines.push('📈 PERFORMANCE TRENDS OVER TIME');
        lines.push('='.repeat(40));
        lines.push(`Analysis Period: ${data.timeWindows.length} time windows`);
        lines.push('');
        
        if (data.timeWindowStatistics) {
            const windows = Object.entries(data.timeWindowStatistics);
            if (windows.length > 0) {
                // Analizar tendencias de TPS
                const tpsValues = windows.map(([, stats]) => stats.tps).filter(tps => tps !== undefined) as number[];
                if (tpsValues.length > 1) {
                    const avgTps = tpsValues.reduce((sum, tps) => sum + tps, 0) / tpsValues.length;
                    const minTps = Math.min(...tpsValues);
                    const maxTps = Math.max(...tpsValues);
                    const tpsStdDev = Math.sqrt(tpsValues.reduce((sum, tps) => sum + Math.pow(tps - avgTps, 2), 0) / tpsValues.length);
                    
                    lines.push('🎯 TPS TREND ANALYSIS:');
                    lines.push(`  Average TPS: ${avgTps.toFixed(2)} ${getTpsStatus(avgTps)}`);
                    lines.push(`  TPS Range: ${minTps.toFixed(2)} - ${maxTps.toFixed(2)} (variance: ${(maxTps - minTps).toFixed(2)})`);
                    lines.push(`  Stability Index: ${tpsStdDev.toFixed(2)} ${tpsStdDev < 0.5 ? '✅ Stable' : tpsStdDev < 1.0 ? '⚠️ Unstable' : '🚨 Very Unstable'}`);
                    
                    // Detectar tendencia
                    if (tpsValues.length >= 3) {
                        const firstThird = tpsValues.slice(0, Math.floor(tpsValues.length / 3));
                        const lastThird = tpsValues.slice(-Math.floor(tpsValues.length / 3));
                        const firstAvg = firstThird.reduce((sum, tps) => sum + tps, 0) / firstThird.length;
                        const lastAvg = lastThird.reduce((sum, tps) => sum + tps, 0) / lastThird.length;
                        const trend = lastAvg - firstAvg;
                        
                        if (Math.abs(trend) < 0.2) {
                            lines.push(`  Trend: ➡️ STABLE (${trend >= 0 ? '+' : ''}${trend.toFixed(2)} TPS)`);
                        } else if (trend > 0) {
                            lines.push(`  Trend: 📈 IMPROVING (+${trend.toFixed(2)} TPS over time)`);
                        } else {
                            lines.push(`  Trend: 📉 DEGRADING (${trend.toFixed(2)} TPS over time) ⚠️`);
                        }
                    }
                    lines.push('');
                }

                // Analizar tendencias de MSPT
                const msptValues = windows.map(([, stats]) => stats.msptMedian).filter(mspt => mspt !== undefined) as number[];
                if (msptValues.length > 1) {
                    const avgMspt = msptValues.reduce((sum, mspt) => sum + mspt, 0) / msptValues.length;
                    const minMspt = Math.min(...msptValues);
                    const maxMspt = Math.max(...msptValues);
                    
                    lines.push('⏱️ MSPT TREND ANALYSIS:');
                    lines.push(`  Average MSPT: ${avgMspt.toFixed(2)}ms ${getMsptStatus(avgMspt)}`);
                    lines.push(`  MSPT Range: ${minMspt.toFixed(2)}ms - ${maxMspt.toFixed(2)}ms`);
                    
                    const lagSpikesCount = msptValues.filter(mspt => mspt > 100).length;
                    const lagSpikePercentage = (lagSpikesCount / msptValues.length * 100).toFixed(1);
                    lines.push(`  Lag Spikes: ${lagSpikesCount}/${msptValues.length} windows (${lagSpikePercentage}%)`);
                    lines.push('');
                }

                // Analizar carga del servidor a lo largo del tiempo
                const playerCounts = windows.map(([, stats]) => stats.players).filter(p => p !== undefined) as number[];
                const entityCounts = windows.map(([, stats]) => stats.entities).filter(e => e !== undefined) as number[];
                
                if (playerCounts.length > 0) {
                    const avgPlayers = playerCounts.reduce((sum, p) => sum + p, 0) / playerCounts.length;
                    const maxPlayers = Math.max(...playerCounts);
                    lines.push('👥 SERVER LOAD TRENDS:');
                    lines.push(`  Average Players: ${avgPlayers.toFixed(1)} (Peak: ${maxPlayers})`);
                }
                
                if (entityCounts.length > 0) {
                    const avgEntities = entityCounts.reduce((sum, e) => sum + e, 0) / entityCounts.length;
                    const maxEntities = Math.max(...entityCounts);
                    lines.push(`  Average Entities: ${avgEntities.toLocaleString()} (Peak: ${maxEntities.toLocaleString()})`);
                    
                    // Correlación entre entidades y rendimiento
                    if (tpsValues.length === entityCounts.length && entityCounts.length > 3) {
                        let correlation = 0;
                        const n = tpsValues.length;
                        const sumX = entityCounts.reduce((sum, e) => sum + e, 0);
                        const sumY = tpsValues.reduce((sum, t) => sum + t, 0);
                        const sumXY = entityCounts.reduce((sum, e, i) => sum + e * tpsValues[i], 0);
                        const sumX2 = entityCounts.reduce((sum, e) => sum + e * e, 0);
                        const sumY2 = tpsValues.reduce((sum, t) => sum + t * t, 0);
                        
                        const numerator = n * sumXY - sumX * sumY;
                        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
                        
                        if (denominator !== 0) {
                            correlation = numerator / denominator;
                            
                            if (correlation < -0.5) {
                                lines.push(`  Entity-Performance Correlation: 🚨 STRONG NEGATIVE (${correlation.toFixed(2)}) - Entities significantly impact TPS`);
                            } else if (correlation < -0.3) {
                                lines.push(`  Entity-Performance Correlation: ⚠️ MODERATE NEGATIVE (${correlation.toFixed(2)}) - Entities affect TPS`);
                            } else {
                                lines.push(`  Entity-Performance Correlation: ✅ WEAK/NO IMPACT (${correlation.toFixed(2)})`);
                            }
                        }
                    }
                }
                lines.push('');

                // Mostrar ventanas detalladas solo si hay pocas
                if (windows.length <= 10) {
                    lines.push('📊 DETAILED WINDOW BREAKDOWN:');
                    windows.forEach(([windowId, stats], index) => {
                        const duration = stats.startTime && stats.endTime 
                            ? (Number(stats.endTime) - Number(stats.startTime)) / 1000 
                            : 0;
                        
                        lines.push(`  Window ${index + 1} (${duration.toFixed(1)}s):`);
                        if (stats.tps !== undefined) lines.push(`    TPS: ${stats.tps.toFixed(2)} ${getTpsStatus(stats.tps)}`);
                        if (stats.msptMedian !== undefined) lines.push(`    MSPT: ${stats.msptMedian.toFixed(2)}ms ${getMsptStatus(stats.msptMedian)}`);
                        if (stats.msptMax !== undefined && stats.msptMax > 100) lines.push(`    Max MSPT: ${stats.msptMax.toFixed(2)}ms ⚠️`);
                        if (stats.players !== undefined) lines.push(`    Players: ${stats.players}`);
                        if (stats.entities !== undefined) lines.push(`    Entities: ${stats.entities.toLocaleString()}`);
                        if (stats.chunks !== undefined) lines.push(`    Chunks: ${stats.chunks.toLocaleString()}`);
                        lines.push('');
                    });
                } else {
                    lines.push(`📊 ${windows.length} time windows analyzed (showing trends above)`);
                    lines.push('');
                }
            }
        }
    }

    return lines;
}

function generateHeapContent(data: HeapData): string[] {
    const lines: string[] = [];
    
    lines.push('HEAP ANALYSIS');
    lines.push('-'.repeat(40));
    
    if (data.entries && data.entries.length > 0) {
        // Estadísticas generales
        const totalMemory = data.entries.reduce((sum, entry) => sum + Number(entry.size), 0);
        const totalInstances = data.entries.reduce((sum, entry) => sum + Number(entry.instances), 0);
        
        lines.push('HEAP SUMMARY:');
        lines.push(`Total Classes Analyzed: ${data.entries.length}`);
        lines.push(`Total Memory Usage: ${(totalMemory / 1024 / 1024).toFixed(2)} MB`);
        lines.push(`Total Object Instances: ${totalInstances.toLocaleString()}`);
        lines.push(`Average Memory per Class: ${(totalMemory / data.entries.length / 1024).toFixed(2)} KB`);
        lines.push('');
        
        // Top clases por memoria
        const sortedByMemory = data.entries
            .sort((a, b) => Number(b.size) - Number(a.size))
            .slice(0, 30);

        lines.push('TOP 30 CLASSES BY MEMORY USAGE:');
        lines.push('-'.repeat(50));
        
        sortedByMemory.forEach((entry, index) => {
            const sizeInMB = Number(entry.size) / 1024 / 1024;
            const percentage = (Number(entry.size) / totalMemory * 100).toFixed(2);
            const avgInstanceSize = Number(entry.instances) > 0 ? (Number(entry.size) / Number(entry.instances) / 1024).toFixed(2) : '0';
            
            lines.push(`${(index + 1).toString().padStart(3)}. ${entry.type}`);
            lines.push(`     Memory: ${sizeInMB.toFixed(2)} MB (${percentage}%)`);
            lines.push(`     Instances: ${Number(entry.instances).toLocaleString()}`);
            lines.push(`     Avg Size/Instance: ${avgInstanceSize} KB`);
            lines.push('');
        });
        
        // Top clases por número de instancias
        const sortedByInstances = data.entries
            .sort((a, b) => Number(b.instances) - Number(a.instances))
            .slice(0, 20);

        lines.push('TOP 20 CLASSES BY INSTANCE COUNT:');
        lines.push('-'.repeat(50));
        
        sortedByInstances.forEach((entry, index) => {
            const instancePercentage = (Number(entry.instances) / totalInstances * 100).toFixed(2);
            const sizeInKB = (Number(entry.size) / 1024).toFixed(2);
            
            lines.push(`${(index + 1).toString().padStart(3)}. ${entry.type}`);
            lines.push(`     Instances: ${Number(entry.instances).toLocaleString()} (${instancePercentage}%)`);
            lines.push(`     Total Memory: ${sizeInKB} KB`);
            lines.push('');
        });

        // Análisis por paquetes
        const packageStats = new Map<string, {memory: number, instances: number, classes: number}>();
        
        data.entries.forEach(entry => {
            const parts = entry.type.split('.');
            if (parts.length >= 2) {
                const packageName = parts.slice(0, 2).join('.');
                const current = packageStats.get(packageName) || {memory: 0, instances: 0, classes: 0};
                current.memory += Number(entry.size);
                current.instances += Number(entry.instances);
                current.classes += 1;
                packageStats.set(packageName, current);
            }
        });

        if (packageStats.size > 0) {
            const sortedPackages = Array.from(packageStats.entries())
                .sort((a, b) => b[1].memory - a[1].memory)
                .slice(0, 15);

            lines.push('TOP 15 PACKAGES BY MEMORY USAGE:');
            lines.push('-'.repeat(50));
            
            sortedPackages.forEach(([packageName, stats], index) => {
                const memoryMB = (stats.memory / 1024 / 1024).toFixed(2);
                const percentage = (stats.memory / totalMemory * 100).toFixed(2);
                
                lines.push(`${(index + 1).toString().padStart(3)}. ${packageName}`);
                lines.push(`     Memory: ${memoryMB} MB (${percentage}%)`);
                lines.push(`     Classes: ${stats.classes}`);
                lines.push(`     Instances: ${stats.instances.toLocaleString()}`);
                lines.push('');
            });
        }
    }

    return lines;
}

function generateHealthContent(data: HealthData): string[] {
    const lines: string[] = [];
    
    lines.push('HEALTH REPORT');
    lines.push('-'.repeat(40));
    
    // Información general del servidor
    if (data.metadata?.platformStatistics) {
        const stats = data.metadata.platformStatistics;
        
        lines.push('SERVER PERFORMANCE OVERVIEW');
        lines.push('-'.repeat(35));
        
        // TPS y rendimiento general
        if (stats.tps) {
            lines.push('SERVER PERFORMANCE:');
            lines.push(`  TPS (Last 1m):  ${stats.tps.last1M.toFixed(2)} ${getTpsStatus(stats.tps.last1M)}`);
            lines.push(`  TPS (Last 5m):  ${stats.tps.last5M.toFixed(2)} ${getTpsStatus(stats.tps.last5M)}`);
            lines.push(`  TPS (Last 15m): ${stats.tps.last15M.toFixed(2)} ${getTpsStatus(stats.tps.last15M)}`);
            lines.push('');
        }

        // MSPT (Milliseconds per tick)
        if (stats.mspt) {
            lines.push('TICK TIMING:');
            if (stats.mspt.last1M) {
                lines.push(`  MSPT (1m) - Mean: ${stats.mspt.last1M.mean.toFixed(2)}ms, Max: ${stats.mspt.last1M.max.toFixed(2)}ms`);
                lines.push(`  MSPT (1m) - 95th: ${stats.mspt.last1M.percentile95.toFixed(2)}ms, Min: ${stats.mspt.last1M.min.toFixed(2)}ms`);
            }
            if (stats.mspt.last5M) {
                lines.push(`  MSPT (5m) - Mean: ${stats.mspt.last5M.mean.toFixed(2)}ms, Max: ${stats.mspt.last5M.max.toFixed(2)}ms`);
            }
            lines.push('');
        }

        // Información de jugadores y mundo
        if (stats.playerCount !== undefined) {
            lines.push(`PLAYERS ONLINE: ${stats.playerCount}`);
        }
        
        if (stats.world) {
            lines.push('WORLD STATISTICS:');
            lines.push(`  Total Entities: ${stats.world.totalEntities.toLocaleString()}`);
            
            if (stats.world.entityCounts && Object.keys(stats.world.entityCounts).length > 0) {
                const sortedEntities = Object.entries(stats.world.entityCounts)
                    .sort((a, b) => Number(b[1]) - Number(a[1]))
                    .slice(0, 10);
                
                lines.push('  Top Entity Types:');
                sortedEntities.forEach(([type, count]) => {
                    lines.push(`    ${type}: ${Number(count).toLocaleString()}`);
                });
            }
            lines.push('');
        }

        // Memoria del servidor
        if (stats.memory) {
            lines.push('JVM MEMORY USAGE:');
            if (stats.memory.heap) {
                const heapUsedMB = Number(stats.memory.heap.used) / 1024 / 1024;
                const heapMaxMB = stats.memory.heap.max ? Number(stats.memory.heap.max) / 1024 / 1024 : 0;
                const heapUsedPercent = heapMaxMB > 0 ? (heapUsedMB / heapMaxMB * 100).toFixed(1) : 'N/A';
                
                lines.push(`  Heap Memory: ${heapUsedMB.toFixed(2)} MB / ${heapMaxMB.toFixed(2)} MB (${heapUsedPercent}%)`);
                
                if (stats.memory.heap.committed) {
                    const heapCommittedMB = Number(stats.memory.heap.committed) / 1024 / 1024;
                    lines.push(`  Heap Committed: ${heapCommittedMB.toFixed(2)} MB`);
                }
            }
            
            if (stats.memory.nonHeap) {
                const nonHeapUsedMB = Number(stats.memory.nonHeap.used) / 1024 / 1024;
                lines.push(`  Non-Heap Memory: ${nonHeapUsedMB.toFixed(2)} MB used`);
                
                if (stats.memory.nonHeap.committed) {
                    const nonHeapCommittedMB = Number(stats.memory.nonHeap.committed) / 1024 / 1024;
                    lines.push(`  Non-Heap Committed: ${nonHeapCommittedMB.toFixed(2)} MB`);
                }
            }

            // Memory pools
            if (stats.memory.pools && stats.memory.pools.length > 0) {
                lines.push('  Memory Pools:');
                stats.memory.pools.forEach(pool => {
                    const usedMB = pool.usage ? (Number(pool.usage.used) / 1024 / 1024).toFixed(2) : '0';
                    const maxMB = pool.usage?.max ? (Number(pool.usage.max) / 1024 / 1024).toFixed(2) : 'N/A';
                    lines.push(`    ${pool.name}: ${usedMB} MB / ${maxMB} MB`);
                });
            }
            lines.push('');
        }

        // Garbage Collection
        if (stats.gc && Object.keys(stats.gc).length > 0) {
            lines.push('GARBAGE COLLECTION:');
            Object.entries(stats.gc).forEach(([gcName, gcStats]) => {
                lines.push(`  ${gcName}:`);
                lines.push(`    Collections: ${gcStats.total.toLocaleString()}`);
                lines.push(`    Avg Time: ${gcStats.avgTime.toFixed(2)}ms`);
                lines.push(`    Avg Frequency: ${gcStats.avgFrequency.toFixed(2)} collections/min`);
            });
            lines.push('');
        }
    }

    // Estadísticas del sistema
    if (data.metadata?.systemStatistics) {
        const sysStats = data.metadata.systemStatistics;
        
        lines.push('SYSTEM RESOURCES');
        lines.push('-'.repeat(25));
        
        // CPU
        if (sysStats.cpu) {
            lines.push('CPU INFORMATION:');
            lines.push(`  Available Threads: ${sysStats.cpu.threads}`);
            if (sysStats.cpu.modelName) {
                lines.push(`  CPU Model: ${sysStats.cpu.modelName}`);
            }
            
            if (sysStats.cpu.processUsage) {
                lines.push(`  Process CPU (1m):  ${((sysStats.cpu.processUsage.last1M || 0) * 100).toFixed(2)}%`);
                lines.push(`  Process CPU (15m): ${((sysStats.cpu.processUsage.last15M || 0) * 100).toFixed(2)}%`);
            }
            if (sysStats.cpu.systemUsage) {
                lines.push(`  System CPU (1m):   ${((sysStats.cpu.systemUsage.last1M || 0) * 100).toFixed(2)}%`);
                lines.push(`  System CPU (15m):  ${((sysStats.cpu.systemUsage.last15M || 0) * 100).toFixed(2)}%`);
            }
            lines.push('');
        }

        // Memoria del sistema
        if (sysStats.memory) {
            lines.push('SYSTEM MEMORY:');
            if (sysStats.memory.physical) {
                const physUsedGB = Number(sysStats.memory.physical.used) / 1024 / 1024 / 1024;
                const physTotalGB = Number(sysStats.memory.physical.total) / 1024 / 1024 / 1024;
                const physUsedPercent = (physUsedGB / physTotalGB * 100).toFixed(1);
                
                lines.push(`  Physical RAM: ${physUsedGB.toFixed(2)} GB / ${physTotalGB.toFixed(2)} GB (${physUsedPercent}%)`);
            }
            
            if (sysStats.memory.swap) {
                const swapUsedGB = Number(sysStats.memory.swap.used) / 1024 / 1024 / 1024;
                const swapTotalGB = Number(sysStats.memory.swap.total) / 1024 / 1024 / 1024;
                lines.push(`  Swap: ${swapUsedGB.toFixed(2)} GB / ${swapTotalGB.toFixed(2)} GB`);
            }
            lines.push('');
        }

        // Almacenamiento
        if (sysStats.disk) {
            const diskUsedGB = Number(sysStats.disk.used) / 1024 / 1024 / 1024;
            const diskTotalGB = Number(sysStats.disk.total) / 1024 / 1024 / 1024;
            const diskUsedPercent = (diskUsedGB / diskTotalGB * 100).toFixed(1);
            
            lines.push('DISK STORAGE:');
            lines.push(`  Used: ${diskUsedGB.toFixed(2)} GB / ${diskTotalGB.toFixed(2)} GB (${diskUsedPercent}%)`);
            lines.push('');
        }

        // Sistema operativo y Java
        if (sysStats.os) {
            lines.push('SYSTEM INFORMATION:');
            lines.push(`  OS: ${sysStats.os.name} ${sysStats.os.version} (${sysStats.os.arch})`);
        }
        
        if (sysStats.java) {
            lines.push(`  Java: ${sysStats.java.version} (${sysStats.java.vendor})`);
            if (sysStats.java.vmArgs) {
                lines.push(`  JVM Args: ${sysStats.java.vmArgs}`);
            }
        }
        
        if (sysStats.uptime) {
            const uptimeHours = (Number(sysStats.uptime) / 1000 / 60 / 60).toFixed(2);
            lines.push(`  System Uptime: ${uptimeHours} hours`);
        }
        
        lines.push('');
    }

    // Análisis de ventanas de tiempo si están disponibles
    if (data.timeWindowStatistics && Object.keys(data.timeWindowStatistics).length > 0) {
        lines.push('TIME WINDOW ANALYSIS');
        lines.push('-'.repeat(25));
        
        const windows = Object.entries(data.timeWindowStatistics);
        lines.push(`Total Time Windows: ${windows.length}`);
        lines.push('');
        
        windows.forEach(([windowId, stats], index) => {
            lines.push(`Window ${index + 1} (ID: ${windowId}):`);
            if (stats.tps !== undefined) lines.push(`  TPS: ${stats.tps.toFixed(2)}`);
            if (stats.msptMedian !== undefined) lines.push(`  MSPT Median: ${stats.msptMedian.toFixed(2)}ms`);
            if (stats.msptMax !== undefined) lines.push(`  MSPT Max: ${stats.msptMax.toFixed(2)}ms`);
            if (stats.players !== undefined) lines.push(`  Players: ${stats.players}`);
            if (stats.entities !== undefined) lines.push(`  Entities: ${stats.entities.toLocaleString()}`);
            if (stats.chunks !== undefined) lines.push(`  Loaded Chunks: ${stats.chunks.toLocaleString()}`);
            if (stats.startTime && stats.endTime) {
                const duration = (Number(stats.endTime) - Number(stats.startTime)) / 1000;
                lines.push(`  Duration: ${duration.toFixed(2)} seconds`);
            }
            lines.push('');
        });
    }

    return lines;
}

// Función auxiliar para determinar el estado del TPS
function getTpsStatus(tps: number): string {
    if (tps >= 19.5) return '(Excellent)';
    if (tps >= 18.0) return '(Good)';
    if (tps >= 15.0) return '(Fair)';
    if (tps >= 10.0) return '(Poor)';
    return '(Critical)';
}

// Función auxiliar para evaluar MSPT
function getMsptStatus(mspt: number): string {
    if (mspt <= 20) return '(Excellent - No lag)';
    if (mspt <= 35) return '(Good - Minimal lag)';
    if (mspt <= 50) return '(Fair - Noticeable lag)';
    if (mspt <= 100) return '(Poor - Significant lag)';
    return '(Critical - Severe lag)';
}

// Función auxiliar para evaluar severidad de lag spikes
function getLagSeverity(maxMspt: number): string {
    if (maxMspt <= 50) return '(No significant spikes)';
    if (maxMspt <= 100) return '(Minor lag spikes)';
    if (maxMspt <= 500) return '(⚠️ MODERATE LAG SPIKES)';
    if (maxMspt <= 1000) return '(⚠️ SEVERE LAG SPIKES)';
    return '(🚨 EXTREME LAG SPIKES - CRITICAL)';
}

// Función auxiliar para evaluar CPU
function getCpuStatus(cpuPercent: number): string {
    if (cpuPercent <= 30) return '(Low)';
    if (cpuPercent <= 50) return '(Moderate)';
    if (cpuPercent <= 70) return '(High)';
    if (cpuPercent <= 90) return '(⚠️ Very High)';
    return '(🚨 CRITICAL)';
}

// Función auxiliar para evaluar presión de memoria
function getMemoryPressure(memoryPercent: number): string {
    if (memoryPercent <= 50) return 'LOW - Healthy';
    if (memoryPercent <= 70) return 'MODERATE - Monitor';
    if (memoryPercent <= 85) return '⚠️ HIGH - Potential issues';
    if (memoryPercent <= 95) return '⚠️ CRITICAL - GC pressure';
    return '🚨 EXTREME - Immediate action needed';
}

// Función auxiliar para evaluar memoria del sistema
function getSystemMemoryPressure(memoryPercent: number): string {
    if (memoryPercent <= 60) return 'LOW';
    if (memoryPercent <= 75) return 'MODERATE';
    if (memoryPercent <= 85) return 'HIGH';
    if (memoryPercent <= 95) return '⚠️ CRITICAL';
    return '🚨 EXTREME';
}

// Función auxiliar para evaluar impacto de GC
function getGcImpact(avgTime: number): string {
    if (avgTime <= 10) return '(Minimal impact)';
    if (avgTime <= 50) return '(Low impact)';
    if (avgTime <= 100) return '(⚠️ Moderate impact)';
    if (avgTime <= 500) return '(⚠️ High impact)';
    return '(🚨 SEVERE IMPACT)';
}

// Función auxiliar para evaluar overhead de GC
function getGcOverhead(overheadPercent: number): string {
    if (overheadPercent <= 2) return '(Excellent)';
    if (overheadPercent <= 5) return '(Good)';
    if (overheadPercent <= 10) return '(⚠️ Concerning)';
    if (overheadPercent <= 20) return '(⚠️ High - Tune GC)';
    return '(🚨 CRITICAL - GC tuning required)';
}

// Función auxiliar para evaluar carga de entidades
function getEntityLoadStatus(entityCount: number): string {
    if (entityCount <= 500) return '(Low load)';
    if (entityCount <= 1500) return '(Moderate load)';
    if (entityCount <= 3000) return '(High load)';
    if (entityCount <= 5000) return '(⚠️ Very high load)';
    return '(🚨 EXTREME LOAD - Performance impact)';
}

// Función auxiliar para advertencias por tipo de entidad
function getEntityTypeWarning(entityType: string, count: number): string {
    const laggyEntities = ['villager', 'zombie', 'skeleton', 'creeper', 'spider', 'enderman', 'witch'];
    const veryLaggyEntities = ['hopper', 'chest_minecart', 'furnace_minecart', 'item_frame'];
    const extremeLaggyEntities = ['armor_stand', 'painting', 'item'];
    
    if (extremeLaggyEntities.includes(entityType) && count > 100) {
        return '🚨 EXTREME LAG SOURCE';
    }
    if (veryLaggyEntities.includes(entityType) && count > 50) {
        return '⚠️ HIGH LAG SOURCE';
    }
    if (laggyEntities.includes(entityType) && count > 200) {
        return '⚠️ POTENTIAL LAG SOURCE';
    }
    if (count > 1000) {
        return '⚠️ HIGH COUNT';
    }
    return '';
}

// Función auxiliar para detectar fuentes conocidas de lag en el código
function detectLagSource(className: string, methodName: string): string {
    const fullMethod = `${className}.${methodName}`.toLowerCase();
    
    // Fuentes críticas de lag
    if (fullMethod.includes('worldgen') || fullMethod.includes('chunkgen')) {
        return '🚨 WORLD GENERATION LAG';
    }
    if (fullMethod.includes('pathfind') || fullMethod.includes('navigation')) {
        return '🚨 PATHFINDING LAG';
    }
    if (fullMethod.includes('ai.') || fullMethod.includes('entityai')) {
        return '⚠️ ENTITY AI LAG';
    }
    if (fullMethod.includes('tick') && (fullMethod.includes('entity') || fullMethod.includes('block'))) {
        return '⚠️ TICK LAG';
    }
    if (fullMethod.includes('light') && fullMethod.includes('update')) {
        return '⚠️ LIGHTING LAG';
    }
    if (fullMethod.includes('fluid') && fullMethod.includes('tick')) {
        return '⚠️ FLUID SIMULATION';
    }
    if (fullMethod.includes('redstone')) {
        return '⚠️ REDSTONE LAG';
    }
    if (fullMethod.includes('hopper') || fullMethod.includes('inventory.transfer')) {
        return '⚠️ HOPPER LAG';
    }
    if (fullMethod.includes('chunk') && (fullMethod.includes('load') || fullMethod.includes('save'))) {
        return '⚠️ CHUNK I/O';
    }
    if (fullMethod.includes('serialize') || fullMethod.includes('deserialize')) {
        return '⚠️ SERIALIZATION';
    }
    if (fullMethod.includes('network') && fullMethod.includes('packet')) {
        return '⚠️ NETWORK I/O';
    }
    if (fullMethod.includes('gc') || fullMethod.includes('garbage')) {
        return '🚨 GARBAGE COLLECTION';
    }
    if (fullMethod.includes('unsafe.park') || fullMethod.includes('locksupport')) {
        return '⚠️ THREAD BLOCKING';
    }
    if (fullMethod.includes('wait') || fullMethod.includes('sleep')) {
        return '⚠️ THREAD WAITING';
    }
    
    // Mods conocidos por causar lag
    if (fullMethod.includes('optifine') && fullMethod.includes('render')) {
        return '⚠️ OPTIFINE RENDER';
    }
    if (fullMethod.includes('journeymap')) {
        return '⚠️ JOURNEYMAP LAG';
    }
    if (fullMethod.includes('jei') && fullMethod.includes('recipe')) {
        return '⚠️ JEI RECIPE CALC';
    }
    
    return '';
}

// Función para realizar análisis integral de todos los datos
function performComprehensiveAnalysis(data: SamplerData): {
    overallRating: string;
    primaryLagSource: string;
    lagConsistency: string;
    performanceTrend: string;
    optimizationPriority: string;
    criticalAlerts: string[];
    recommendations: Array<{
        priority: string;
        description: string;
        technicalDetails?: string;
        expectedImprovement?: string;
    }>;
    constantLag: {
        detected: boolean;
        averageDelay?: string;
        affectedMethods?: number;
        rootCause?: string;
    };
    lagSpikes: {
        count: number;
        worstSpike?: string;
        frequency?: string;
        commonCauses: string[];
    };
    memoryLeakRisk: string;
    threadContention: string;
    ioBottlenecks: string;
} {
    const analysis = {
        overallRating: 'Unknown',
        primaryLagSource: 'Analyzing...',
        lagConsistency: 'Unknown',
        performanceTrend: 'Stable',
        optimizationPriority: 'Low',
        criticalAlerts: [] as string[],
        recommendations: [] as Array<{
            priority: string;
            description: string;
            technicalDetails?: string;
            expectedImprovement?: string;
        }>,
        constantLag: {
            detected: false
        },
        lagSpikes: {
            count: 0,
            commonCauses: [] as string[]
        },
        memoryLeakRisk: 'Low',
        threadContention: 'None Detected',
        ioBottlenecks: 'None Detected'
    };

    // Analizar métricas de rendimiento si están disponibles
    if (data.metadata?.platformStatistics) {
        const stats = data.metadata.platformStatistics;
        
        // Evaluar TPS y determinar rating general
        if (stats.tps) {
            const avgTps = (stats.tps.last1M + stats.tps.last5M + stats.tps.last15M) / 3;
            if (avgTps >= 19.5) {
                analysis.overallRating = '🟢 EXCELLENT (A+)';
            } else if (avgTps >= 18.0) {
                analysis.overallRating = '🟡 GOOD (B+)';
            } else if (avgTps >= 15.0) {
                analysis.overallRating = '🟠 FAIR (C)';
            } else if (avgTps >= 10.0) {
                analysis.overallRating = '🔴 POOR (D)';
                analysis.criticalAlerts.push('Server TPS is critically low - immediate optimization required');
            } else {
                analysis.overallRating = '🚨 CRITICAL (F)';
                analysis.criticalAlerts.push('SEVERE: Server TPS below 10 - server likely unplayable');
            }

            // Analizar consistencia de TPS
            const tpsVariance = Math.abs(stats.tps.last1M - stats.tps.last15M);
            if (tpsVariance < 0.5) {
                analysis.lagConsistency = '✅ STABLE - Consistent performance';
            } else if (tpsVariance < 2.0) {
                analysis.lagConsistency = '⚠️ UNSTABLE - Performance fluctuates';
                analysis.criticalAlerts.push('TPS instability detected - performance varies significantly');
            } else {
                analysis.lagConsistency = '🚨 HIGHLY UNSTABLE - Severe performance swings';
                analysis.criticalAlerts.push('CRITICAL: Extreme TPS instability - major optimization needed');
            }
        }

        // Analizar MSPT para detectar lag constante
        if (stats.mspt?.last1M) {
            const mspt = stats.mspt.last1M;
            const avgMspt = mspt.mean || 0;
            const maxMspt = mspt.max || 0;
            const medianMspt = mspt.median || 0;
            const percentile95 = mspt.percentile95 || 0;

            // Detectar lag constante
            if (percentile95 > 50) {
                analysis.constantLag.detected = true;
                (analysis.constantLag as any).averageDelay = avgMspt.toFixed(2);
                (analysis.constantLag as any).rootCause = 'High 95th percentile indicates consistent performance issues';
                analysis.criticalAlerts.push('CONSTANT LAG DETECTED: 95% of ticks exceed optimal timing');
                
                if (avgMspt > 100) {
                    analysis.optimizationPriority = '🚨 CRITICAL';
                    analysis.recommendations.push({
                        priority: '🚨 URGENT',
                        description: 'Address constant lag immediately - server performance severely impacted',
                        technicalDetails: 'Consider reducing entity count, optimizing plugins, or upgrading hardware',
                        expectedImprovement: 'Could improve MSPT by 50-80%'
                    });
                } else if (avgMspt > 50) {
                    analysis.optimizationPriority = '⚠️ HIGH';
                    analysis.recommendations.push({
                        priority: '⚠️ HIGH',
                        description: 'Optimize tick processing to reduce constant lag',
                        technicalDetails: 'Profile specific methods causing consistent delays',
                        expectedImprovement: 'Could improve MSPT by 20-40%'
                    });
                }
            }

            // Detectar lag spikes
            if (maxMspt > 100) {
                const spikeCount = Math.floor(maxMspt / 100);
                analysis.lagSpikes.count = spikeCount;
                (analysis.lagSpikes as any).worstSpike = maxMspt.toFixed(2);
                
                if (maxMspt > 1000) {
                    (analysis.lagSpikes as any).frequency = 'Severe spikes (>1000ms)';
                    analysis.criticalAlerts.push(`EXTREME LAG SPIKE: ${maxMspt.toFixed(2)}ms detected - investigate immediately`);
                } else if (maxMspt > 500) {
                    (analysis.lagSpikes as any).frequency = 'Major spikes (>500ms)';
                    analysis.criticalAlerts.push(`MAJOR LAG SPIKE: ${maxMspt.toFixed(2)}ms detected`);
                } else {
                    (analysis.lagSpikes as any).frequency = 'Moderate spikes (>100ms)';
                }
            }
        }

        // Analizar memoria para detectar posibles leaks
        if (stats.memory?.heap) {
            const heapUsedMB = Number(stats.memory.heap.used) / 1024 / 1024;
            const heapMaxMB = stats.memory.heap.max ? Number(stats.memory.heap.max) / 1024 / 1024 : 0;
            const heapUsedPercent = heapMaxMB > 0 ? (heapUsedMB / heapMaxMB * 100) : 0;

            if (heapUsedPercent > 90) {
                analysis.memoryLeakRisk = '🚨 CRITICAL - Immediate GC pressure';
                analysis.criticalAlerts.push('MEMORY CRITICAL: Heap usage >90% - risk of OutOfMemoryError');
                analysis.recommendations.push({
                    priority: '🚨 URGENT',
                    description: 'Address memory pressure immediately',
                    technicalDetails: 'Increase heap size or optimize memory usage',
                    expectedImprovement: 'Prevent server crashes and improve stability'
                });
            } else if (heapUsedPercent > 80) {
                analysis.memoryLeakRisk = '⚠️ HIGH - Monitor closely';
                analysis.recommendations.push({
                    priority: '⚠️ HIGH',
                    description: 'Monitor memory usage and consider optimization',
                    technicalDetails: 'Review memory-intensive operations and plugins',
                    expectedImprovement: 'Prevent future memory issues'
                });
            } else if (heapUsedPercent > 70) {
                analysis.memoryLeakRisk = '🟡 MODERATE - Watch trends';
            } else {
                analysis.memoryLeakRisk = '✅ LOW - Healthy levels';
            }
        }

        // Analizar GC para detectar problemas
        if (stats.gc && Object.keys(stats.gc).length > 0) {
            let totalGcTime = 0;
            let totalCollections = 0;
            const totalSamplingTime = data.metadata?.endTime && data.metadata?.startTime 
                ? Number(data.metadata.endTime) - Number(data.metadata.startTime) 
                : 0;

            Object.values(stats.gc).forEach(gcStats => {
                totalGcTime += (gcStats.total * gcStats.avgTime);
                totalCollections += gcStats.total;
            });

            const gcOverhead = totalSamplingTime > 0 ? (totalGcTime / totalSamplingTime * 100) : 0;
            
            if (gcOverhead > 20) {
                analysis.criticalAlerts.push(`CRITICAL GC OVERHEAD: ${gcOverhead.toFixed(2)}% - severe performance impact`);
                analysis.recommendations.push({
                    priority: '🚨 URGENT',
                    description: 'Optimize garbage collection immediately',
                    technicalDetails: 'Tune GC parameters or reduce object allocation',
                    expectedImprovement: 'Could reduce lag by 30-50%'
                });
            } else if (gcOverhead > 10) {
                analysis.recommendations.push({
                    priority: '⚠️ HIGH',
                    description: 'Consider GC optimization',
                    technicalDetails: 'Review GC frequency and duration patterns',
                    expectedImprovement: 'Could reduce lag by 10-20%'
                });
            }
        }
    }

    // Analizar threads para detectar contención (análisis simplificado)
    if (data.threads && data.threads.length > 0) {
        // Análisis básico basado en la cantidad de threads
        if (data.threads.length > 10) {
            analysis.threadContention = '⚠️ MODERATE - Many threads detected';
        } else if (data.threads.length > 5) {
            analysis.threadContention = '🟡 LOW - Several threads active';
        } else {
            analysis.threadContention = '✅ MINIMAL - Few threads';
        }

        // Análisis básico de I/O basado en nombres de nodos
        if (data.nodes?.allNodes) {
            const ioMethods = data.nodes.allNodes.filter(node => {
                const className = (node as any).className || '';
                const methodName = (node as any).methodName || '';
                const method = `${className}.${methodName}`.toLowerCase();
                return method.includes('read') || method.includes('write') || method.includes('save') || method.includes('load');
            });

            if (ioMethods.length > 50) {
                analysis.ioBottlenecks = '⚠️ MODERATE - Many I/O operations detected';
                analysis.recommendations.push({
                    priority: '⚠️ MEDIUM',
                    description: 'Monitor I/O patterns for optimization opportunities',
                    technicalDetails: 'Consider reducing save frequency or implementing async I/O',
                    expectedImprovement: 'Could reduce occasional lag spikes'
                });
            } else if (ioMethods.length > 20) {
                analysis.ioBottlenecks = '🟡 LOW - Some I/O activity';
            } else {
                analysis.ioBottlenecks = '✅ MINIMAL - Low I/O activity';
            }
        }
    }

    // Determinar fuente principal de lag basándose en el análisis
    if (analysis.constantLag.detected) {
        analysis.primaryLagSource = 'Constant Tick Processing Delays';
    } else if (analysis.lagSpikes.count > 0) {
        analysis.primaryLagSource = 'Intermittent Lag Spikes';
    } else if (analysis.memoryLeakRisk.includes('CRITICAL')) {
        analysis.primaryLagSource = 'Memory Pressure / GC Overhead';
    } else if (analysis.threadContention.includes('SEVERE')) {
        analysis.primaryLagSource = 'Thread Contention / Blocking';
    } else if (analysis.ioBottlenecks.includes('SEVERE')) {
        analysis.primaryLagSource = 'Disk I/O Bottlenecks';
    } else {
        analysis.primaryLagSource = 'No Major Issues Detected';
    }

    // Agregar recomendaciones generales si no hay críticas específicas
    if (analysis.recommendations.length === 0) {
        analysis.recommendations.push({
            priority: '✅ MAINTENANCE',
            description: 'Performance appears healthy - continue regular monitoring',
            technicalDetails: 'Consider periodic profiling to maintain optimal performance',
            expectedImprovement: 'Preventive maintenance'
        });
    }

    // Analizar causas comunes de lag spikes
    if (data.nodes?.allNodes) {
        const lagCauses = new Set<string>();
        
        data.nodes.allNodes.forEach(node => {
            const className = (node as any).className || '';
            const methodName = (node as any).methodName || '';
            const lagType = detectLagSource(className, methodName);
            if (lagType) {
                lagCauses.add(lagType);
            }
        });
        
        analysis.lagSpikes.commonCauses = Array.from(lagCauses);
    }

    return analysis;
}

// Función auxiliar para detectar mods/plugins basándose en nombres de clase
function detectModFromClassName(className: string): string | null {
    // Patrones conocidos de mods populares
    const modPatterns = [
        // Performance mods
        { pattern: /c2me/, name: 'c2me-opts-scheduling' },
        { pattern: /lithium/, name: 'lithium' },
        { pattern: /async/, name: 'async' },
        { pattern: /vmp/, name: 'vmp' },
        { pattern: /carpet/, name: 'carpet' },
        { pattern: /sodium/, name: 'sodium' },
        { pattern: /iris/, name: 'iris' },
        { pattern: /optifine/, name: 'optifine' },
        
        // Utility mods
        { pattern: /jei/, name: 'jei' },
        { pattern: /rei/, name: 'rei' },
        { pattern: /waila/, name: 'waila' },
        { pattern: /hwyla/, name: 'hwyla' },
        { pattern: /jade/, name: 'jade' },
        
        // World generation
        { pattern: /biomes/, name: 'biomes-o-plenty' },
        { pattern: /traverse/, name: 'traverse' },
        { pattern: /terraforged/, name: 'terraforged' },
        
        // Tech mods
        { pattern: /thermal/, name: 'thermal-expansion' },
        { pattern: /enderio/, name: 'ender-io' },
        { pattern: /mekanism/, name: 'mekanism' },
        { pattern: /applied/, name: 'applied-energistics' },
        { pattern: /botania/, name: 'botania' },
        { pattern: /forestry/, name: 'forestry' },
        { pattern: /industrialcraft/, name: 'industrial-craft' },
        { pattern: /buildcraft/, name: 'buildcraft' },
        
        // Magic mods
        { pattern: /thaumcraft/, name: 'thaumcraft' },
        { pattern: /ars/, name: 'ars-nouveau' },
        { pattern: /astral/, name: 'astral-sorcery' },
        
        // Adventure mods
        { pattern: /twilight/, name: 'twilight-forest' },
        { pattern: /aether/, name: 'aether' },
        { pattern: /betweenlands/, name: 'betweenlands' },
        
        // Fabric API
        { pattern: /fabric/, name: 'fabric-api' },
        { pattern: /quilt/, name: 'quilt' },
        
        // Forge
        { pattern: /forge/, name: 'minecraft-forge' },
        { pattern: /fml/, name: 'forge-mod-loader' },
        
        // Bukkit/Spigot plugins
        { pattern: /bukkit/, name: 'bukkit-plugin' },
        { pattern: /spigot/, name: 'spigot-plugin' },
        { pattern: /paper/, name: 'paper-plugin' },
        
        // Common plugin patterns
        { pattern: /essentials/, name: 'essentials' },
        { pattern: /worldedit/, name: 'worldedit' },
        { pattern: /worldguard/, name: 'worldguard' },
        { pattern: /vault/, name: 'vault' },
        { pattern: /luckperms/, name: 'luckperms' },
        { pattern: /griefprevention/, name: 'grief-prevention' },
        
        // Minecraft internals (no son mods, pero son útiles de identificar)
        { pattern: /net\.minecraft\.server/, name: 'minecraft-server' },
        { pattern: /net\.minecraft\.world/, name: 'minecraft-world' },
        { pattern: /net\.minecraft\.entity/, name: 'minecraft-entities' },
        { pattern: /net\.minecraft\.block/, name: 'minecraft-blocks' },
        { pattern: /net\.minecraft\.item/, name: 'minecraft-items' },
        { pattern: /net\.minecraft\.client/, name: 'minecraft-client' },
        
        // Java internals
        { pattern: /java\./, name: 'java-runtime' },
        { pattern: /jdk\./, name: 'jdk-internals' },
        { pattern: /sun\./, name: 'sun-internals' },
        { pattern: /com\.sun\./, name: 'sun-internals' },
    ];
    
    const lowerClassName = className.toLowerCase();
    
    for (const { pattern, name } of modPatterns) {
        if (pattern.test(lowerClassName)) {
            return name;
        }
    }
    
    // Si no coincide con ningún patrón conocido, intentar extraer el nombre del paquete
    const parts = className.split('.');
    if (parts.length >= 3 && !className.startsWith('java.') && !className.startsWith('net.minecraft.')) {
        // Probablemente es un mod/plugin personalizado
        return `${parts[0]}.${parts[1]} (custom)`;
    }
    
    return null;
}
