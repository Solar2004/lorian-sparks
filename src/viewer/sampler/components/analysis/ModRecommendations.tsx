import React, { useEffect, useState, useCallback } from 'react'; 
import styles from './ModRecommendations.module.scss';
import { SparkAnalysisEngine, AnalysisResult } from '../../../common/logic/sparkAnalysisEngine';
import { ModRecommendation } from '../../../common/logic/modRecommendations';
import SamplerData from '../../SamplerData';

interface ModRecommendationsProps {
    data: SamplerData;
}

export default function ModRecommendations({ data }: ModRecommendationsProps) {
    const [recommendations, setRecommendations] = useState<ModRecommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(false);

    const getInstalledMods = (serverData: SamplerData): string[] => {
        if (!serverData.metadata?.sources) {
            return [];
        }
        
        const sources = Object.values(serverData.metadata.sources);
        return sources.map((source: any) => source.name?.toLowerCase() || '').filter(Boolean);
    };

    const isPluginRecommendation = (mod: ModRecommendation): boolean => {
        // Lista de nombres que son típicamente plugins, no mods
        const pluginNames = [
            'spark', 'luckperms', 'worldedit', 'essentials', 'vault', 
            'placeholderapi', 'citizens', 'shopkeepers', 'dynmap',
            'clearlag', 'lagassist', 'antilag', 'serverbooster'
        ];
        
        return pluginNames.some(pluginName => 
            mod.name.toLowerCase().includes(pluginName)
        );
    };

    const isModAlreadyInstalled = (mod: ModRecommendation, installedMods: string[]): boolean => {
        const modNameLower = mod.name.toLowerCase();
        return installedMods.some(installedMod => 
            installedMod.includes(modNameLower) || modNameLower.includes(installedMod)
        );
    };

    const isModdedPlatformRecommendation = (mod: ModRecommendation, serverData: SamplerData): boolean => {
        const serverPlatform = serverData.metadata?.platform?.name?.toLowerCase() || '';
        
        // Si es servidor vanilla (Paper, Bukkit, Spigot, Purpur), solo mostrar mods para esas plataformas
        const vanillaPlatforms = ['paper', 'bukkit', 'spigot', 'purpur'];
        const moddedPlatforms = ['forge', 'fabric', 'neoforge', 'quilt'];
        
        const isVanillaServer = vanillaPlatforms.some(platform => serverPlatform.includes(platform));
        const isModdedServer = moddedPlatforms.some(platform => serverPlatform.includes(platform));
        
        // Para servidores vanilla, solo mostrar mods de rendimiento que sean compatibles
        if (isVanillaServer) {
            return mod.platforms.some(platform => 
                vanillaPlatforms.includes(platform.type)
            ) && mod.category === 'performance';
        }
        
        // Para servidores modded, mostrar mods compatibles
        if (isModdedServer) {
            return mod.platforms.some(platform => 
                platform.type === 'forge' || platform.type === 'fabric' || 
                platform.type === 'neoforge' || platform.type === 'quilt'
            );
        }
        
        return false;
    };

    const getPlatformType = (): string => {
        const platform = data.metadata?.platform?.name?.toLowerCase() || '';
        
        if (['paper', 'bukkit', 'spigot', 'purpur'].some(p => platform.includes(p))) {
            return 'server';
        }
        if (['forge', 'fabric', 'neoforge', 'quilt'].some(p => platform.includes(p))) {
            return 'modded';
        }
        return 'unknown';
    };

    const filterModRecommendations = useCallback((modRecommendations: ModRecommendation[], serverData: SamplerData): ModRecommendation[] => {
        if (!modRecommendations || modRecommendations.length === 0) {
            return [];
        }

        // Obtener lista de mods/plugins ya instalados
        const installedMods = getInstalledMods(serverData);
        
        // Filtrar recomendaciones
        return modRecommendations.filter(mod => {
            // 1. Evitar recomendar plugins (solo queremos mods)
            if (isPluginRecommendation(mod)) {
                return false;
            }
            
            // 2. Evitar recomendar mods que ya están instalados
            if (isModAlreadyInstalled(mod, installedMods)) {
                return false;
            }
            
            // 3. Solo mostrar mods para plataformas modded (Forge, Fabric, etc.)
            if (!isModdedPlatformRecommendation(mod, serverData)) {
                return false;
            }
            
            return true;
        });
    }, []);

    useEffect(() => {
        const generateRecommendations = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const engine = new SparkAnalysisEngine(data);
                const result = await engine.performFullAnalysis();
                
                // Filtrar solo recomendaciones de mods (no plugins) y evitar duplicados
                const filteredRecommendations = filterModRecommendations(result.modRecommendations, data);
                setRecommendations(filteredRecommendations);
            } catch (err) {
                console.error('Error generating mod recommendations:', err);
                setError('Failed to generate mod recommendations');
            } finally {
                setLoading(false);
            }
        };

        generateRecommendations();
    }, [data, filterModRecommendations]);

    if (loading) {
        return (
            <div className={styles.recommendationsContainer}>
                <div className={styles.header}>
                    <h3>📦 Recommended Mods</h3>
                    <div className={styles.loading}>
                        <span className={styles.loadingSpinner}>🔄</span>
                        Searching for compatible mods...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.recommendationsContainer}>
                <div className={styles.header}>
                    <h3>📦 Recommended Mods</h3>
                    <div className={styles.error}>{error}</div>
                </div>
            </div>
        );
    }

    const platformType = getPlatformType();
    const hasRecommendations = recommendations.length > 0;

    return (
        <div className={styles.recommendationsContainer}>
            <div className={styles.header} onClick={() => setExpanded(!expanded)}>
                <h3>📦 Recommended Mods</h3>
                <div className={styles.headerInfo}>
                    {hasRecommendations ? (
                        <span className={styles.count}>{recommendations.length} available</span>
                    ) : (
                        <span className={styles.noRecommendations}>
                            {platformType === 'server' ? 'Limited for server platforms' : 'None found'}
                        </span>
                    )}
                    <span className={styles.expandIcon}>
                        {expanded ? '▼' : '▶'}
                    </span>
                </div>
            </div>

            {expanded && (
                <div className={styles.content}>
                    {hasRecommendations ? (
                        <>
                            <div className={styles.platformInfo}>
                                <strong>Platform:</strong> {data.metadata?.platform?.name || 'Unknown'} 
                                <span className={styles.version}>
                                    {data.metadata?.platform?.version && ` ${data.metadata.platform.version}`}
                                    {data.metadata?.platform?.minecraftVersion && ` (MC ${data.metadata.platform.minecraftVersion})`}
                                </span>
                            </div>
                            
                            <div className={styles.modGrid}>
                                {recommendations.slice(0, 8).map((mod, index) => (
                                    <div key={index} className={styles.modCard}>
                                        <div className={styles.modHeader}>
                                            <div className={styles.modName}>{mod.name}</div>
                                            <span className={`${styles.modCategory} ${styles[mod.category]}`}>
                                                {mod.category}
                                            </span>
                                        </div>
                                        
                                        <div className={styles.modDescription}>{mod.description}</div>
                                        
                                        <div className={styles.modReason}>
                                            <strong>Why:</strong> {mod.reason}
                                        </div>
                                        
                                        {mod.replaces && mod.replaces.length > 0 && (
                                            <div className={styles.modReplaces}>
                                                <strong>Replaces:</strong> {mod.replaces.join(', ')}
                                            </div>
                                        )}
                                        
                                        <div className={styles.modMeta}>
                                            <div className={styles.modPlatforms}>
                                                <strong>Compatible:</strong> {mod.platforms.map(p => p.type).join(', ')}
                                            </div>
                                            <div className={styles.modVersions}>
                                                <strong>Versions:</strong> {mod.versions.join(', ')}
                                            </div>
                                        </div>
                                        
                                        <div className={styles.modLinks}>
                                            {mod.links.modrinth && (
                                                <a href={mod.links.modrinth} target="_blank" rel="noopener noreferrer" className={styles.modLink}>
                                                    Modrinth
                                                </a>
                                            )}
                                            {mod.links.curseforge && (
                                                <a href={mod.links.curseforge} target="_blank" rel="noopener noreferrer" className={styles.modLink}>
                                                    CurseForge
                                                </a>
                                            )}
                                            {mod.links.github && (
                                                <a href={mod.links.github} target="_blank" rel="noopener noreferrer" className={styles.modLink}>
                                                    GitHub
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {recommendations.length > 8 && (
                                <div className={styles.moreRecommendations}>
                                    ... and {recommendations.length - 8} more mod recommendations available
                                </div>
                            )}
                        </>
                    ) : (
                        <div className={styles.noRecommendationsContent}>
                            <div className={styles.noRecommendationsIcon}>
                                {platformType === 'server' ? '🔧' : '📦'}
                            </div>
                            <div className={styles.noRecommendationsText}>
                                {platformType === 'server' ? (
                                    <>
                                        <strong>Limited mod support for server platforms</strong>
                                        <p>Server platforms like Paper/Bukkit primarily use plugins rather than mods. 
                                        Consider performance optimizations through server configuration instead.</p>
                                    </>
                                ) : platformType === 'modded' ? (
                                    <>
                                        <strong>No new mod recommendations found</strong>
                                        <p>Your modded server setup appears to be well-optimized, or you may already have 
                                        the recommended mods installed.</p>
                                    </>
                                ) : (
                                    <>
                                        <strong>Unable to determine platform compatibility</strong>
                                        <p>Check the platform information to see what mods might be compatible with your setup.</p>
                                    </>
                                )}
                                
                                <div className={styles.helpLinks}>
                                    <a href="https://github.com/TheUsefulLists/UsefulMods" target="_blank" rel="noopener noreferrer">
                                        Browse UsefulMods GitHub
                                    </a>
                                    {platformType === 'modded' && (
                                        <>
                                            <a href="https://modrinth.com/" target="_blank" rel="noopener noreferrer">
                                                Explore Modrinth
                                            </a>
                                            <a href="https://www.curseforge.com/minecraft/mc-mods" target="_blank" rel="noopener noreferrer">
                                                Browse CurseForge
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className={styles.footer}>
                        <small>
                            Mod recommendations are generated based on your server platform and detected issues. 
                            Visit{' '}
                            <a href="https://github.com/TheUsefulLists/UsefulMods" target="_blank" rel="noopener noreferrer">
                                UsefulMods
                            </a>{' '}
                            for the complete mod database.
                        </small>
                    </div>
                </div>
            )}
        </div>
    );
}
