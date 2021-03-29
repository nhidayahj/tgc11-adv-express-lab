const express = require('express')
const router = express.Router();

const { Poster, Category, Tag } = require('../models')

// import the poster form 
const { createPosterForm, bootstrapField } = require('../forms')
const {checkIfAuthenticated} = require('../middleware')

router.get('/all-posters', async (req, res) => {
    // the "withRelated" key specify the name of r/s on the model to load
    // name of the r/s is the function name that returns a r/s of model
    // look the model file
    let posters = await Poster.collection().fetch({
        'withRelated': ['category', 'tags']
    });
    
    res.render('posters/posters', {
        'posters': posters.toJSON(),

    })
    // console.log(posters.toJSON())
})


router.get('/create', async (req, res) => {
    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')]
    })

    const allTags = await Tag.fetchAll().map((tag)=>{
        return [tag.get('id'), tag.get('name')]
    })

    const posterForm = createPosterForm(allCategories, allTags);
    res.render('posters/create', {
        'form': posterForm.toHTML(bootstrapField)
    })
})

router.post('/create', async (req, res) => {
    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')]
    })
    const allTags = await Tag.fetchAll().map((tag)=>{
        return [tag.get('id'), tag.get('name')]
    })

    // inject in all the categories and tags
    const posterForm = createPosterForm(allCategories, allTags);

    posterForm.handle(req, {
        'success': async (form) => {
            let {tags, ...posterData} = form.data
            // below set the form fields from the desrtuctured object above
            const poster = new Poster();
            poster.set(posterData)
            await poster.save();

            // below is if tags are selected
            if (tags) {
                await poster.tags().attach(tags.split(','))
            }
             // below commenteds are the manual setting
            // poster.set('title', form.data.title);
            // poster.set('description', form.data.description);
            // poster.set('date', form.data.date);
            // poster.set('cost', form.data.cost);
            // poster.set('stock', form.data.stock);
            // poster.set('width', form.data.width);
            // poster.set('height', form.data.height);
            // poster.set('category_id', form.data.category_id);
            // poster.set('tags', form.data.tags);

            req.flash('success_messages', `${poster.get('title')} has successfully been added!`)
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
    // fetch all the categories 
    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')]
    })

     //fetch all tags
    const allTags = await Tag.fetchAll().map((tag)=>{
        return [tag.get('id'), tag.get('name')]
    })

    const posterToEdit = await Poster.where({
        'id': posterId
    }).fetch({
        'required': true,
        'withRelated':['tags']
    })

    const posterJSON = posterToEdit.toJSON()
    // get the selected tags 
    const selectedTags = posterJSON.tags.map((tag)=> tag.id)

    const posterForm = createPosterForm(allCategories, allTags);
    posterForm.fields.title.value = posterToEdit.get('title')
    posterForm.fields.description.value = posterToEdit.get('description')
    posterForm.fields.cost.value = posterToEdit.get('cost')
    posterForm.fields.date.value = posterToEdit.get('date')
    posterForm.fields.stock.value = posterToEdit.get('stock')
    posterForm.fields.width.value = posterToEdit.get('width')
    posterForm.fields.height.value = posterToEdit.get('height')
    posterForm.fields.category_id.value = posterToEdit.get('category_id')
    posterForm.fields.tags.value = selectedTags

    res.render('posters/update', {
        'form': posterForm.toHTML(bootstrapField),
        'poster': posterJSON
    })
})


router.post('/:poster_id/update', async (req, res) => {
    // fetch the product we want to update 
    // i.e, select * from products where id = ${product_id}
    const posterToEdit = await Poster.where({
        'id': req.params.poster_id
    }).fetch({
        'required': true,
        'withRelated':['tags']
    })

    const posterJSON = posterToEdit.toJSON();
    


    // process the form
    const posterForm = createPosterForm()
    posterForm.handle(req, {
        'success': async (form) => {
            let {tags, ...posterData} = form.data;
            posterToEdit.set(posterData);
            posterToEdit.save()

            //get the array of the new tag ids
            let newTagsId = tags.split(',')
            const existingTagsId = posterJSON.tags.map((tag)=>{tag.id})

            posterToEdit.tags().detach(existingTagsId);
            posterToEdit.tags().attach(newTagsId);

           
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
    req.flash("success_messages", `Poster ${poster.get('title')} is successfully deleted`)
    res.redirect('/posters/all-posters')
})


module.exports = router;