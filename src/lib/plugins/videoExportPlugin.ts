import type p5 from 'p5';
import type { Plugin } from '../types';

import { COLUMN, ROW } from '../gui/components/groups/Group';
import {
	ffmpegInit,
	getFFmpegProgress,
	resetFFmpegProgress,
	setVideoFormatSettings,
	videoFormats,
} from '../ffmpeg';

type ExportStage = 'idle' | 'recording' | 'exporting';
type ExportPhase = 'recording' | 'exporting';

function clamp01(value: number) {
	return Math.max(0, Math.min(1, value));
}

export function videoExportPlugin(): Plugin {
	return {
		name: 'videoExport',

		afterUserCreatesGui: (gui, sketch) => {
			const exportTab = gui.getTab('export') || gui;
			const panel = exportTab.addPanel('Export video', true);
			const columnGroup = panel.addGroup('videoExport', COLUMN);

			columnGroup.addSelect(
				'formatSelect',
				'Video format',
				Object.values(videoFormats).map(format => format.guiName),
				0,
				(controller, value) => {
					setVideoFormatSettings(value as string);
				}
			);

			const timeGroup = columnGroup.addGroup('timeGroup', ROW);

			timeGroup.addTextbox(
				'durationTextbox',
				'Duration (s)',
				sketch.catalyst?.duration.toString() || '10',
				(controller, value) => {
					const duration = parseFloat(value as string);
					if (!isNaN(duration)) {
						sketch.catalyst?.setDuration(duration);
					}
				}
			);

			timeGroup.addTextbox(
				'frameRateTextbox',
				'LANG_FRAME_RATE (fps)',
				sketch.catalyst?.fps.toString() || '30',
				(controller, value) => {
					const frameRate = parseInt(value as string);
					if (isNaN(frameRate)) return;
					sketch.catalyst?.setFrameRate(frameRate);
				}
			);

			const progressContainer = gui.sketch
				.createDiv()
				.addClass('video-export-progress-container')
				.parent(columnGroup.div);

			const phaseLabel = gui.sketch
				.createSpan('Recording:')
				.addClass('video-export-progress-label')
				.parent(progressContainer);

			const progressRow = gui.sketch
				.createDiv()
				.addClass('video-export-progress-row')
				.parent(progressContainer);
			const progressTrack = gui.sketch
				.createDiv()
				.addClass('video-export-progress-track')
				.parent(progressRow);
			const progressFill = gui.sketch
				.createDiv()
				.addClass('video-export-progress-fill')
				.parent(progressTrack);
			const progressPercent = gui.sketch
				.createSpan('0%')
				.addClass('video-export-progress-percent')
				.parent(progressRow);

			const startExportButton = columnGroup.addButton(
				'startExport',
				'Start export',
				() => {
					const stage =
						(sketch.catalyst?.exportStage as
							| ExportStage
							| undefined) || 'idle';
					const isActive = stage !== 'idle' || isAwaitingFirstStage;

					if (isActive) {
						sketch.catalyst?.cancelRecording();
						isAwaitingFirstStage = false;
						currentPhase = null;
						phaseProgress = 0;
						resetFFmpegProgress();
						setProgressBar(0);
						setProgressVisible(false);
						setButtonMode('start');
						return;
					}

					isAwaitingFirstStage = true;
					currentPhase = 'recording';
					phaseProgress = 0;
					resetFFmpegProgress();
					setPhaseLabel('recording');
					setProgressBar(0);
					setProgressVisible(true);
					setButtonMode('cancel', 'recording');
					sketch.catalyst?.startRecording();
				}
			);

			const setProgressBar = (progress: number) => {
				const clamped = clamp01(progress);
				progressFill.elt.style.width = `${clamped * 100}%`;
				progressPercent.html(`${Math.round(clamped * 100)}%`);
			};

			const setProgressVisible = (isVisible: boolean) => {
				progressContainer.elt.style.display =
					isVisible ? 'flex' : 'none';
			};

			const setButtonMode = (
				mode: 'start' | 'cancel',
				phase?: ExportPhase
			) => {
				if (mode === 'start') {
					startExportButton.controllerElement?.html('Start export');
					return;
				}

				startExportButton.controllerElement?.html(
					phase === 'exporting' ? 'Cancel exporting' : (
						'Cancel recording'
					)
				);
			};

			const setPhaseLabel = (phase: ExportPhase) => {
				phaseLabel.html(
					phase === 'recording' ? 'Recording:' : 'Exporting:'
				);
			};

			let currentPhase: ExportPhase | null = null;
			let phaseProgress = 0;
			let isAwaitingFirstStage = false;

			const renderProgressUi = () => {
				const stage =
					(sketch.catalyst?.exportStage as ExportStage | undefined) ||
					'idle';

				if (stage === 'idle') {
					if (isAwaitingFirstStage) {
						setButtonMode('cancel', 'recording');
						setPhaseLabel('recording');
						setProgressVisible(true);
						setProgressBar(phaseProgress);
						return;
					}

					currentPhase = null;
					phaseProgress = 0;
					setProgressBar(0);
					setProgressVisible(false);
					setButtonMode('start');
					return;
				}

				isAwaitingFirstStage = false;
				setProgressVisible(true);

				const phase: ExportPhase =
					stage === 'recording' ? 'recording' : 'exporting';
				if (phase !== currentPhase) {
					currentPhase = phase;
					phaseProgress = 0;
					setProgressBar(0);
				}

				setPhaseLabel(phase);
				setButtonMode('cancel', phase);

				if (phase === 'recording') {
					phaseProgress = Math.max(
						phaseProgress,
						clamp01(sketch.catalyst?.progress || 0)
					);
				} else {
					phaseProgress = Math.max(
						phaseProgress,
						clamp01(getFFmpegProgress())
					);
				}

				setProgressBar(phaseProgress);
			};

			setProgressVisible(false);
			setButtonMode('start');
			renderProgressUi();
			window.setInterval(renderProgressUi, 100);

			panel.open();
			ffmpegInit(gui);
		},
	};
}
