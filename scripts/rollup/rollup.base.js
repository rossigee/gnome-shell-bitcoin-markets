import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export const buildPath = 'dist';

const ts = typescript({ tsconfig: './tsconfig.json' });

const imports = {
  '@gnome-shell/misc/util': { name: 'resource://EXT_ROOT/misc/util.js' },
  '@gnome-shell/misc/config': { name: 'resource://EXT_ROOT/misc/config.js' },
  '@gnome-shell/misc/signals': { name: 'resource://EXT_ROOT/misc/signals.js' },
  '@gnome-shell/misc/animationUtils': { name: 'resource://EXT_ROOT/misc/animationUtils.js' },

  '@gnome-shell/extensions/extension': { name: 'resource://EXT_ROOT/extensions/extension.js' },
  '@gnome-shell/extensions/prefs': { name: 'resource:///EXT_ROOT/extensions/prefs.js' },

  '@gnome-shell/ui/layout': { name: 'resource://EXT_ROOT/ui/layout.js' },
  '@gnome-shell/ui/main': { name: 'resource://EXT_ROOT/ui/main.js' },
  '@gnome-shell/ui/messageTray': { name: 'resource://EXT_ROOT/ui/messageTray.js' },
  '@gnome-shell/ui/lightbox': { name: 'resource://EXT_ROOT/ui/lightbox.js' },
  '@gnome-shell/ui/dialog': { name: 'resource://EXT_ROOT/ui/dialog.js' },
  '@gnome-shell/ui/modalDialog': { name: 'resource://EXT_ROOT/ui/modalDialog.js' },
  '@gnome-shell/ui/popupMenu': { name: 'resource://EXT_ROOT/ui/popupMenu.js' },
  '@gnome-shell/ui/panelMenu': { name: 'resource://EXT_ROOT/ui/panelMenu.js' },
};

function getPaths(extRoot) {
  return Object.fromEntries(
    Object.entries(imports).map(([name, { name: mapping }]) => {
      try {
        return [name, mapping.replace(/EXT_ROOT/g, extRoot)];
      } catch (e) {
        console.error(`Error while processing ${name} with mapping ${mapping} ${typeof mapping}`);
        throw e;
      }
    }),
  );
}

function pluginStripImportVersion() {
  return {
    name: 'strip-import-version',
    resolveId(source) {
      if (source.includes('?version=')) {
        return {
          id: source.split('?version=')[0],
          external: true,
        };
      }
      return null;
    }
  };
}

export function targetWithExtRoot(extRoot, { input, output }) {
  return {
    input,
    output: {
      format: 'esm',
      paths: getPaths(extRoot),
      ...output,
    },
    plugins: [
      commonjs(),
      json(),
      nodeResolve({
        preferBuiltins: false,
      }),
      ts,
      pluginStripImportVersion(),
    ],
  };
}

export function targetShell({ input, output }) {
  return targetWithExtRoot('/org/gnome/shell', { input, output });
}

export function targetShellExt({ input, output }) {
  return targetWithExtRoot('/org/gnome/Shell/Extensions/js', { input, output });
}
