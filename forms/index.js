// import in caolan forms 
const forms = require('forms');
const fields = forms.fields;
const validators = forms.validators;
const widgets = require('forms').widgets;

var bootstrapField = function (name, object) {
    if (!Array.isArray(object.widget.classes)) { object.widget.classes = []; }

    if (object.widget.classes.indexOf('form-control') === -1) {
        object.widget.classes.push('form-control');
    }

    var validationclass = object.value && !object.error ? 'is-valid' : '';
    validationclass = object.error ? 'is-invalid' : validationclass;
    if (validationclass) {
        object.widget.classes.push(validationclass);
    }

    var label = object.labelHTML(name);
    var error = object.error ? '<div class="invalid-feedback">' + object.error + '</div>' : '';

    var widget = object.widget.toHTML(name, object);
    return '<div class="form-group">' + label + widget + error + '</div>';
};


const createPosterForm = () => {
    return forms.create({
        'title': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label', 'text-primary']
            },
            
        }),
        'description': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label','text-primary']
            }
        }),
        'date': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label','text-primary']
            },
            widget:widgets.date()
        }),
        'cost': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label','text-primary']
                
            },
            validators:[validators.integer()]
        }),
        'stock': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label','text-primary']
            }
        }),
        'width': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label','text-primary']
            },
            validators:[validators.integer()]
        }),
        'height': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label','text-primary']
            },
            validators:[validators.integer()]
        })
    })
}

module.exports = {createPosterForm, bootstrapField}