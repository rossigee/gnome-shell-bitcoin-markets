import { GettextExtractor, JsExtractors } from 'gettext-extractor';

const extractor = new GettextExtractor();

extractor
  .createJsParser([
    JsExtractors.callExpression('_', {
      arguments: {
        text: 0,
        context: 1,
      },
    }),
  ])
  .parseFilesGlob('./src/**/*.@(ts|js|tsx|jsx)');

extractor.savePotFile(process.argv[2]);

extractor.printStats();
