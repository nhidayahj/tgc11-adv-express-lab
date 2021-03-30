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


const createPosterForm = (categories, tags) => {
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
        'date': fields.date({
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
        }),
        'category_id': fields.string({
            label:'Category',
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label','text-primary']
            },
            widget:widgets.select(),
            choices:categories,
        }),
        'tags': fields.string({
            label:'Tags',
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label','text-primary']
            },
            widget:widgets.multipleSelect(),
            choices:tags,
        }),
        'image_url':fields.string({
            required:true, 
            errorAfterField:true,
            widget:widgets.hidden()
        })

    })
}

const createRegisterForm = () => {
    return forms.create({
        'username': fields.string({
            'required':true, 
            'errorAfterField':true,
            'cssClasses':{
                 label: ['form-label', 'text-primary']
            }
        }),
        'email': fields.string({
            'required':true, 
            'errorAfterField':true,
            'cssClasses':{
                 label: ['form-label', 'text-primary']
            },
            'validators':[validators.email()]
        }),
        // change the field type to be a 'password' field
        'password': fields.password({
            'required':true, 
            'errorAfterField':true,
            'cssClasses':{
                 label: ['form-label', 'text-primary']
            }
        }),
        // this additional column is to counter check is to store pwds and checked if
        // it matches
        'confirm_password': fields.password({
            'required':true, 
            'errorAfterField':true,
            'cssClasses':{
                 label: ['form-label', 'text-primary']
            },
            'validators':[validators.matchField('password')]
        })
    })
}

const createLoginForm = () => {
    return forms.create({
        'email':fields.string({
            'required':true, 
            'errorAfterField':true, 
            'cssClasses':{
                label: ['form-label', 'text-primary']
            }, 
            'validators': [validators.email()]
        }),
        'password':fields.password({
            'required':true, 
            'errorAfterField':true, 
            'cssClasses':{
                label: ['form-label', 'text-primary']
            }
        })
    })
}

const createSearchForm = (categories, tags) => {
    return forms.create({
        'title': fields.string({
            label:'Poster Title',
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label', 'text-primary']
            },
            
        }),
        'min_cost': fields.string({
            label:'Poster min. cost',
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label','text-primary']
                
            },
            validators:[validators.integer()]
        }),
        'max_cost': fields.string({
            label:'Poster max. cost',
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label','text-primary']
            },
            validators:[validators.integer()]
        }),
        'category_id': fields.string({
            label:'Poster Category',
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label','text-primary']
            }, 
            widget:widgets.select(),
            choices:categories
        }),
        'tags': fields.string({
            label:'Poster Tags',
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label','text-primary']
            },
            widget:widgets.multipleSelect(),
            choices:tags
        })
    })
}


module.exports = {createPosterForm,
                    createRegisterForm, createLoginForm, 
                    createSearchForm, bootstrapField}