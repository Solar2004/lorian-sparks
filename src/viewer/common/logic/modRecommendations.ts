/**
 * Sistema de recomendaciones de mods basado en UsefulMods GitHub
 * Analiza problemas detectados y sugiere mods específicos por versión/plataforma
 */

export interface ModRecommendation {
    name: string;
    description: string;
    author: string;
    category: 'performance' | 'bugfix' | 'enhancement' | 'alternative';
    platforms: Platform[];
    versions: string[];
    links: {
        modrinth?: string;
        curseforge?: string;
        github?: string;
    };
    reason: string; // Por qué se recomienda este mod
    replaces?: string[]; // Qué plugins/mods reemplaza
}

export interface Platform {
    type: 'forge' | 'fabric' | 'neoforge' | 'quilt' | 'bukkit' | 'paper' | 'spigot' | 'purpur';
    versions: string[];
}

export interface ServerInfo {
    platform: string;
    version: string;
    mcVersion: string;
    installedPlugins: string[];
    detectedIssues: string[];
}

// Base de datos de recomendaciones basada en UsefulMods
const MOD_RECOMMENDATIONS: { [key: string]: ModRecommendation[] } = {
    // Problemas de rendimiento
    'performance_lag': [
        {
            name: 'Lithium',
            description: 'General-purpose optimization mod that focuses on physics, mob AI, and block ticking',
            author: 'CaffeineMC',
            category: 'performance',
            platforms: [{ type: 'fabric', versions: ['1.16+'] }],
            versions: ['1.16', '1.17', '1.18', '1.19', '1.20', '1.21'],
            links: {
                modrinth: 'https://modrinth.com/mod/lithium',
                github: 'https://github.com/CaffeineMC/lithium-fabric'
            },
            reason: 'Optimizes server-side performance without changing game mechanics',
            replaces: []
        },
        {
            name: 'Phosphor',
            description: 'Optimization mod that dramatically improves the performance of Minecraft\'s lighting engine',
            author: 'CaffeineMC',
            category: 'performance',
            platforms: [{ type: 'fabric', versions: ['1.16+'] }],
            versions: ['1.16', '1.17', '1.18', '1.19'],
            links: {
                modrinth: 'https://modrinth.com/mod/phosphor',
                github: 'https://github.com/CaffeineMC/phosphor-fabric'
            },
            reason: 'Improves lighting performance significantly',
            replaces: []
        },
        {
            name: 'Starlight',
            description: 'Rewrites the light engine to fix lighting performance and lighting errors',
            author: 'SpottedLeaf',
            category: 'performance',
            platforms: [
                { type: 'fabric', versions: ['1.17+'] },
                { type: 'forge', versions: ['1.18+'] }
            ],
            versions: ['1.17', '1.18', '1.19', '1.20', '1.21'],
            links: {
                modrinth: 'https://modrinth.com/mod/starlight',
                github: 'https://github.com/PaperMC/Starlight'
            },
            reason: 'Replaces vanilla lighting engine with much faster implementation',
            replaces: ['Phosphor']
        }
    ],

    // Mods de rendimiento para reemplazar plugins problemáticos
    'clearlag_detected': [
        {
            name: 'Entity Culling',
            description: 'Using async path-tracing to hide Block-/Entities that are not visible',
            author: 'tr9zw',
            category: 'performance',
            platforms: [
                { type: 'fabric', versions: ['1.16+'] },
                { type: 'forge', versions: ['1.16+'] }
            ],
            versions: ['1.16', '1.17', '1.18', '1.19', '1.20', '1.21'],
            links: {
                modrinth: 'https://modrinth.com/mod/entityculling',
                curseforge: 'https://www.curseforge.com/minecraft/mc-mods/entityculling'
            },
            reason: 'Proper entity optimization without the issues caused by laggy plugins',
            replaces: ['ClearLag', 'LagAssist', 'AntiLag']
        },
        {
            name: 'Bobby',
            description: 'Allows for render distances greater than the server\'s view-distance',
            author: 'Johni0702',
            category: 'performance',
            platforms: [
                { type: 'fabric', versions: ['1.16+'] }
            ],
            versions: ['1.16', '1.17', '1.18', '1.19', '1.20', '1.21'],
            links: {
                modrinth: 'https://modrinth.com/mod/bobby',
                curseforge: 'https://www.curseforge.com/minecraft/mc-mods/bobby'
            },
            reason: 'Client-side optimization for better chunk loading performance',
            replaces: []
        }
    ],

    // Detección de versiones obsoletas
    'outdated_version': [
        {
            name: 'Version Update Checker',
            description: 'Check for updates to your server platform',
            author: 'Community',
            category: 'enhancement',
            platforms: [
                { type: 'paper', versions: ['all'] },
                { type: 'purpur', versions: ['all'] },
                { type: 'fabric', versions: ['all'] }
            ],
            versions: ['all'],
            links: {},
            reason: 'Update to latest version for bug fixes and performance improvements',
            replaces: []
        }
    ],

    // Problemas de configuración
    'high_spawn_limits': [
        {
            name: 'Entity Limiting',
            description: 'Server-side configuration optimization',
            author: 'Paper/Purpur Teams',
            category: 'bugfix',
            platforms: [
                { type: 'paper', versions: ['1.16+'] },
                { type: 'purpur', versions: ['1.16+'] }
            ],
            versions: ['1.16', '1.17', '1.18', '1.19', '1.20', '1.21'],
            links: {},
            reason: 'Optimize spawn limits in bukkit.yml to reduce entity overhead',
            replaces: []
        }
    ],

    // Problemas JVM
    'missing_aikars_flags': [
        {
            name: 'Aikar\'s Flags',
            description: 'Optimized JVM flags for Minecraft servers',
            author: 'Aikar',
            category: 'performance',
            platforms: [
                { type: 'paper', versions: ['all'] },
                { type: 'purpur', versions: ['all'] },
                { type: 'bukkit', versions: ['all'] }
            ],
            versions: ['all'],
            links: {
                github: 'https://docs.papermc.io/paper/aikars-flags'
            },
            reason: 'Implement proper JVM flags for optimal garbage collection',
            replaces: []
        }
    ],

    // Mods para mejorar performance en servidores con muchas entidades
    'high_entity_count': [
        {
            name: 'Cull Leaves',
            description: 'Adds culling to leaf blocks, providing a huge performance boost over vanilla',
            author: 'Motschen',
            category: 'performance',
            platforms: [
                { type: 'fabric', versions: ['1.16+'] },
                { type: 'forge', versions: ['1.16+'] }
            ],
            versions: ['1.16', '1.17', '1.18', '1.19', '1.20', '1.21'],
            links: {
                modrinth: 'https://modrinth.com/mod/cull-leaves',
                curseforge: 'https://www.curseforge.com/minecraft/mc-mods/cull-leaves'
            },
            reason: 'Improves FPS by culling unnecessary leaf block faces',
            replaces: []
        },
        {
            name: 'Noisium',
            description: 'Optimises worldgen performance for a better experience',
            author: 'Steveplays',
            category: 'performance',
            platforms: [
                { type: 'fabric', versions: ['1.18+'] }
            ],
            versions: ['1.18', '1.19', '1.20', '1.21'],
            links: {
                modrinth: 'https://modrinth.com/mod/noisium',
                github: 'https://github.com/Steveplays28/noisium'
            },
            reason: 'Significantly improves world generation performance',
            replaces: []
        }
    ]
};

// Sistema de mapeo de problemas a recomendaciones
const ISSUE_TO_RECOMMENDATIONS: { [key: string]: string[] } = {
    'ClearLag': ['clearlag_detected'],
    'LagAssist': ['clearlag_detected'],
    'AntiLag': ['clearlag_detected'],
    'NoMobLag': ['clearlag_detected'],
    'ServerBooster': ['clearlag_detected'],
    'UltimateStacker': ['clearlag_detected'],
    'StackMob': ['clearlag_detected'],
    'MobStacker': ['clearlag_detected'],
    'WildStacker': ['clearlag_detected'],
    'outdated_version': ['outdated_version'],
    'high_tps_variance': ['performance_lag'],
    'high_mspt': ['performance_lag'],
    'performance_lag': ['performance_lag'],
    'missing_aikars_flags': ['missing_aikars_flags'],
    'high_spawn_limits': ['high_spawn_limits'],
    'high_entity_count': ['high_entity_count']
};

export class ModRecommendationEngine {
    /**
     * Genera recomendaciones de mods basadas en la información del servidor y problemas detectados
     */
    public static generateRecommendations(serverInfo: ServerInfo): ModRecommendation[] {
        const recommendations: ModRecommendation[] = [];
        const usedCategories = new Set<string>();

        // Analizar problemas detectados
        serverInfo.detectedIssues.forEach(issue => {
            const recommendationKeys = ISSUE_TO_RECOMMENDATIONS[issue] || [];
            
            recommendationKeys.forEach(key => {
                const categoryRecommendations = MOD_RECOMMENDATIONS[key] || [];
                
                categoryRecommendations.forEach(mod => {
                    // Verificar compatibilidad de plataforma
                    const isCompatible = mod.platforms.some(platform => 
                        this.isPlatformCompatible(platform, serverInfo)
                    );
                    
                    // Verificar compatibilidad de versión
                    const isVersionCompatible = this.isVersionCompatible(mod, serverInfo);
                    
                    if (isCompatible && isVersionCompatible && !usedCategories.has(`${mod.name}-${key}`)) {
                        recommendations.push(mod);
                        usedCategories.add(`${mod.name}-${key}`);
                    }
                });
            });
        });

        // Analizar plugins instalados para encontrar reemplazos
        serverInfo.installedPlugins.forEach(plugin => {
            const recommendationKeys = ISSUE_TO_RECOMMENDATIONS[plugin] || [];
            
            recommendationKeys.forEach(key => {
                const categoryRecommendations = MOD_RECOMMENDATIONS[key] || [];
                
                categoryRecommendations.forEach(mod => {
                    if (mod.replaces && mod.replaces.includes(plugin)) {
                        const isCompatible = mod.platforms.some(platform => 
                            this.isPlatformCompatible(platform, serverInfo)
                        );
                        
                        if (isCompatible && !usedCategories.has(`${mod.name}-${key}`)) {
                            recommendations.push({
                                ...mod,
                                reason: `Replace ${plugin}: ${mod.reason}`
                            });
                            usedCategories.add(`${mod.name}-${key}`);
                        }
                    }
                });
            });
        });

        return recommendations;
    }

    private static isPlatformCompatible(platform: Platform, serverInfo: ServerInfo): boolean {
        const serverPlatform = serverInfo.platform.toLowerCase();
        
        // Mapeo de compatibilidad de plataformas
        if (platform.type === 'bukkit' || platform.type === 'paper' || platform.type === 'spigot' || platform.type === 'purpur') {
            return ['bukkit', 'paper', 'spigot', 'purpur'].some(p => serverPlatform.includes(p));
        }
        
        if (platform.type === 'fabric' || platform.type === 'forge' || platform.type === 'neoforge' || platform.type === 'quilt') {
            return serverPlatform.includes(platform.type);
        }
        
        return false;
    }

    private static isVersionCompatible(mod: ModRecommendation, serverInfo: ServerInfo): boolean {
        // Si el mod soporta "all", es compatible
        if (mod.versions.includes('all')) {
            return true;
        }
        
        // Verificar si la versión del servidor está en la lista de versiones soportadas
        const serverVersion = this.normalizeVersion(serverInfo.mcVersion);
        return mod.versions.some(version => {
            const modVersion = this.normalizeVersion(version);
            return this.isVersionInRange(serverVersion, modVersion);
        });
    }

    private static normalizeVersion(version: string): string {
        // Normalizar versiones (ej: "1.20.4" -> "1.20", "1.16+" -> "1.16")
        return version.replace(/\+$/, '').split('.').slice(0, 2).join('.');
    }

    private static isVersionInRange(serverVersion: string, modVersion: string): boolean {
        const [serverMajor, serverMinor] = serverVersion.split('.').map(Number);
        const [modMajor, modMinor] = modVersion.split('.').map(Number);
        
        // Verificar si la versión del servidor es compatible
        if (serverMajor === modMajor && serverMinor >= modMinor) {
            return true;
        }
        
        return serverVersion === modVersion;
    }

    /**
     * Obtiene recomendaciones específicas por categoría
     */
    public static getRecommendationsByCategory(category: string, serverInfo: ServerInfo): ModRecommendation[] {
        const categoryRecommendations = MOD_RECOMMENDATIONS[category] || [];
        
        return categoryRecommendations.filter(mod => {
            const isCompatible = mod.platforms.some(platform => 
                this.isPlatformCompatible(platform, serverInfo)
            );
            const isVersionCompatible = this.isVersionCompatible(mod, serverInfo);
            
            return isCompatible && isVersionCompatible;
        });
    }

    /**
     * Busca alternativas para un plugin específico
     */
    public static findAlternatives(pluginName: string, serverInfo: ServerInfo): ModRecommendation[] {
        const recommendations: ModRecommendation[] = [];
        
        Object.values(MOD_RECOMMENDATIONS).forEach(categoryMods => {
            categoryMods.forEach(mod => {
                if (mod.replaces && mod.replaces.includes(pluginName)) {
                    const isCompatible = mod.platforms.some(platform => 
                        this.isPlatformCompatible(platform, serverInfo)
                    );
                    
                    if (isCompatible && this.isVersionCompatible(mod, serverInfo)) {
                        recommendations.push(mod);
                    }
                }
            });
        });
        
        return recommendations;
    }
}
