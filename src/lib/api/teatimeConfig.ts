import type { TeaTimeConfig } from "$lib/types/core";
import { invoke } from "@tauri-apps/api/core";

export function getTeaTimeConfig(): Promise<TeaTimeConfig> {
    return invoke("get_teatime_config");
}

export function setTeaTimeConfig(config: TeaTimeConfig): Promise<void> {
    return invoke("set_teatime_config", { config });
}