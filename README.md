# rollup-plugin-automount-dom

This is a plugin for [the Rollup bundler](https://rollupjs.org/) which wraps Javascript entry points with code that
- imports the default export from the original entry point module
- invokes it as a function
- passes the result to `document.body.appendChild(...)`

## Why?

This oddly specific little plugin fills a tiny gap in the Rollup tooling for simple vanilla-JS sites based on [MDX](https://mdxjs.com/) and [JSX](https://legacy.reactjs.org/docs/introducing-jsx.html):
- [**@mdx-js/rollup**](https://mdxjs.com/packages/rollup/) - imports MDX files as JS modules using [any JSX engine](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)
- [**jsx-dom**](https://github.com/alex-kinokon/jsx-dom) (and similar) - a JSX engine that creates component functions which return simple DOM nodes
- _(this plugin goes here, wrapping functions which return DOM nodes with code to "mount" those nodes on the page)_
- [**@rollup/plugin-html**](https://github.com/rollup/plugins/tree/master/packages/html#readme) - emits basic HTML files with a `<script>` import for JS modules

This combination lets Rollup turn Markdown-with-HTML-and-JS (`.mdx`), plain-Markdown (`.md`), and HTML-with-JS (`.jsx`) files into browser-ready HTML-and-JS bundles, individually or en masse, without using custom templates or frameworks like React.

However, please note these important caveats!
- You end up with trivial HTML that imports Javascript that builds a DOM at runtime. Compared to static HTML, this is harder for search engines to index, fails without good Javascript support, and is a bit slower and bigger.
- You won't have the component scoping and state management features of a full framework like [React](https://react.dev/).
- You also won't have the content management niceties of proper static site generator like [Hugo](https://gohugo.io/).
- There are many, many other ways to render MDX and JSX.

Nevertheless, some of us do find this "vanilla MDX/JSX approach" a nice balance between the tedious repetition of raw HTML and the all-encompassing paradigm layer cakes of web frameworks. Your mileage will almost certainly vary!

## Usage

Add this module:
```bash
$ npm i rollup-plugin-automount-dom
```

Configure Rollup to use it, in `rollup.config.js` or equivalent:
```js
import rollupAutomountDOM from "rollup-plugin-automount-dom";
...
export default {
  ...
  plugins: [
    ...
    rollupAutomountDOM(),
    ...
  ],
};
```

At present the plugin has no arguments and no configuration, and the wrapper behavior is trivial. PRs are welcome for other features that might be helpful, keeping in mind that anything particularly idiosyncratic might be better handled with an entirely custom plugin (or template for `plugin-html`, etc).

## Minimal example

Use this `rollup.config.mjs`

```js
import fg from "fast-glob";
import rollupAutomountDOM from "rollup-plugin-automount-dom";
import rollupHTML from "@rollup/plugin-html";
import rollupMDX from "@mdx-js/rollup";
import { nodeResolve as rollupNodeResolve } from "@rollup/plugin-node-resolve";

export default fg.sync("*.mdx").map((input) => ({
  input,
  jsx: { mode: "automatic", jsxImportSource: "jsx-dom" },
  output: { directory: "dist", format: "iife" },
  plugins: [
    rollupAutomountDOM(),
    rollupHTML({ fileName: input.replace(/mdx$/, "html"), title: "" }),
    rollupMDX({ jsxImportSource: "jsx-dom" }),
    rollupNodeResolve(),
  ],
}));
```

And this `hello.mdx`

```md
const where = "World";

# Hello {where}!

Lorem ipsum etc etc.
```

And then run

```bash
npm i fast-glob jsx-dom @mdx-js/rollup rollup rollup-plugin-automount-dom @rollup/plugin-html @rollup/plugin-node-resolve
npx rollup -c
```

And finally load `dist/hello.html` in your browser and you should see something like this

![image](https://github.com/user-attachments/assets/5e5ef507-c175-44ec-8318-111a62f9fdd1)

Tada! 🎉
