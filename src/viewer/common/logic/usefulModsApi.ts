/**
 * API para obtener datos actualizados de UsefulMods desde GitHub
 * Integra con el repositorio TheUsefulLists/UsefulMods
 */

import { ModRecommendation, Platform } from './modRecommendations';

export interface UsefulModsData {
    bugfixes: UsefulMod[];
    enhancements: UsefulMod[];
    performance: UsefulMod[];
    helpful: UsefulMod[];
}

export interface UsefulMod {
    name: string;
    description: string;
    author: string;
    platforms: string[];
    versions: string[];
    links: {
        modrinth?: string;
        curseforge?: string;
        github?: string;
    };
    knownIncompatibilities?: string;
    label?: string;
    license?: string;
    bugfixing?: 'Client' | 'Server' | 'Both';
}

export interface GitHubContent {
    name: string;
    content: string;
    encoding: string;
}

export class UsefulModsAPI {
    private static readonly GITHUB_API_BASE = 'https://api.github.com/repos/TheUsefulLists/UsefulMods';
    private static readonly CACHE_KEY = 'usefulMods_cache';
    private static readonly CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 horas

    /**
     * Obtiene los datos de mods desde GitHub con caché
     */
    public static async getModsData(): Promise<UsefulModsData | null> {
        try {
            // Verificar caché primero
            const cached = this.getFromCache();
            if (cached) {
                return cached;
            }

            // Si no hay caché, obtener desde GitHub
            const data = await this.fetchFromGitHub();
            if (data) {
                this.saveToCache(data);
            }
            
            return data;
        } catch (error) {
            console.warn('Failed to fetch UsefulMods data:', error);
            return null;
        }
    }

    /**
     * Busca mods compatibles con un problema específico
     */
    public static async findModsForIssue(
        issue: string, 
        mcVersion: string, 
        platform: string
    ): Promise<ModRecommendation[]> {
        const modsData = await this.getModsData();
        if (!modsData) {
            return [];
        }

        const recommendations: ModRecommendation[] = [];

        // Mapeo de problemas a categorías de mods
        const issueToCategory: { [key: string]: keyof UsefulModsData } = {
            'performance_lag': 'performance',
            'clearlag_detected': 'performance',
            'high_mspt': 'performance',
            'low_tps': 'performance',
            'outdated_version': 'bugfixes',
            'missing_features': 'enhancements',
            'server_issues': 'helpful'
        };

        const category = issueToCategory[issue];
        if (!category) {
            return [];
        }

        const mods = modsData[category] || [];
        
        // Filtrar mods compatibles
        const compatibleMods = mods.filter(mod => 
            this.isModCompatible(mod, mcVersion, platform)
        );

        // Convertir a ModRecommendation
        return compatibleMods.map(mod => this.convertToModRecommendation(mod, issue));
    }

    /**
     * Obtiene mods por categoría específica
     */
    public static async getModsByCategory(
        category: keyof UsefulModsData,
        mcVersion: string,
        platform: string
    ): Promise<ModRecommendation[]> {
        const modsData = await this.getModsData();
        if (!modsData) {
            return [];
        }

        const mods = modsData[category] || [];
        const compatibleMods = mods.filter(mod => 
            this.isModCompatible(mod, mcVersion, platform)
        );

        return compatibleMods.map(mod => 
            this.convertToModRecommendation(mod, `${category}_general`)
        );
    }

    private static async fetchFromGitHub(): Promise<UsefulModsData | null> {
        try {
            // Obtener estructura de directorios
            const dirs = ['BugFixes', 'Enhancements', 'Performance', 'Helpful'];
            const data: Partial<UsefulModsData> = {};

            for (const dir of dirs) {
                try {
                    const mods = await this.fetchModsFromDirectory(dir);
                    const categoryKey = dir.toLowerCase() as keyof UsefulModsData;
                    
                    // Mapear nombres de directorio a claves del objeto
                    if (categoryKey === 'bugfixes') {
                        data.bugfixes = mods;
                    } else if (categoryKey === 'enhancements') {
                        data.enhancements = mods;
                    } else if (categoryKey === 'performance') {
                        data.performance = mods;
                    } else if (categoryKey === 'helpful') {
                        data.helpful = mods;
                    }
                } catch (error) {
                    console.warn(`Failed to fetch mods from ${dir}:`, error);
                }
            }

            return data as UsefulModsData;
        } catch (error) {
            console.error('Failed to fetch from GitHub:', error);
            return null;
        }
    }

    private static async fetchModsFromDirectory(directory: string): Promise<UsefulMod[]> {
        const mods: UsefulMod[] = [];

        try {
            // Obtener archivos .md del directorio
            const response = await fetch(`${this.GITHUB_API_BASE}/contents/${directory}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const files = await response.json();
            
            for (const file of files) {
                if (file.name.endsWith('.md') && file.name !== 'README.md') {
                    try {
                        const fileContent = await this.fetchFileContent(file.download_url);
                        const parsedMods = this.parseMarkdownFile(fileContent);
                        mods.push(...parsedMods);
                    } catch (error) {
                        console.warn(`Failed to parse ${file.name}:`, error);
                    }
                }
            }
        } catch (error) {
            console.error(`Failed to fetch directory ${directory}:`, error);
        }

        return mods;
    }

    private static async fetchFileContent(url: string): Promise<string> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.text();
    }

    private static parseMarkdownFile(content: string): UsefulMod[] {
        const mods: UsefulMod[] = [];
        
        try {
            // Buscar tablas de mods en el markdown
            const tableRegex = /\|.*Name.*\|[\s\S]*?(?=\n\n|\n#|\n$|$)/g;
            const matches = content.match(tableRegex);
            
            if (matches) {
                for (const table of matches) {
                    const parsedMods = this.parseModTable(table);
                    mods.push(...parsedMods);
                }
            }
        } catch (error) {
            console.warn('Failed to parse markdown:', error);
        }

        return mods;
    }

    private static parseModTable(table: string): UsefulMod[] {
        const mods: UsefulMod[] = [];
        const lines = table.split('\n').filter(line => line.trim());
        
        // Saltar header y separator
        const dataLines = lines.slice(2);
        
        for (const line of dataLines) {
            try {
                const mod = this.parseModTableRow(line);
                if (mod) {
                    mods.push(mod);
                }
            } catch (error) {
                console.warn('Failed to parse mod row:', error);
            }
        }

        return mods;
    }

    private static parseModTableRow(row: string): UsefulMod | null {
        const columns = row.split('|').map(col => col.trim()).filter(col => col);
        
        if (columns.length < 4) {
            return null;
        }

        // Extraer nombre del mod (puede incluir links)
        const nameColumn = columns[0];
        const nameMatch = nameColumn.match(/\[([^\]]+)\]/);
        const name = nameMatch ? nameMatch[1] : nameColumn;

        // Extraer links
        const links: { modrinth?: string; curseforge?: string; github?: string; } = {};
        
        const modrinthMatch = nameColumn.match(/\[.*?\]\((https:\/\/modrinth\.com\/[^)]+)\)/);
        const curseforgeMatch = nameColumn.match(/\[.*?\]\((https:\/\/(?:www\.)?curseforge\.com\/[^)]+)\)/);
        const githubMatch = nameColumn.match(/\[.*?\]\((https:\/\/github\.com\/[^)]+)\)/);
        
        if (modrinthMatch) links.modrinth = modrinthMatch[1];
        if (curseforgeMatch) links.curseforge = curseforgeMatch[1];
        if (githubMatch) links.github = githubMatch[1];

        return {
            name,
            description: columns[2] || '',
            author: columns[3] || '',
            platforms: ['forge', 'fabric'], // Esto debería parsearse del contenido
            versions: ['1.12', '1.16', '1.17', '1.18', '1.19', '1.20', '1.21'], // Esto también
            links,
            knownIncompatibilities: columns[1] || 'Unknown',
            bugfixing: columns[4] as 'Client' | 'Server' | 'Both' || 'Both',
            label: columns[5] || 'None',
            license: columns[6] || 'Unknown'
        };
    }

    private static isModCompatible(mod: UsefulMod, mcVersion: string, platform: string): boolean {
        // Verificar plataforma
        const normalizedPlatform = platform.toLowerCase();
        const platformCompatible = mod.platforms.some(p => 
            normalizedPlatform.includes(p.toLowerCase()) ||
            (p.toLowerCase() === 'bukkit' && ['paper', 'spigot', 'purpur'].some(sp => normalizedPlatform.includes(sp)))
        );

        // Verificar versión
        const normalizedVersion = this.normalizeVersion(mcVersion);
        const versionCompatible = mod.versions.some(v => {
            const modVersion = this.normalizeVersion(v);
            return this.isVersionInRange(normalizedVersion, modVersion);
        });

        return platformCompatible && versionCompatible;
    }

    private static convertToModRecommendation(mod: UsefulMod, reason: string): ModRecommendation {
        const category = this.inferCategory(reason);
        
        return {
            name: mod.name,
            description: mod.description,
            author: mod.author,
            category,
            platforms: mod.platforms.map(p => ({ type: p as any, versions: mod.versions })),
            versions: mod.versions,
            links: mod.links,
            reason: this.generateReason(reason, mod),
            replaces: []
        };
    }

    private static inferCategory(reason: string): 'performance' | 'bugfix' | 'enhancement' | 'alternative' {
        if (reason.includes('performance') || reason.includes('lag')) return 'performance';
        if (reason.includes('bugfix') || reason.includes('bug')) return 'bugfix';
        if (reason.includes('enhancement') || reason.includes('improve')) return 'enhancement';
        return 'alternative';
    }

    private static generateReason(issue: string, mod: UsefulMod): string {
        const reasonMap: { [key: string]: string } = {
            'performance_lag': `Improves server performance and reduces lag`,
            'clearlag_detected': `Proper alternative to problematic lag-clearing plugins`,
            'outdated_version': `Provides bugfixes and improvements for your version`,
            'missing_features': `Adds useful functionality to enhance your server`
        };

        return reasonMap[issue] || `Recommended mod for your server setup`;
    }

    private static normalizeVersion(version: string): string {
        return version.replace(/\+$/, '').split('.').slice(0, 2).join('.');
    }

    private static isVersionInRange(serverVersion: string, modVersion: string): boolean {
        const [serverMajor, serverMinor] = serverVersion.split('.').map(Number);
        const [modMajor, modMinor] = modVersion.split('.').map(Number);
        
        return serverMajor === modMajor && serverMinor >= modMinor;
    }

    private static getFromCache(): UsefulModsData | null {
        try {
            const cached = localStorage.getItem(this.CACHE_KEY);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);
            const now = Date.now();

            if (now - timestamp > this.CACHE_DURATION) {
                localStorage.removeItem(this.CACHE_KEY);
                return null;
            }

            return data;
        } catch (error) {
            return null;
        }
    }

    private static saveToCache(data: UsefulModsData): void {
        try {
            const cacheData = {
                data,
                timestamp: Date.now()
            };
            localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Failed to save to cache:', error);
        }
    }
}
