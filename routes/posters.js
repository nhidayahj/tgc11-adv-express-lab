const express = require('express')
const router = express.Router();

const { Poster, Category, Tag } = require('../models')
// import in the DAL module
const posterDataLayer = require('../dal/poster')


// import the poster and search forms 
const { createPosterForm, createSearchForm, bootstrapField } = require('../forms')
// below middleware ensures that only certain pages are accessible if user is signed in 
const {checkIfAuthenticated} = require('../middleware')


router.get('/all-posters', async (req, res) => {
    // the "withRelated" key specify the name of r/s on the model to load
    // name of the r/s is the function name that returns a r/s of model
    // look the model file
    // let posters = await Poster.collection().fetch({
    //     'withRelated': ['category', 'tags']
    // });
    
    // res.render('posters/posters', {
    //     'posters': posters.toJSON(),

    // })
    // console.log(posters.toJSON())

    // get all categories from DAL
    const allCategories = await posterDataLayer.getAllCategories()
    
    // below is to manually add in a category '----' with index/value 0 
    allCategories.unshift([0, '-----'])

    // get all tags 
    const allTags = await posterDataLayer.getAllTags();
    // create the search form
    const searchForm = createSearchForm(allCategories, allTags);

    // create a query builder aka base query 
    // (i.e. SELECT * FROM posters)
    let q = Poster.collection();

    searchForm.handle(req, {
        'empty':async(form) => {
            // if form is empty, display all posters 
            // fetch() executes the query
            let posters = await q.fetch({
                withRelated:['category', 'tags']
            }); 

            res.render('posters/posters', {
                'posters':posters.toJSON(),
                'form':form.toHTML(bootstrapField)
            })
        }, 
        'error':async(form) => {
            let posters = await q.fetch({
                withRelated:['category', 'tags']
            }); 
            res.render('posters/posters', {
                'form':form.toHTML(bootstrapField),
                'posters':posters.toJSON()
            })
        }, 
        'success':async(form) => {
            if (form.data.title) {
                // adding the WHERE clause to end of query 
                // (ie. WHERE title LIKE '%title%')
                 q = q.where('title', 'like', '%' + form.data.title +'%')
            }

            if (form.data.min_cost) {
                q = q.where('cost', '>=', form.data.min_cost)
            }

            if (form.data.max_cost) {
                q = q.where('cost', '<=', form.data.max_cost)
            }

            if (form.data.category_id !== '0') {
                q = q.query('join', 'categories', 'category_id', 'categories.id')
                    .where('categories.name', 'like', '%' + req.query.category_id + '%')
            }

            if (form.data.tags) {
               q = q.query('join','posters_tags', 'posters.id', 'poster_id')
                        .where('tag_id', 'in', form.data.tags.split(','))
            }
            
            let posters = await q.fetch({
                withRelated:['category', 'tags']
            })


            res.render('posters/posters', {
                'form':form.toHTML(bootstrapField),
                'posters':posters.toJSON()
            })
        }
    })

})


router.get('/create', async (req, res) => {
    const allCategories = await posterDataLayer.getAllCategories()
    const allTags = await posterDataLayer.getAllTags();

    const posterForm = createPosterForm(allCategories, allTags);
    // send cloudinary params 
    res.render('posters/create', {
        'form': posterForm.toHTML(bootstrapField),
        'cloudinaryName':process.env.CLOUDINARY_NAME,
        'cloudinaryApiKey':process.env.CLOUDINARY_API_KEY,
        'cloudinaryPreset':process.env.CLOUDINARY_UPLOAD_PRESET
    })
})

router.post('/create', async (req, res) => {
    const allCategories = await posterDataLayer.getAllCategories();
    const allTags = await posterDataLayer.getAllTags();
    

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
    const allCategories = await posterDataLayer.getAllCategories()

     //fetch all tags
    const allTags = await posterDataLayer.getAllTags();

    const posterToEdit = await posterDataLayer.getPosterById(posterId)

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

    // 1. set the image url in poster form
    posterForm.fields.image_url.value=posterToEdit.get('image_url')

    res.render('posters/update', {
        'form': posterForm.toHTML(bootstrapField),
        'poster': posterJSON,
        // 2. send to hbs file all cloudinary information
        'cloudinaryName': process.env.CLOUDINARY_NAME,
        'cloudinaryApiKey': process.env.CLOUDINARY_API_KEY,
        'cloudinaryPreset': process.env.CLOUDINARY_UPLOAD_PRESET,
    })
})


router.post('/:poster_id/update', async (req, res) => {
    // fetch the product we want to update 
    // i.e, select * from products where id = ${product_id}
    const posterToEdit = await Poster.where({
        'id': req.params.poster_id
    }).fetch({
        'require': true,
        'withRelated':['tags', 'category']
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
                'poster':posterJSON,
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})


router.get('/:poster_id/delete', async (req, res) => {
    // fetch the product we want to delete
    let posterId = req.params.poster_id
    const posterToDelete = await Poster.where({
        'id': posterId
    }).fetch({
        'require': true
    })

    res.render('posters/delete', {
        'poster': posterToDelete.toJSON()
    })
})

router.post('/:poster_id/delete', async (req, res) => {
    // fetch the product we want to delete
    let posterId = req.params.poster_id;
    let posterToDelete = await Poster.where({
        'id': posterId
    }).fetch({
        'require': true
    })

    await posterToDelete.destroy();
    req.flash("success_messages", `Poster is successfully deleted`)
    res.redirect('/posters/all-posters')
})


module.exports = router;