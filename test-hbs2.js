const Handlebars = require('handlebars');
Handlebars.registerHelper('concat', function (...args) {
  const strings = args.slice(0, -1);
  return strings.join('');
});
Handlebars.registerPartial('myPartial', '<form :action="{{deleteFormAction}}">');
const template = Handlebars.compile(`{{> myPartial deleteFormAction=(concat "'/quiz/' + quiz.id + '/" weeks.id "?_method=DELETE'") }}`);
console.log(template({ weeks: { id: "1234-uuid" } }));
