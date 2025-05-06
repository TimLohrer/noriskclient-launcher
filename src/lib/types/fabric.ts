export interface FabricVersion {
    version: string;
    stable: boolean;
}

export interface FabricLoaderVersion {
    separator: string;
    build: number;
    maven: string;
    version: string;
    stable: boolean;
}

export interface FabricInstallerVersion {
    url: string;
    maven: string;
    version: string;
    stable: boolean;
}

export interface FabricVersionManifest {
    loader: FabricLoaderVersion;
    installer: FabricInstallerVersion;
}

export interface FabricIntermediary {
    maven: string;
    version: string;
    stable: boolean;
}

export interface FabricLibrary {
    name: string;
    url?: string;
    md5?: string;
    sha1?: string;
    sha256?: string;
    sha512?: string;
    size?: number;
}

export interface FabricLibraries {
    client: FabricLibrary[];
    common: FabricLibrary[];
    server: FabricLibrary[];
    development?: FabricLibrary[];
}

export interface FabricMainClassObject {
    client: string;
    server: string;
}

export type FabricMainClass = string | FabricMainClassObject;

export interface FabricLauncherMeta {
    version: number;
    min_java_version?: number;
    libraries: FabricLibraries;
    main_class: FabricMainClass;
}

export interface FabricVersionInfo {
    loader: FabricLoaderVersion;
    intermediary: FabricIntermediary;
    launcher_meta: FabricLauncherMeta;
}

