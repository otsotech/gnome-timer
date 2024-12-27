'use strict';

import GLib from 'gi://GLib';
import St from 'gi://St';
import GObject from 'gi://GObject';
import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

const REFRESH_INTERVAL = 1;

function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const hh = hrs.toString().padStart(2, '0');
    const mm = mins.toString().padStart(2, '0');
    const ss = secs.toString().padStart(2, '0');

    return `${hh}:${mm}:${ss}`;
}

const Timer = GObject.registerClass(
class Timer extends PanelMenu.Button {
    constructor() {
        super(0.0, 'Timer');

        this._seconds = 0;
        this._isRunning = false;

        this._timerLabel = new St.Label({
            text: '00:00:00',
            y_align: Clutter.ActorAlign.CENTER,
        });

        this.add_child(this._timerLabel);
        this._timeoutId = null;
    }

    startTimer() {
        if (!this._isRunning) {
            this._isRunning = true;
            this._timeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, REFRESH_INTERVAL, () => {
                this._seconds++;
                this._timerLabel.text = formatTime(this._seconds);
                return this._isRunning;
            });
        }
    }

    stopTimer() {
        this._isRunning = false;
        if (this._timeoutId) {
            GLib.source_remove(this._timeoutId);
            this._timeoutId = null;
        }
    }

    resetTimer() {
        this.stopTimer();
        this._seconds = 0;
        this._timerLabel.text = formatTime(this._seconds);
    }
}
);

let timer = null;

export default class TimerExtension {
    enable() {
        timer = new Timer();
        Main.panel.addToStatusArea('timer', timer, 1, 'right');
        timer.startTimer();
    }

    disable() {
        if (timer) {
            timer.stopTimer();
            timer.destroy();
            timer = null;
        }
    }
}
