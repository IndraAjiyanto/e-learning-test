const fs = require('fs');
const path = require('path');
const hbs = require('handlebars');
const { logicHelpers } = require(path.resolve('./dist/common/helpers/logic.helpers'));

hbs.registerHelper(logicHelpers);
hbs.registerHelper('roles', () => true);
hbs.registerHelper('default', (a, b) => a || b);
hbs.registerHelper('json', (a) => JSON.stringify(a));
hbs.registerHelper('borderClass', () => '');

const segTemplate = fs.readFileSync('src/views/partials/components/ui/admin/form/segmented-button.hbs', 'utf8');
hbs.registerPartial('components/ui/admin/form/segmented-button', segTemplate);

const testTemplate = hbs.compile(`
  {{> components/ui/admin/form/segmented-button
    alpineVar="paidClass"
    options=(array
      (obj 'label' 'Yes' 'value' 'true' 'onClick' 'paidClass = true; updateCompleteness()' 'activeIf' 'paidClass')
      (obj 'label' 'No' 'value' 'false' 'onClick' 'paidClass = false; updateCompleteness()' 'activeIf' '!paidClass')
    )
  }}
`);

console.log(testTemplate({}));
