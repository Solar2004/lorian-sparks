# ![Lorian Sparks Logo](public/assets/logo.svg) Lorian Sparks

**Lorian Sparks** is an independent Spark profile viewer that goes beyond traditional profiling by providing advanced debugging capabilities for Minecraft servers. This project is not affiliated with the original Spark project and offers enhanced analysis tools for deeper problem diagnosis.

This repository contains the website & viewer for Lorian Sparks, written using [Next.js](https://nextjs.org/)/[React](https://reactjs.org)/[Typescript](https://www.typescriptlang.org/).

## Key Features

- **Advanced Debugging**: Deep analysis tools for identifying and diagnosing server performance issues
- **Enhanced Profiling**: More detailed profiling capabilities than traditional Spark viewers
- **TXT Export**: Export all profiling data to human-readable TXT format for easy sharing and analysis
- **Enhanced UI**: Modern interface with improved user experience
- **Independent Development**: Not tied to the original Spark project, allowing for custom enhancements

The website contains:

-   a brief **homepage**
-   **downloads** page which serves direct links to the latest release
-   **documentation** and usage guides
-   a **viewer** web-app for Lorian Sparks data, which has modes for:
    -   viewing the output from the Lorian Sparks **profiler** with enhanced analysis
    -   viewing the output from Lorian Sparks **heap dump** summaries
    -   **Advanced debugging tools** for deeper problem diagnosis
    -   **TXT export** functionality for comprehensive data analysis

### Viewer

The viewer component of the website reads data from [bytebin](https://github.com/lucko/bytebin) (content storage service) and [bytesocks](https://github.com/lucko/bytesocks) (WebSocket server). It then renders this data as an interactive viewer in which the user can interpret and analyse their results.

The profile viewer renders the data as an expandable call stack tree, with support for applying deobfuscation mappings, searching, bookmarks and viewing as a flame graph.

The heap dump summary viewer renders a histogram of the classes occupying the most memory at the time when the data was collected.

### Selfhosting

#### Configuring URLs

To configure the URLs used by the application, you have to pass them as environment variables when building the application.
In the special case of using Docker, you have to pass them as build arguments.

For more information, see [`env.ts`](src/env.ts) and the [`Dockerfile`](Dockerfile).

### Support & Issues

**Important**: This project is independent and not affiliated with the original Spark project. For any issues, bugs, or feature requests related to Lorian Sparks, please report them in this repository's issue tracker.

### Addons & Extensions

Lorian Sparks supports the creation of addons and extensions that enhance its debugging capabilities. These addons can provide additional analysis tools, custom visualizations, and specialized debugging features for specific Minecraft server setups.

### License

**Copyright (c) 2024 Lorian Sparks Project**

This project is proprietary software. All rights reserved.

**IMPORTANT NOTICE**: This software is protected by copyright law. You are NOT permitted to:

- Copy, distribute, or reproduce this software without explicit written permission from the project owner
- Create derivative works or modifications without authorization
- Use this software for commercial purposes without proper licensing
- Redistribute any part of this codebase

**Exceptions**:
- You may create addons and extensions for Lorian Sparks as long as they do not include or redistribute the core codebase
- You may use this software for personal, non-commercial purposes

For licensing inquiries, commercial use, or permission requests, please contact the project owner through this repository's issue tracker.

### About Lorian Sparks

Lorian Sparks is an independent project that provides enhanced debugging and profiling capabilities for Minecraft servers. While it may share conceptual similarities with other profiling tools, it is a completely independent implementation with its own unique features and capabilities.
