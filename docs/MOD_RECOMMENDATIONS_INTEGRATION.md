# 📦 Integración de Recomendaciones de Mods con UsefulMods

## 🎉 Nueva Funcionalidad

Se ha integrado exitosamente el sistema de recomendaciones de mods basado en el repositorio [TheUsefulLists/UsefulMods](https://github.com/TheUsefulLists/UsefulMods) directamente en el analizador de Spark Viewer.

## 🚀 Características Implementadas

### 🔍 **Detección Inteligente de Problemas**
- Analiza automáticamente problemas de rendimiento, configuración y plugins
- Mapea problemas específicos a recomendaciones de mods relevantes
- Considera la versión de Minecraft y plataforma del servidor

### 📋 **Sistema de Recomendaciones Contextuales**
- **Performance**: Mods como Lithium, Phosphor, Starlight para optimización
- **BugFixes**: Mods para corregir bugs específicos de versiones
- **Enhancements**: Mejoras de funcionalidad y características
- **Alternatives**: Reemplazos para plugins problemáticos

### 🎯 **Detección de Plataformas y Versiones**
- **Forge**: 1.8.9, 1.12.x, 1.16.x, 1.17.x, 1.18.x, 1.19.x, 1.20.x, 1.21.x
- **Fabric**: 1.14+, 1.16+, 1.17+, 1.18+, 1.19+, 1.20+, 1.21+
- **Paper/Bukkit/Spigot/Purpur**: Todas las versiones soportadas
- **NeoForge**: 1.20.x+

### 🔄 **Integración con GitHub API**
- Obtiene datos actualizados directamente del repositorio UsefulMods
- Sistema de caché de 6 horas para optimizar rendimiento
- Fallback a recomendaciones locales si GitHub no está disponible

## 📍 **Ubicación en la Interfaz**

### **Visor Web**
1. **Panel Principal**: Las recomendaciones aparecen en la sección "🤖 Server Analysis (Bot Scanner)"
2. **Sección Específica**: "📦 Recommended Mods" entre Plugin Issues y JVM Analysis
3. **Diseño**: Cards interactivos con hover effects y links directos de descarga

### **Exportación TXT**
1. **Sección Nueva**: "📦 MOD RECOMMENDATIONS FROM USEFULMODS"
2. **Organización**: Por categorías (Performance, BugFix, Enhancement, Alternative)
3. **Links Incluidos**: Modrinth, CurseForge, GitHub según disponibilidad

## 🎨 **Ejemplos de Recomendaciones**

### **Problema Detectado: ClearLag**
```
📦 Recommended Mods (2)

🔄 Spark (alternative)
Performance profiler for Minecraft clients, servers and proxies
Why: Use Spark to identify actual lag sources instead of ClearLag which causes more lag
Compatible with: bukkit, paper, fabric, forge (1.8, 1.12, 1.16, 1.17, 1.18, 1.19, 1.20, 1.21)
[Modrinth] [GitHub]

⚡ Entity Culling (performance)  
Using async path-tracing to hide Block-/Entities that are not visible
Why: Proper entity optimization without the issues caused by ClearLag
Compatible with: fabric, forge (1.16, 1.17, 1.18, 1.19, 1.20, 1.21)
[Modrinth] [CurseForge]
```

### **Problema Detectado: Rendimiento Bajo**
```
⚡ PERFORMANCE MODS:
  1. Lithium by CaffeineMC
     General-purpose optimization mod that focuses on physics, mob AI, and block ticking
     Why: Optimizes server-side performance without changing game mechanics
     Download:
       - Modrinth: https://modrinth.com/mod/lithium
       - GitHub: https://github.com/CaffeineMC/lithium-fabric
     Compatible: fabric (1.16, 1.17, 1.18, 1.19, 1.20, 1.21)

  2. Starlight by SpottedLeaf
     Rewrites the light engine to fix lighting performance and lighting errors  
     Why: Replaces vanilla lighting engine with much faster implementation
     Compatible: fabric, forge (1.17, 1.18, 1.19, 1.20, 1.21)
```

## 🔧 **Configuración del Sistema**

### **Archivos Principales**
- `src/viewer/common/logic/modRecommendations.ts` - Motor de recomendaciones
- `src/viewer/common/logic/usefulModsApi.ts` - Integración con GitHub API
- `src/viewer/common/logic/sparkAnalysisEngine.ts` - Analizador principal actualizado
- `src/viewer/sampler/components/analysis/BotAnalysis.tsx` - Componente UI

### **Base de Datos de Mods**
```typescript
const MOD_RECOMMENDATIONS: { [key: string]: ModRecommendation[] } = {
    'performance_lag': [...],      // Mods de optimización
    'clearlag_detected': [...],    // Alternativas a ClearLag  
    'outdated_permissions': [...], // Reemplazos para plugins obsoletos
    'missing_aikars_flags': [...], // Configuraciones JVM
    'high_spawn_limits': [...]     // Optimizaciones de configuración
};
```

### **Mapeo de Problemas**
```typescript
const ISSUE_TO_RECOMMENDATIONS: { [key: string]: string[] } = {
    'ClearLag': ['clearlag_detected'],
    'PermissionsEx': ['outdated_permissions'],
    'high_tps_variance': ['performance_lag'],
    'missing_aikars_flags': ['missing_aikars_flags']
};
```

## 🌐 **GitHub API Integration**

### **Endpoints Utilizados**
- `GET /repos/TheUsefulLists/UsefulMods/contents/{directory}` - Lista archivos
- `GET {download_url}` - Contenido de archivos .md

### **Parsing de Datos**
1. **Detección de Tablas**: Busca tablas markdown con estructura de mods
2. **Extracción de Links**: Identifica URLs de Modrinth, CurseForge, GitHub
3. **Compatibilidad**: Analiza plataformas y versiones soportadas
4. **Categorización**: Organiza por tipo de mod (performance, bugfix, etc.)

### **Sistema de Caché**
```typescript
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 horas
localStorage.setItem('usefulMods_cache', JSON.stringify({
    data: modsData,
    timestamp: Date.now()
}));
```

## 📊 **Métricas y Análisis**

### **Criterios de Recomendación**
1. **Compatibilidad de Plataforma**: Forge, Fabric, Bukkit, etc.
2. **Compatibilidad de Versión**: Rangos de versiones soportadas
3. **Problemas Detectados**: Mapeo directo a categorías de mods
4. **Plugins Instalados**: Detección de conflictos y reemplazos

### **Algoritmo de Priorización**
1. **Críticos**: Reemplazos para plugins problemáticos (ClearLag, etc.)
2. **Performance**: Mods de optimización para problemas de lag
3. **BugFixes**: Correcciones para versiones específicas
4. **Enhancements**: Mejoras opcionales de funcionalidad

## 🎁 **Beneficios para el Usuario**

### ✅ **Para Administradores de Servidores**
- **Recomendaciones Personalizadas**: Basadas en su configuración específica
- **Links Directos**: Descarga inmediata desde Modrinth, CurseForge, GitHub
- **Compatibilidad Garantizada**: Solo mods compatibles con su versión/plataforma
- **Explicaciones Claras**: Por qué se recomienda cada mod

### ✅ **Para la Comunidad**
- **Datos Actualizados**: Conectado directamente al repositorio UsefulMods
- **Crowdsourcing**: Aprovecha el conocimiento colectivo de la comunidad
- **Categorización Inteligente**: Organización por tipo de problema/solución
- **Escalabilidad**: Sistema extensible para nuevas categorías y mods

## 🔮 **Futuras Mejoras**

### **Próximas Características**
- [ ] **Detección de ModPacks**: Recomendaciones específicas para modpacks conocidos
- [ ] **Análisis de Dependencias**: Verificación automática de mods requeridos
- [ ] **Ratings de Comunidad**: Integración con ratings de Modrinth/CurseForge
- [ ] **Comparativa de Mods**: Comparación lado a lado de alternativas
- [ ] **Instalación Automática**: Integración con launchers para instalación directa

### **Optimizaciones Técnicas**
- [ ] **WebWorkers**: Procesamiento en background del parsing de GitHub
- [ ] **IndexedDB**: Sistema de caché más robusto
- [ ] **GraphQL**: API más eficiente para consultas específicas
- [ ] **ML Recommendations**: Sistema de recomendaciones basado en machine learning

---

## 🔗 **Enlaces Útiles**

- **UsefulMods Repository**: https://github.com/TheUsefulLists/UsefulMods
- **Modrinth**: https://modrinth.com/
- **CurseForge**: https://www.curseforge.com/
- **Spark Profiler**: https://github.com/lucko/spark
- **Paper Documentation**: https://docs.papermc.io/

---

*Esta integración mejora significativamente la experiencia del usuario al proporcionar recomendaciones de mods contextuales, actualizadas y directamente actionables basadas en el análisis de su servidor.*
