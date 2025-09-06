![](https://i.imgur.com/ykHn9vx.png)

# lorian-sparks

**Lorian Sparks** is a modified version of [spark](https://github.com/lucko/spark), a performance profiling plugin/mod for Minecraft clients, servers, and proxies.

This repository contains the website & viewer for Lorian Sparks, written using [Next.js](https://nextjs.org/)/[React](https://reactjs.org)/[Typescript](https://www.typescriptlang.org/).

## Key Features

- **TXT Export**: Export all profiling data to human-readable TXT format for easy sharing and analysis
- **Enhanced UI**: Updated branding and interface improvements
- All original Spark functionality maintained

The website contains:

-   a brief **homepage**
-   **downloads** page which serves direct links to the latest release
-   **documentation**, although this is managed in a [separate repository](https://github.com/lucko/spark-docs)
-   a **viewer** web-app for Lorian Sparks data, which has modes for:
    -   viewing the output from the Lorian Sparks **profiler**
    -   viewing the output from Lorian Sparks **heap dump** summaries
    -   **NEW**: exporting all data to TXT format for easy analysis

### Viewer

The viewer component of the website reads data from [bytebin](https://github.com/lucko/bytebin) (content storage service) and [bytesocks](https://github.com/lucko/bytesocks) (WebSocket server). It then renders this data as an interactive viewer in which the user can interpret and analyse their results.

The profile viewer renders the data as an expandable call stack tree, with support for applying deobfuscation mappings, searching, bookmarks and viewing as a flame graph.

The heap dump summary viewer renders a histogram of the classes occupying the most memory at the time when the data was collected.

### Selfhosting

#### Configuring URLs

To configure the URLs used by the application, you have to pass them as environment variables when building the application.
In the special case of using Docker, you have to pass them as build arguments.

For more information, see [`env.ts`](src/env.ts) and the [`Dockerfile`](Dockerfile).

### Contributions

Yes please! - but please open an issue or ping me on [Discord](https://discord.gg/PAGT2fu) (so we can discuss your idea) before working on a big change!

### License

Lorian Sparks is free & open source. It is released under the terms of the GNU GPLv3 license. Please see [`LICENSE.txt`](LICENSE.txt) for more information.

This project is based on [spark](https://github.com/lucko/spark) by lucko, which is a fork of [WarmRoast](https://github.com/sk89q/WarmRoast), both [licensed using the GPLv3](https://github.com/sk89q/WarmRoast/blob/3fe5e5517b1c529d95cf9f43fd8420c66db0092a/src/main/java/com/sk89q/warmroast/WarmRoast.java#L1-L17).

### Changes from Original Spark

- **TXT Export Feature**: Added the ability to export all profiling data (Sampler, Heap, Health) to human-readable TXT format
- **Enhanced Branding**: Updated UI to reflect "Lorian Sparks" branding
- **Improved User Experience**: Added dedicated export buttons for TXT format alongside original export functionality
