const express = require('express')
const router = express.Router();

const { Poster, Category } = require('../models')

// import the poster form 
const { createPosterForm, bootstrapField } = require('../forms')

router.get('/all-posters', async (req, res) => {
    // the "withRelated" key specify the name of r/s on the model to load
    // name of the r/s is the function name that returns a r/s of model
    // look the model file
    let posters = await Poster.collection().fetch({
        'withRelated': ['category']
    });
    res.render('posters/posters', {
        'posters': posters.toJSON()
    })
})


router.get('/create', async (req, res) => {
    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')]
    })
    const posterForm = createPosterForm(allCategories);
    res.render('posters/create', {
        'form': posterForm.toHTML(bootstrapField)
    })
})

router.post('/create', async (req, res) => {
    const posterForm = createPosterForm();
    posterForm.handle(req, {
        'success': async (form) => {
            const poster = new Poster();
            // below commenteds are the manual setting
            poster.set('title', form.data.title);
            poster.set('description', form.data.description);
            poster.set('date', form.data.date);
            poster.set('cost', form.data.cost);
            poster.set('stock', form.data.stock);
            poster.set('width', form.data.width);
            poster.set('height', form.data.height);


            await poster.save();
            req.flash('success_messages', `${form.data.title} has successfully been added!`)
            res.redirect('/posters/all-posters');
        },
        'error': (form) => {
            req.flash('error_messages', "There is an error to your subbmission. Please try again")
            res.render('./posters/create', {
                'form': form.toHTML(bootstrapField)
            })
        }

    })
})

router.get('/:poster_id/update', async (req, res) => {
    let posterId = req.params.poster_id
    const poster = await Poster.where({
        'id': posterId
    }).fetch({
        required: true
    })

    // fetch all the categories 
    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')]
    })

    const posterForm = createPosterForm(allCategories);
    posterForm.fields.title.value = poster.get('title')
    posterForm.fields.description.value = poster.get('description')
    posterForm.fields.cost.value = poster.get('cost')
    posterForm.fields.date.value = poster.get('date')
    posterForm.fields.stock.value = poster.get('stock')
    posterForm.fields.width.value = poster.get('width')
    posterForm.fields.height.value = poster.get('height')
    posterForm.fields.category_id.value = poster.get('category_id')

    res.render('posters/update', {
        'form': posterForm.toHTML(bootstrapField),
        'poster': poster.toJSON()
    })
})


router.post('/:poster_id/update', async (req, res) => {
    // fetch the product we want to update 
    const poster = await Poster.where({
        'id': req.params.poster_id
    }).fetch({
        'required': true
    })

    // process the form
    const posterForm = createPosterForm()
    posterForm.handle(req, {
        'success': async (form) => {
            poster.set(form.data);
            poster.save();
            req.flash('success_messages', `${form.data.title} is updated`)
            res.redirect('/posters/all-posters')
        },
        'error': async (form) => {
            req.flash("error_messages", "There is an error to your updated field. Please check again.")
            res.render('posters/update', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})


router.get('/:poster_id/delete', async (req, res) => {
    // fetch the product we want to delete
    let posterId = req.params.poster_id
    const poster = await Poster.where({
        'id': posterId
    }).fetch({
        'require': true
    })

    res.render('posters/delete', {
        'poster': poster.toJSON()
    })
})

router.post('/:poster_id/delete', async (req, res) => {
    // fetch the product we want to delete
    let posterId = req.params.poster_id;
    let poster = await Poster.where({
        'id': posterId
    }).fetch({
        'require': true
    })

    await poster.destroy();
    req.flash("success_messages", "Poster is successfully deleted")
    res.redirect('/posters/all-posters')
})

module.exports = router;