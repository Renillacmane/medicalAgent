module.exports = {
  default: [
    '--require-module ts-node/register',
    '--require testes/cucumber/support/**/*.ts',
    '--require testes/cucumber/step-definitions/**/*.ts',
    'testes/cucumber/features/**/*.feature',
  ].join(' '),
};
