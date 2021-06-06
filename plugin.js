const fs = require('fs')
const hashsum = require("hash-sum");
const compiler = require("vue-template-compiler");
const { compileTemplate, compileStyleAsync } = require('@vue/component-compiler-utils');
const { esbuildCompile } = require('./script-compilers')

module.exports = function plugin(config, pluginOptions) {
  return {
    resolve: {
      input: ['.vue'],
      output: ['.js', '.css']
    },
    async load({ filePath }) {
      const fileContents = await fs.promises.readFile(filePath, 'utf-8');
      const id = hashsum(filePath);
      const { errors, ...descriptor } = compiler.parseComponent(fileContents);

      if (errors && errors.length > 0) {
        console.error(JSON.stringify(errors));
      }

      let jsResult = "";
      if (descriptor.script) {
        jsResult += descriptor.script.content.replace(
          `export default`,
          "const defaultExport ="
        );
      } else {
        jsResult += `const defaultExport = {};`;
      }
      let cssResult, hasScoped = false;
      for (const stylePart of descriptor.styles) {
        // is scoped css
        if (stylePart.scoped) {
          hasScoped = true
        }

        const styleCode = await compileStyleAsync({
          filename: filePath,
          source: stylePart.content,
          id: hasScoped ? `data-v-${id}` : "",
          scoped: hasScoped,
          modules: stylePart.module != null,
          preprocessLang: stylePart.lang,
          // preprocessCustomRequire: (id: string) => require(resolve(root, id))
          // TODO load postcss config if present
        });
        if (styleCode.errors && styleCode.errors.length > 0) {
          console.error(JSON.stringify(styleCode.errors));
        }
        cssResult = cssResult || "";
        cssResult += styleCode.code;
      }

      if (descriptor.template) {
        const templateCode = compileTemplate({
          source: descriptor.template.content,
          filename: filePath,
          compiler
        });

        if (templateCode.errors && templateCode.errors.length > 0) {
          console.error(JSON.stringify(templateCode.errors));
        }

        if (hasScoped) {
          jsResult += `\ndefaultExport._scopeId = "data-v-${id}"\n`
        }
        
        jsResult += `\n${templateCode.code}\n`;
        jsResult += `\ndefaultExport.render = render`;
        jsResult += `\ndefaultExport.staticRenderFns = staticRenderFns`;
        jsResult += `\nexport default defaultExport`;
      }

      return {
        '.js': esbuildCompile(jsResult, 'jsx'),
        '.css': cssResult,
      };
    },
  };
};
