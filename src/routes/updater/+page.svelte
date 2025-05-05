<script lang="ts">
	import { language, setLanguage, translations } from './../../lib/utils/translationUtils';
    import { relaunch } from '@tauri-apps/plugin-process';
    import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
    import { invoke } from '@tauri-apps/api/core';
    import { onMount } from "svelte";
    import { check, type DownloadEvent } from "@tauri-apps/plugin-updater";
	import type { Update } from "@tauri-apps/plugin-updater";
    import Logo from "$lib/images/norisk_logo.png";
  import { launcherConfig, loadConfig } from '$lib/utils/configUtils';
    const appWindow = getCurrentWebviewWindow()

	$: lang = $translations;

    let dots = "";
    let text: string | null = null;
    let error = "";
    let copyErrorButton = "";

	let update: Update | null = null;
	let updateDownloadSize = 0;
	let updateDownloadProgress = 0;

	function handleDownloadEvent(event: DownloadEvent) {
		if (event.event === 'Started') {
			updateDownloadSize = event.data.contentLength ?? 0;
		} else if (event.event === 'Progress') {
			updateDownloadProgress = event.data.chunkLength;
		} else if (event.event === 'Finished') {
			console.log('Download finished!');
			updateDownloadProgress = 0;
			updateDownloadSize = 0;
		}
	}

	function ignore() {
		invoke("close_updater").then(() => {
			console.log(`updater closed -> Main window shown`);
		}).catch(reason => {
			console.error(`Failed to close updater / show main window: ${reason}`);
		});
	}

	const initializeUpadter = () => translations.subscribe(async (translations) => {
		if (!translations || !translations.dummy) return;
		lang = translations;
		
		animateLoadingText();
		try {
			text = lang.updater.checking;
			console.log(`Checking for updates...`);

			await check()
				.then(_update => update = _update)
				.catch(reason => {
					console.error(reason);
					error = reason.toString();
					copyErrorButton = lang.updater.button.copyError;
				});

			if (update != null) {
				appWindow.show();
				console.log(`Installing update: ${update.rawJson}`);
				text = lang.updater.downloading;
				await update.download(handleDownloadEvent).catch(reason => {
					console.error(reason);
					error = reason.toString();
					copyErrorButton = lang.updater.button.copyError;
				});
				console.log(`Update downloaded!`);
				text = lang.updater.installing;
				await update.install().catch(reason => {
					console.error(reason);
					error = reason.toString();
					copyErrorButton = lang.updater.button.copyError;
				});
				console.log(`Update was installed`);

				await relaunch().catch(reason => {
					console.error(reason);
					error = reason.toString();
					copyErrorButton = lang.updater.button.copyError;
				});
			} else {
				console.log(`No updates available`);
				text = "";
				if (error.trim() == "") {
						await invoke("close_updater").then(() => {
						console.log(`updater closed -> Main window shown`);
					}).catch(reason => {
						console.error(`Failed to close updater / show main window: ${reason}`);
						error = reason.toString();
						copyErrorButton = lang.updater.button.copyError;
					});
				} else {
					appWindow.show();
				}
			}
		} catch (error) {
			console.error(error);
			error = lang.updater.error;
			copyErrorButton = lang.updater.button.copyError;
		}
	});

    function animateLoadingText() {
        return setInterval(function() {
            dots += ".";
            if (dots.length > 3) {
              	dots = "";
            }
        }, 500);
    }

    function copyError() {
        navigator.clipboard.writeText(error);
        copyErrorButton = lang.updater.button.copied;
        setTimeout(() => {
            copyErrorButton = lang.updater.button.copyError;
        }, 1000);
    }

	onMount(async () => {
		await loadConfig();
		if (!$launcherConfig?.auto_check_updates) {
			ignore();
		}

		initializeUpadter();
		setLanguage($language);
    });
</script>

<!-- svelte-ignore element_invalid_self_closing_tag -->
<div class="drag-overlay" data-tauri-drag-region />
<div class="container">
	<div class="content">
		<img src={Logo} alt="NoRiskClient Logo">
		{#if error.trim().length === 0 && text && text.trim().length > 0}
			<p class="progress-text">{text}{text?.trim()?.length ?? 0 > 0 ? dots : ''}</p>
		{:else if error.trim().length > 0}
			<p class="error-text">error! :(</p>
		{/if}
	</div>
	{#if error.trim().length > 0}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div class="error-button-container">
			<p class="copy-error" on:click={copyError}>{copyErrorButton}</p>
			<p class="ignore" on:click={ignore}>{lang.updater.button.ignore}</p>
		</div>
	{/if}
</div>

<style>
	.container {
		height: 380px;
		width: 400px;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		cursor: default;
	}

	.drag-overlay {
		position: absolute;
		height: 380px;
		width: 400px;
		z-index: 100;
		background-color: transparent;
	}

  	.content {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		height: 70%;
		width: 400px;
  	}

  	img {
		width: 200px;
		height: 200px;
		-webkit-user-drag: none;
		-webkit-mask:linear-gradient(-60deg,#fff 40%,#0005 50%,#fff 60%) right/275% 100%; /* right/275% 100%: length and hight of mask */
		animation: effect 3.5s infinite; /* remove infinite to trigger once */
  	}
  
  	@keyframes effect {
		0% { transform: scale(1.0); }
		50% { transform: scale(1.05); }
		100% { transform: scale(1.0); -webkit-mask-position:left }
  	}

	.progress-text {
		font-size: 35px;
		text-shadow: none;
		color: var(--font-color);
		margin-top: 0.75em;
		text-align: center;
		transition-duration: 200ms;
		z-index: 101;
	}

	.error-text {
		font-size: 35px;
		text-shadow: none;
		color: var(--red-text);
		margin-top: 0.75em;
		text-align: center;
		z-index: 101;
	}

	.error-button-container {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1em;
		flex-direction: row;
	}

	.ignore {
		font-size: 40px;
		text-shadow: none;
		color: var(--red-text);
		margin-top: 0.5em;
		text-align: center;
		transition-duration: 200ms;
		z-index: 101;
		cursor: pointer;
	}

	.ignore:hover {
		letter-spacing: 2px;
	}

	.copy-error {
		font-size: 40px;
		text-shadow: none;
		margin-top: 0.5em;
		color: var(--primary-color);
		text-align: center;
		transition-duration: 200ms;
		z-index: 101;
		cursor: pointer;
	}

	.copy-error:hover {
		letter-spacing: 2px;
	}
</style>
