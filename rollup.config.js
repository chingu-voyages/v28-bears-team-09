import svelte from "rollup-plugin-svelte-hot";
import Hmr from "rollup-plugin-hot";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import { copySync, removeSync } from "fs-extra";
import { spassr } from "spassr";
import getConfig from "@roxi/routify/lib/utils/config";
import { injectManifest } from "rollup-plugin-workbox";
import replace from "@rollup/plugin-replace";

const { distDir } = getConfig(); // use Routify's distDir for SSOT
const assetsDir = "assets";
const buildDir = `dist/build`;
const isNollup = !!process.env.NOLLUP;
const production = !process.env.ROLLUP_WATCH;

// clear previous builds
removeSync(distDir);
removeSync(buildDir);

const serve = () => ({
  writeBundle: async () => {
    const options = {
      assetsDir: [assetsDir, distDir],
      entrypoint: `${assetsDir}/__app.html`,
      script: `${buildDir}/main.js`,
    };
    spassr({ ...options, port: 5000 });
    spassr({
      ...options,
      ssr: true,
      port: 5005,
      ssrOptions: { inlineDynamicImports: true, dev: true },
    });
  },
});
const copyToDist = () => ({
  writeBundle() {
    copySync(assetsDir, distDir);
  },
});

export default {
  preserveEntrySignatures: false,
  input: [`src/main.js`],
  output: {
    sourcemap: true,
    format: "esm",
    dir: buildDir,
    // for performance, disabling filename hashing in development
    chunkFileNames: `[name]${(production && "-[hash]") || ""}.js`,
  },
  plugins: [
    production // process undefined fix for @urql/svelte
      ? replace({ "process.env.NODE_ENV": JSON.stringify("production") })
      : replace({ "process.env.NODE_ENV": JSON.stringify("development") }),

    svelte({
      dev: !production, // run-time checks
      // Extract component CSS — better performance
      css: (css) => css.write(`bundle.css`),
      hot: isNollup,
      preprocess: [
        require("svelte-windicss-preprocess").preprocess({
          config: "tailwind.config.js", // tailwind config file path (optional)
          compile: true, // false: interpretation mode; true: compilation mode
          prefix: "windi-", // set compilation mode style prefix
          globalPreflight: true, // set preflight style is global or scoped
          globalUtility: true, // set utility style is global or scoped
        }),
      ],
    }),

    // resolve matching modules from current working directory
    resolve({
      browser: true,
      dedupe: (importee) => !!importee.match(/svelte(\/|$)/),
    }),
    commonjs(),

    production && terser(),
    !production && !isNollup && serve(),
    !production && !isNollup && livereload(distDir), // refresh entire window when code is updated
    !production && isNollup && Hmr({ inMemory: true, public: assetsDir }), // refresh only updated code
    {
      // provide node environment on the client
      transform: (code) => ({
        code: code.replace("process.env.NODE_ENV", `"${process.env.NODE_ENV}"`),
        map: { mappings: "" },
      }),
    },
    injectManifest({
      globDirectory: assetsDir,
      globPatterns: ["**/*.{js,css,svg}", "__app.html"],
      swSrc: `src/sw.js`,
      swDest: `${distDir}/serviceworker.js`,
      maximumFileSizeToCacheInBytes: 10000000, // 10 MB,
      mode: "production",
    }),
    production && copyToDist(),

    !production && // log DB API link
      setTimeout(() => {
        const msg =
          "\nView GraphQL Playground to explore your site's data and schema\n\n  ";
        const link = "https://dashboard.fauna.com/graphql/@db/DShift";
        console.log(msg, "\x1b[35m\x1b[47m", link, "\x1b[0m", "\n");
      }, 0),
  ],
  watch: {
    clearScreen: false,
    buildDelay: 100,
  },
};