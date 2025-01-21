import dedent from "dedent";

// Suffix used to mark wrapped entry chunks
const WRAPPER_SUFFIX = "?render-jsx-dom";

export default function() {
  // Wraps entry chunks to invoke the default function and append to DOM
  // Based on: https://rollupjs.org/plugin-development/#resolveid
  return {
    name: "render-jsx-dom",

    // Rewrite entry point ID's to add WRAPPER_SUFFIX if not already present.
    // Use "later" resolvers to handle resolve the wrapped ID.
    async resolveId(source, importer, options) {
      if (!options.isEntry) return null;  // Try next resolver
      const baseResolved = await this.resolve(source, importer, options);
      if (!baseResolved || baseResolved.external) return baseResolved;
      if (baseResolved.id.endsWith(WRAPPER_SUFFIX)) return baseResolved;
      return `${baseResolved.id}${WRAPPER_SUFFIX}`;
    },

    // Add a wrapper to ID's that end in WRAPPER_SUFFIX,
    // referencing the ID with the suffix stripped.
    async load(id) {
      if (!id.endsWith(WRAPPER_SUFFIX)) return null; // Try next loader
      const baseId = id.slice(0, -WRAPPER_SUFFIX.length);
      const code = dedent(`
        import Content from ${JSON.stringify(baseId)};
        document.body.appendChild(Content());
      `);
      return { code, map: { mappings: "" }, moduleSideEffects: "no-treeshake" };
    },
  };
};
