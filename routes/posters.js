const express = require('express')
const router = express.Router();

const {Poster} = require('../models')

// import the poster form 
const {createPosterForm, bootstrapField} = require('../forms')

router.get('/', (req,res) => {
   res.render('posters/posters', {
       'posters':posters.toHTML(bootstrapField)
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
            poster.set('name', form.data.name);
            poster.set('description', form.data.description);
            poster.set('date', form.data.date);
            poster.set('cost', form.data.cost);
            poster.set('stock', form.data.stock);
            await poster.save();
            res.redirect('/posters');
        }
    })
})

module.exports = router;