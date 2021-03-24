const express = require('express')
const router = express.Router();

const {Poster} = require('../models')

// import the poster form 
const {createPosterForm, bootstrapField} = require('../forms')

router.get('/all-posters', async (req,res) => {
    let posters = await Poster.collection().fetch();
   res.render('posters/posters', {
       'posters':posters.toJSON()
   })
})


router.get('/create', (req,res) => {
   const posterForm = createPosterForm();
   res.render('posters/create', {
       'form':posterForm.toHTML(bootstrapField)
   })
})

router.post('/create', async (req,res) => {
    const posterForm = createPosterForm();
    posterForm.handle(req,{
        'success':async (form) => {
            const poster = new Poster();
            poster.set('title', form.data.title);
            poster.set('description', form.data.description);
            poster.set('date', form.data.date);
            poster.set('cost', form.data.cost);
            poster.set('stock', form.data.stock);
            await poster.save();
            req.flash('success_messages', `${form.data.title} has successfully been added!`)
            res.redirect('/posters/all-posters');
        },
        'error': (form) => {
            req.flash('error_messages', "There is an error to your subbmission. Please try again")
            res.render('./posters/create', {
                'form':form.toHTML(bootstrapField)
            })
        }

    })
})

router.get('/:poster_id/update', async(req,res) => {
    let posterId = req.params.poster_id
    const poster = await Poster.where({
        'id':posterId
    }).fetch({
        required:true
    })

    const posterForm = createPosterForm();
    posterForm.fields.title.value = poster.get('title')
    posterForm.fields.description.value = poster.get('description')
    posterForm.fields.cost.value = poster.get('cost')
    posterForm.fields.date.value = poster.get('date')
    posterForm.fields.stock.value = poster.get('stock')
    posterForm.fields.width.value = poster.get('width')
    posterForm.fields.height.value = poster.get('height')

})

module.exports = router;