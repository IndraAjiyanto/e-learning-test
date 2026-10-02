const Handlebars = require('handlebars');
const { numberHelpers } = require('../dist/common/helpers/number.helpers');

Handlebars.registerHelper(numberHelpers);
Handlebars.registerHelper('isPaidProgram', (course) => {
  if (!course) return false;
  return Boolean(
    course.checkPaid === true ||
    (course.category && course.category.type === 'Paid Program') ||
    (course.price !== null && course.price !== undefined && Number(course.price) > 0)
  );
});

const template = Handlebars.compile(`
{{#if (isPaidProgram course)}}
PAID: Price={{formatRupiah course.price}}, Promo={{formatRupiah course.promo}}
{{else}}
FREE: Form={{course.form}}
{{/if}}
`);

console.log('Test 1 (checkPaid true):', template({ course: { checkPaid: true, price: 1000000, promo: 500000 } }).trim());
console.log('Test 2 (checkPaid false, cat Paid Program):', template({ course: { checkPaid: false, price: 1000000, promo: 500000, category: { type: 'Paid Program' } } }).trim());
console.log('Test 3 (checkPaid false, price 1000000):', template({ course: { checkPaid: false, price: 1000000, promo: 500000 } }).trim());
console.log('Test 4 (Free Program):', template({ course: { checkPaid: false, price: 0, promo: 0, form: 'https://form.com', category: { type: 'Free Program' } } }).trim());
