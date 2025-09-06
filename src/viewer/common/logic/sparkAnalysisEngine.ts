/**
 * Spark Analysis Engine - Replica la funcionalidad del bot de Discord scanner-repo
 * Analiza configuraciones del servidor, plugins, JVM y performance metrics
 * Incluye recomendaciones de mods basadas en UsefulMods GitHub
 */

import SamplerData from '../../sampler/SamplerData';
import { ModRecommendationEngine, ModRecommendation, ServerInfo } from './modRecommendations';

export interface AnalysisField {
    name: string;
    value: string;
    inline?: boolean;
    prefix?: string;
    suffix?: string;
}

export interface AnalysisResult {
    fields: AnalysisField[];
    overallRating: string;
    criticalAlerts: string[];
    recommendations: string[];
    serverAnalysis: ServerAnalysis;
    pluginAnalysis: PluginAnalysis;
    jvmAnalysis: JVMAnalysis;
    performanceMetrics: PerformanceMetrics;
    modRecommendations: ModRecommendation[];
}

export interface ServerAnalysis {
    platform: string;
    version: string;
    mcVersion: string;
    isOutdated: boolean;
    configIssues: ConfigIssue[];
}

export interface PluginAnalysis {
    totalPlugins: number;
    problematicPlugins: ProblematicPlugin[];
    recommendations: string[];
}

export interface ProblematicPlugin {
    name: string;
    issue: string;
    recommendation: string;
    severity: 'critical' | 'warning' | 'info';
}

export interface ConfigIssue {
    configFile: string;
    setting: string;
    currentValue: any;
    recommendedValue: any;
    description: string;
    severity: 'critical' | 'warning' | 'info';
}

export interface JVMAnalysis {
    flags: string[];
    memoryAnalysis: MemoryAnalysis;
    gcAnalysis: GCAnalysis;
    recommendations: string[];
    criticalIssues: string[];
}

export interface MemoryAnalysis {
    allocatedRAM: number;
    usedRAM: number;
    maxRAM: number;
    usagePercentage: number;
    isMemoryLow: boolean;
    memoryRecommendations: string[];
}

export interface GCAnalysis {
    gcType: string;
    totalCollections: number;
    totalGCTime: number;
    averageGCTime: number;
    gcOverhead: number;
    gcRecommendations: string[];
}

export interface PerformanceMetrics {
    averageTPS: number;
    tpsStability: string;
    averageMSPT: number;
    lagSpikes: number;
    maxLagSpike: number;
    entityCount: number;
    playerCount: number;
    chunkCount: number;
    performanceRating: string;
}

// Configuraciones conocidas problemáticas (del bot)
const PROBLEMATIC_PLUGINS = {
    'ClearLag': {
        issue: 'Plugins that claim to remove lag actually cause more lag.',
        severity: 'critical' as const
    },
    'LagAssist': {
        issue: 'LagAssist should only be used for analytics and preventative measures. All other features should be disabled.',
        severity: 'warning' as const
    },
    'NoMobLag': {
        issue: 'Plugins that claim to remove lag actually cause more lag.',
        severity: 'critical' as const
    },
    'ServerBooster': {
        issue: 'Plugins that claim to remove lag actually cause more lag.',
        severity: 'critical' as const
    },
    'AntiLag': {
        issue: 'Plugins that claim to remove lag actually cause more lag.',
        severity: 'critical' as const
    },
    'BookLimiter': {
        issue: "You don't need BookLimiter as Paper already fixes all crash bugs.",
        severity: 'warning' as const
    },
    'LimitPillagers': {
        issue: 'LimitPillagers is not useful in 1.15 and above.',
        severity: 'info' as const
    },
    'VillagerOptimiser': {
        issue: 'VillagerOptimiser is not useful in 1.15 and above.',
        severity: 'info' as const
    },
    'StackMob': {
        issue: 'Stacking mobs causes more lag.',
        severity: 'critical' as const
    },
    'Stacker': {
        issue: 'Stacking mobs causes more lag.',
        severity: 'critical' as const
    },
    'MobStacker': {
        issue: 'Stacking mobs causes more lag.',
        severity: 'critical' as const
    },
    'WildStacker': {
        issue: 'Stacking mobs causes more lag.',
        severity: 'critical' as const
    },
    'UltimateStacker': {
        issue: 'Stacking plugins actually cause more lag. Remove UltimateStacker.',
        severity: 'critical' as const
    },
    'FastAsyncWorldEdit': {
        issue: 'FAWE has been known to cause issues. Consider replacing FAWE with WorldEdit.',
        severity: 'warning' as const
    },
    'IllegalStack': {
        issue: "You probably don't need IllegalStack as Paper already fixes all dupe and crash bugs.",
        severity: 'info' as const
    },
    'ExploitFixer': {
        issue: "You probably don't need ExploitFixer as Paper already fixes all dupe and crash bugs.",
        severity: 'info' as const
    },
    'EntityTrackerFixer': {
        issue: "You don't need EntityTrackerFixer as Paper already has its features.",
        severity: 'info' as const
    },
    'Orebfuscator': {
        issue: "You don't need Orebfuscator as Paper already has its features.",
        severity: 'info' as const
    },
    'GroupManager': {
        issue: 'GroupManager is an outdated permission plugin. Consider replacing it with LuckPerms.',
        severity: 'warning' as const
    },
    'PermissionsEx': {
        issue: 'PermissionsEx is an outdated permission plugin. Consider replacing it with LuckPerms.',
        severity: 'warning' as const
    },
    'bPermissions': {
        issue: 'bPermissions is an outdated permission plugin. Consider replacing it with LuckPerms.',
        severity: 'warning' as const
    },
    'PhantomSMP': {
        issue: "You probably don't need PhantomSMP as Paper already has its features.",
        severity: 'info' as const
    },
    'PacketLimiter': {
        issue: "You don't need PacketLimiter as Paper already has its features.",
        severity: 'info' as const
    },
    'EpicHeads': {
        issue: 'This plugin was made by Songoda. Songoda is sketchy. You should find an alternative such as HeadsPlus or HeadDatabase.',
        severity: 'warning' as const
    }
};

const PROBLEMATIC_SERVERS = [
    {
        name: 'Yatopia',
        issue: 'Yatopia is prone to bugs and is no longer in development. Consider using Purpur for the closest replacement.'
    }
];

// Configuraciones óptimas para Paper/Bukkit/Spigot
const OPTIMAL_CONFIG_VALUES = {
    'bukkit.yml': {
        'chunk-gc.period-in-ticks': { optimal: 400, check: (val: any) => typeof val === 'number' && val >= 600 },
        'ticks-per.monster-spawns': { optimal: 4, check: (val: any) => typeof val === 'number' && val === 1 },
        'spawn-limits.monsters': { optimal: 15, check: (val: any) => typeof val === 'number' && val >= 70 },
        'spawn-limits.water-ambient': { optimal: 5, check: (val: any) => typeof val === 'number' && val >= 20 },
        'spawn-limits.ambient': { optimal: 1, check: (val: any) => typeof val === 'number' && val >= 15 },
        'spawn-limits.animals': { optimal: 5, check: (val: any) => typeof val === 'number' && val >= 10 },
        'spawn-limits.water-animals': { optimal: 5, check: (val: any) => typeof val === 'number' && val >= 15 }
    },
    'server.properties': {
        'network-compression-threshold': { optimal: 512, check: (val: any) => typeof val === 'number' && val <= 256 },
        'simulation-distance': { optimal: 5, check: (val: any) => typeof val === 'number' && val >= 9 }
    },
    'paper-world-defaults.yml': {
        'chunks.max-auto-save-chunks-per-tick': { optimal: 6, check: (val: any) => typeof val === 'number' && val >= 24 },
        'environment.optimize-explosions': { optimal: true, check: (val: any) => typeof val === 'boolean' && val === false },
        'tick-rates.mob-spawner': { optimal: 2, check: (val: any) => typeof val === 'number' && val === 1 },
        'tick-rates.container-update': { optimal: 3, check: (val: any) => typeof val === 'number' && val === 1 },
        'tick-rates.grass-spread': { optimal: 4, check: (val: any) => typeof val === 'number' && val === 1 },
        'entities.behavior.disable-chest-cat-detection': { optimal: true, check: (val: any) => typeof val === 'boolean' && val === false },
        'hopper.disable-move-event': { optimal: true, check: (val: any) => typeof val === 'boolean' && val === false },
        'entities.spawning.per-player-mob-spawns': { optimal: true, check: (val: any) => typeof val === 'boolean' && val === false },
        'chunks.prevent-moving-into-unloaded-chunks': { optimal: true, check: (val: any) => typeof val === 'boolean' && val === false },
        'misc.redstone-implementation': { optimal: 'ALTERNATE_CURRENT', check: (val: any) => typeof val === 'string' && val !== 'ALTERNATE_CURRENT' },
        'collisions.fix-climbing-bypassing-cramming-rule': { optimal: true, check: (val: any) => typeof val === 'boolean' && val === false },
        'entities.armor-stands.do-collision-entity-lookups': { optimal: false, check: (val: any) => typeof val === 'boolean' && val === true },
        'entities.armor-stands.tick': { optimal: false, check: (val: any) => typeof val === 'boolean' && val === true },
        'entities.spawning.alt-item-despawn-rate.enabled': { optimal: true, check: (val: any) => typeof val === 'boolean' && val === false }
    }
};

export class SparkAnalysisEngine {
    private data: SamplerData;

    constructor(data: SamplerData) {
        this.data = data;
    }

    public async performFullAnalysis(): Promise<AnalysisResult> {
        const fields: AnalysisField[] = [];
        const criticalAlerts: string[] = [];
        const recommendations: string[] = [];

        // Análisis del servidor
        const serverAnalysis = this.analyzeServer();
        
        // Análisis de plugins
        const pluginAnalysis = this.analyzePlugins();

        // Análisis de JVM
        const jvmAnalysis = this.analyzeJVM();

        // Análisis de performance
        const performanceMetrics = this.analyzePerformance();

        // Determinar rating general
        const overallRating = this.calculateOverallRating(performanceMetrics);

        // Compilar alertas críticas y recomendaciones
        criticalAlerts.push(...serverAnalysis.configIssues.filter(i => i.severity === 'critical').map(i => i.description));
        criticalAlerts.push(...pluginAnalysis.problematicPlugins.filter(p => p.severity === 'critical').map(p => p.issue));
        criticalAlerts.push(...jvmAnalysis.criticalIssues);

        recommendations.push(...serverAnalysis.configIssues.filter(i => i.severity !== 'critical').map(i => i.description));
        recommendations.push(...pluginAnalysis.recommendations);
        recommendations.push(...jvmAnalysis.recommendations);

        // Generar recomendaciones de mods basadas en problemas detectados
        const modRecommendations = this.generateModRecommendations(serverAnalysis, pluginAnalysis, jvmAnalysis);

        // Generar fields para compatibilidad con el formato original
        fields.push(...this.generateAnalysisFields(serverAnalysis, pluginAnalysis, jvmAnalysis, performanceMetrics));

        return {
            fields,
            overallRating,
            criticalAlerts,
            recommendations,
            serverAnalysis,
            pluginAnalysis,
            jvmAnalysis,
            performanceMetrics,
            modRecommendations
        };
    }

    private analyzeServer(): ServerAnalysis {
        const metadata = this.data.metadata;
        const configIssues: ConfigIssue[] = [];

        if (!metadata?.platform) {
            return {
                platform: 'Unknown',
                version: 'Unknown',
                mcVersion: 'Unknown',
                isOutdated: false,
                configIssues: []
            };
        }

        const platform = metadata.platform.name || 'Unknown';
        const version = metadata.platform.version || 'Unknown';
        const mcVersion = metadata.platform.minecraftVersion || 'Unknown';

        // Verificar si la versión de MC está actualizada
        let isOutdated = false;
        if (mcVersion !== 'Unknown') {
            // Esta lógica se puede mejorar con una API real para obtener la última versión
            // Por ahora, asumimos que versiones anteriores a 1.20 están desactualizadas
            const versionNumber = parseFloat(mcVersion.replace(/[^\d.]/g, ''));
            isOutdated = versionNumber < 1.20;
        }

        // Analizar configuraciones si están disponibles
        if (metadata.serverConfigurations) {
            const configs = metadata.serverConfigurations;

            // Analizar bukkit.yml
            if (configs['bukkit.yml']) {
                try {
                    const bukkit = JSON.parse(configs['bukkit.yml']);
                    configIssues.push(...this.analyzeConfig(bukkit, 'bukkit.yml'));
                } catch (e) {
                    console.warn('Error parsing bukkit.yml configuration');
                }
            }

            // Analizar server.properties
            if (configs['server.properties']) {
                try {
                    const serverProps = JSON.parse(configs['server.properties']);
                    configIssues.push(...this.analyzeConfig(serverProps, 'server.properties'));
                } catch (e) {
                    console.warn('Error parsing server.properties configuration');
                }
            }

            // Analizar paper configuraciones
            if (configs['paper/']) {
                try {
                    const paper = JSON.parse(configs['paper/']);
                    configIssues.push(...this.analyzeConfig(paper, 'paper-world-defaults.yml'));
                } catch (e) {
                    console.warn('Error parsing paper configuration');
                }
            }
        }

        return {
            platform,
            version,
            mcVersion,
            isOutdated,
            configIssues
        };
    }

    private analyzeConfig(config: any, configType: string): ConfigIssue[] {
        const issues: ConfigIssue[] = [];
        const optimalConfigs = OPTIMAL_CONFIG_VALUES[configType as keyof typeof OPTIMAL_CONFIG_VALUES];

        if (!optimalConfigs) return issues;

        for (const [settingPath, optimal] of Object.entries(optimalConfigs)) {
            const currentValue = this.getNestedValue(config, settingPath);
            
            if (currentValue !== undefined && optimal.check(currentValue)) {
                issues.push({
                    configFile: configType,
                    setting: settingPath,
                    currentValue,
                    recommendedValue: optimal.optimal,
                    description: `${settingPath} should be set to ${optimal.optimal} in ${configType}`,
                    severity: this.getConfigSeverity(settingPath)
                });
            }
        }

        return issues;
    }

    private analyzePlugins(): PluginAnalysis {
        const metadata = this.data.metadata;
        const problematicPlugins: ProblematicPlugin[] = [];
        const recommendations: string[] = [];

        if (!metadata?.sources) {
            return {
                totalPlugins: 0,
                problematicPlugins: [],
                recommendations: []
            };
        }

        const plugins = Object.values(metadata.sources);
        const totalPlugins = plugins.length;

        // Analizar cada plugin
        plugins.forEach(plugin => {
            const pluginInfo = plugin as any;
            const pluginName = pluginInfo.name;

            // Verificar si es un plugin problemático conocido
            if (PROBLEMATIC_PLUGINS[pluginName as keyof typeof PROBLEMATIC_PLUGINS]) {
                const issue = PROBLEMATIC_PLUGINS[pluginName as keyof typeof PROBLEMATIC_PLUGINS];
                problematicPlugins.push({
                    name: pluginName,
                    issue: issue.issue,
                    recommendation: `Consider removing or replacing ${pluginName}`,
                    severity: issue.severity
                });
            }

            // Verificar si es de Songoda (problemas conocidos)
            if (pluginInfo.authors && typeof pluginInfo.authors === 'string' && 
                pluginInfo.authors.toLowerCase().includes('songoda')) {
                problematicPlugins.push({
                    name: pluginName,
                    issue: 'This plugin was made by Songoda. Songoda is sketchy. You should find an alternative.',
                    recommendation: `Replace ${pluginName} with a trusted alternative`,
                    severity: 'warning'
                });
            }
        });

        // Generar recomendaciones generales
        if (problematicPlugins.length > 0) {
            recommendations.push(`Found ${problematicPlugins.length} problematic plugin(s) that may cause performance issues`);
        }

        if (totalPlugins > 50) {
            recommendations.push('You have many plugins installed. Consider removing unused ones to improve performance.');
        }

        return {
            totalPlugins,
            problematicPlugins,
            recommendations
        };
    }

    private analyzeJVM(): JVMAnalysis {
        const systemStats = this.data.metadata?.systemStatistics;
        const platformStats = this.data.metadata?.platformStatistics;
        
        const flags: string[] = [];
        const recommendations: string[] = [];
        const criticalIssues: string[] = [];

        let memoryAnalysis: MemoryAnalysis = {
            allocatedRAM: 0,
            usedRAM: 0,
            maxRAM: 0,
            usagePercentage: 0,
            isMemoryLow: false,
            memoryRecommendations: []
        };

        let gcAnalysis: GCAnalysis = {
            gcType: 'Unknown',
            totalCollections: 0,
            totalGCTime: 0,
            averageGCTime: 0,
            gcOverhead: 0,
            gcRecommendations: []
        };

        // Analizar flags de JVM
        if (systemStats?.java?.vmArgs) {
            const vmArgs = systemStats.java.vmArgs;
            flags.push(...vmArgs.split(' ').filter(arg => arg.startsWith('-')));

            // Verificar Aikar's flags
            if (!vmArgs.includes('-Daikars.new.flags=true')) {
                if (vmArgs.includes('-Dusing.aikars.flags=mcflags.emc.gs')) {
                    criticalIssues.push("You're using outdated Aikar's flags. Update to the latest version.");
                } else {
                    criticalIssues.push("You should use Aikar's flags for optimal performance.");
                }
            } else {
                // Verificar flags actualizados de Aikar
                if (!vmArgs.includes('-XX:+PerfDisableSharedMem')) {
                    recommendations.push('Add -XX:+PerfDisableSharedMem to your JVM flags.');
                }
                if (!vmArgs.includes('-XX:G1MixedGCCountTarget=4')) {
                    recommendations.push('Add -XX:G1MixedGCCountTarget=4 to your JVM flags.');
                }
            }

            // Verificar ZGC con poca memoria
            if (vmArgs.includes('-XX:+UseZGC')) {
                const xmxMatch = vmArgs.match(/-Xmx(\d+)([GM]?)/);
                if (xmxMatch) {
                    let maxMem = parseInt(xmxMatch[1]);
                    const unit = xmxMatch[2];
                    if (unit === 'G') maxMem *= 1000;
                    if (maxMem < 10000) { // Menos de 10GB
                        criticalIssues.push('ZGC is only good with a lot of memory (10GB+). Consider using G1GC instead.');
                    }
                }
            }
        }

        // Analizar memoria
        if (platformStats?.memory?.heap) {
            const heap = platformStats.memory.heap;
            const usedMB = Number(heap.used) / 1024 / 1024;
            const maxMB = heap.max ? Number(heap.max) / 1024 / 1024 : 0;
            const usagePercentage = maxMB > 0 ? (usedMB / maxMB * 100) : 0;

            memoryAnalysis = {
                allocatedRAM: maxMB,
                usedRAM: usedMB,
                maxRAM: maxMB,
                usagePercentage,
                isMemoryLow: maxMB < 5400, // Menos de ~5.4GB
                memoryRecommendations: []
            };

            if (memoryAnalysis.isMemoryLow) {
                memoryAnalysis.memoryRecommendations.push('Allocate at least 6-10GB of RAM to your server if possible.');
            }

            if (usagePercentage > 85) {
                criticalIssues.push('High memory usage detected. Consider increasing heap size or optimizing memory usage.');
            }

            // Verificar memoria vs jugadores
            const playerCount = platformStats?.playerCount || 0;
            if (playerCount > 0 && maxMB > 0) {
                const memoryPerPlayer = maxMB / playerCount;
                if (memoryPerPlayer < 200 && maxMB < 10000) { // Menos de 200MB por jugador y menos de 10GB total
                    recommendations.push('You should use more RAM with this many players.');
                }
            }
        }

        // Analizar Garbage Collection
        if (platformStats?.gc) {
            let totalCollections = 0;
            let totalTime = 0;
            const gcTypes = Object.keys(platformStats.gc);

            Object.values(platformStats.gc).forEach(gc => {
                totalCollections += gc.total;
                totalTime += gc.total * gc.avgTime;
            });

            const averageGCTime = totalCollections > 0 ? totalTime / totalCollections : 0;
            
            // Calcular overhead de GC
            const samplingTime = this.data.metadata?.endTime && this.data.metadata?.startTime 
                ? Number(this.data.metadata.endTime) - Number(this.data.metadata.startTime) 
                : 0;
            const gcOverhead = samplingTime > 0 ? (totalTime / samplingTime * 100) : 0;

            gcAnalysis = {
                gcType: gcTypes.join(', '),
                totalCollections,
                totalGCTime: totalTime,
                averageGCTime,
                gcOverhead,
                gcRecommendations: []
            };

            if (gcOverhead > 20) {
                criticalIssues.push(`Critical GC overhead: ${gcOverhead.toFixed(2)}% - severe performance impact`);
                gcAnalysis.gcRecommendations.push('Optimize garbage collection immediately - tune GC parameters or reduce object allocation');
            } else if (gcOverhead > 10) {
                gcAnalysis.gcRecommendations.push('Consider GC optimization - review GC frequency and duration patterns');
            }

            if (averageGCTime > 100) {
                gcAnalysis.gcRecommendations.push('High average GC time detected - consider tuning garbage collection');
            }
        }

        // Verificar CPU threads
        if (systemStats?.cpu?.threads) {
            const threads = systemStats.cpu.threads;
            if (threads <= 2) {
                criticalIssues.push(`You only have ${threads} thread(s). Consider finding a better host with more CPU threads.`);
            }
        }

        return {
            flags,
            memoryAnalysis,
            gcAnalysis,
            recommendations,
            criticalIssues
        };
    }

    private analyzePerformance(): PerformanceMetrics {
        const platformStats = this.data.metadata?.platformStatistics;

        let averageTPS = 20;
        let tpsStability = 'Unknown';
        let averageMSPT = 0;
        let lagSpikes = 0;
        let maxLagSpike = 0;
        let performanceRating = 'Unknown';

        // Analizar TPS
        if (platformStats?.tps) {
            const tps = platformStats.tps;
            averageTPS = (tps.last1M + tps.last5M + tps.last15M) / 3;
            
            // Determinar estabilidad
            const tpsVariance = Math.abs(tps.last1M - tps.last15M);
            if (tpsVariance < 0.5) {
                tpsStability = 'Stable';
            } else if (tpsVariance < 2.0) {
                tpsStability = 'Unstable';
            } else {
                tpsStability = 'Highly Unstable';
            }
        }

        // Analizar MSPT
        if (platformStats?.mspt?.last1M) {
            const mspt = platformStats.mspt.last1M;
            averageMSPT = mspt.mean || 0;
            maxLagSpike = mspt.max || 0;

            // Contar lag spikes (ticks > 100ms)
            if (maxLagSpike > 100) {
                lagSpikes = Math.floor(maxLagSpike / 100);
            }
        }

        // Determinar rating de performance
        if (averageTPS >= 19.5) {
            performanceRating = 'Excellent';
        } else if (averageTPS >= 18.0) {
            performanceRating = 'Good';
        } else if (averageTPS >= 15.0) {
            performanceRating = 'Fair';
        } else if (averageTPS >= 10.0) {
            performanceRating = 'Poor';
        } else {
            performanceRating = 'Critical';
        }

        return {
            averageTPS,
            tpsStability,
            averageMSPT,
            lagSpikes,
            maxLagSpike,
            entityCount: platformStats?.world?.totalEntities || 0,
            playerCount: platformStats?.playerCount || 0,
            chunkCount: 0, // Esta información no siempre está disponible
            performanceRating
        };
    }

    private calculateOverallRating(performance: PerformanceMetrics): string {
        const tps = performance.averageTPS;
        
        if (tps >= 19.5) {
            return '🟢 EXCELLENT (A+)';
        } else if (tps >= 18.0) {
            return '🟡 GOOD (B+)';
        } else if (tps >= 15.0) {
            return '🟠 FAIR (C)';
        } else if (tps >= 10.0) {
            return '🔴 POOR (D)';
        } else {
            return '🚨 CRITICAL (F)';
        }
    }

    private generateAnalysisFields(
        serverAnalysis: ServerAnalysis,
        pluginAnalysis: PluginAnalysis,
        jvmAnalysis: JVMAnalysis,
        performanceMetrics: PerformanceMetrics
    ): AnalysisField[] {
        const fields: AnalysisField[] = [];

        // Performance overview
        if (performanceMetrics.averageTPS < 19) {
            fields.push({
                name: `${performanceMetrics.performanceRating} Performance`,
                value: `Average TPS: ${performanceMetrics.averageTPS.toFixed(2)} (${performanceMetrics.tpsStability})`,
                inline: true,
                prefix: performanceMetrics.averageTPS < 15 ? '❌' : '⚠️'
            });
        }

        // Server version check
        if (serverAnalysis.isOutdated) {
            fields.push({
                name: 'Outdated',
                value: `You are using ${serverAnalysis.mcVersion}. Consider updating to the latest version.`,
                inline: true,
                prefix: '❌'
            });
        }

        // Config issues
        serverAnalysis.configIssues.slice(0, 10).forEach(issue => {
            fields.push({
                name: issue.setting,
                value: `${issue.description}. Recommended: ${issue.recommendedValue}`,
                inline: true,
                prefix: issue.severity === 'critical' ? '❌' : '⚠️'
            });
        });

        // Plugin issues
        pluginAnalysis.problematicPlugins.slice(0, 5).forEach(plugin => {
            fields.push({
                name: plugin.name,
                value: plugin.issue,
                inline: true,
                prefix: plugin.severity === 'critical' ? '❌' : '⚠️'
            });
        });

        // JVM issues
        jvmAnalysis.criticalIssues.slice(0, 3).forEach(issue => {
            fields.push({
                name: 'JVM Configuration',
                value: issue,
                inline: true,
                prefix: '❌'
            });
        });

        // Memory issues
        if (jvmAnalysis.memoryAnalysis.isMemoryLow) {
            fields.push({
                name: 'Low Memory',
                value: 'Allocate at least 6-10GB of RAM to your server if you can afford it.',
                inline: true,
                prefix: '❌'
            });
        }

        return fields;
    }

    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    private getConfigSeverity(settingPath: string): 'critical' | 'warning' | 'info' {
        // Configuraciones críticas que afectan significativamente el rendimiento
        const criticalSettings = [
            'spawn-limits.monsters',
            'ticks-per.monster-spawns',
            'environment.optimize-explosions',
            'entities.spawning.per-player-mob-spawns'
        ];

        if (criticalSettings.some(setting => settingPath.includes(setting))) {
            return 'critical';
        }

        return 'warning';
    }

    private generateModRecommendations(serverAnalysis: ServerAnalysis, pluginAnalysis: PluginAnalysis, jvmAnalysis: JVMAnalysis): ModRecommendation[] {
        const detectedIssues: string[] = [];
        const installedPlugins: string[] = [];

        // Mapear problemas detectados a issues conocidos
        if (serverAnalysis.isOutdated) {
            detectedIssues.push('outdated_version');
        }

        // Problemas de configuración
        const highSpawnLimits = serverAnalysis.configIssues.some(issue => 
            issue.setting.includes('spawn-limits') || issue.setting.includes('monster-spawns')
        );
        if (highSpawnLimits) {
            detectedIssues.push('high_spawn_limits');
        }

        // Problemas de plugins
        pluginAnalysis.problematicPlugins.forEach(plugin => {
            detectedIssues.push(plugin.name);
            installedPlugins.push(plugin.name);
        });

        // Problemas de JVM
        if (jvmAnalysis.criticalIssues.some(issue => issue.includes('Aikar'))) {
            detectedIssues.push('missing_aikars_flags');
        }

        // Problemas de rendimiento - agregar si es necesario
        // Si TPS es bajo o MSPT es alto, recomendar mods de performance
        if (this.data.metadata?.platformStatistics?.tps) {
            const tps = this.data.metadata.platformStatistics.tps;
            const avgTps = (tps.last1M + tps.last5M + tps.last15M) / 3;
            if (avgTps < 19) {
                detectedIssues.push('performance_lag');
            }
        }

        // Problemas de alto número de entidades
        const entityCount = this.data.metadata?.platformStatistics?.world?.totalEntities || 0;
        if (entityCount > 3000) {
            detectedIssues.push('high_entity_count');
        }

        // Crear información del servidor para el motor de recomendaciones
        const serverInfo: ServerInfo = {
            platform: serverAnalysis.platform,
            version: serverAnalysis.version,
            mcVersion: serverAnalysis.mcVersion,
            installedPlugins: installedPlugins,
            detectedIssues: detectedIssues
        };

        // Generar recomendaciones usando el motor
        return ModRecommendationEngine.generateRecommendations(serverInfo);
    }
}
