#!/usr/bin/gjs

const GLib = imports.gi.GLib;

const extensionId = 'bitcoin-markets@ottoallmendinger.github.com';

function runCommand(cmd) {
    try {
        const [success, stdout, stderr, exitCode] = GLib.spawn_command_line_sync(cmd);
        // Use TextDecoder to properly convert Uint8Array to string
        const decoder = new TextDecoder();
        return {
            exitCode,
            stdout: decoder.decode(stdout).trim(),
            stderr: decoder.decode(stderr).trim(),
        };
    } catch (e) {
        return { error: e.message };
    }
}

try {
    // Disable the extension
    let result = runCommand(`gnome-extensions disable '${extensionId}'`);
    if (result.error) {
        throw new Error(result.error);
    }
    if (result.exitCode !== 0 && result.exitCode !== 1) {
        // Exit code 1 is normal if extension is already disabled
        console.error("Error disabling extension:", result.stderr);
    }

    // Enable the extension
    result = runCommand(`gnome-extensions enable '${extensionId}'`);
    if (result.error) {
        throw new Error(result.error);
    }
    if (result.exitCode === 0) {
        console.log("Extension reloaded successfully");
    } else {
        console.error("Error enabling extension:", result.stderr);
    }
} catch (e) {
    console.error("Error:", e.message);
}
