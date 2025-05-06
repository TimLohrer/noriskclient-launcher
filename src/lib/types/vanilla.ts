export interface LatestVersions {
    release: string;
    snapshot: string;
}

export interface Version {
    id: string;
    version_type: string;
    url: string;
    time: string;
    release_time: string;
}

export interface VersionManifest {
    latest: LatestVersions;
    versions: Version[];
}