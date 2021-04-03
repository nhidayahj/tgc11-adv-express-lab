// this file are all the routes when using an API 
// this is tested using the ARC (Advanced Rest Client)

const express = require('express');
const router = express.Router();

const posterDataLayer = require('../../dal/poster')
const {Poster} = require('../../models')
const {createPosterForm} = require('../../forms')

router.get('/', async(req,res)=> {
    const allPosters = await posterDataLayer.getAllPosters()
    res.send(allPosters)
})

// when sending data to API routes, 
// the req.body MUST be in JSON format
// hence in the root index.js include, passing .json() as the 2nd argumnet
router.post('/', async (req,res) => {
    const allCategories = await posterDataLayer.getAllCategories();
    const allTags = await posterDataLayer.getAllTags()

    const posterForm = await createPosterForm(allCategories, allTags)
    posterForm.handle(req, {
        'success': async(form) => {
            let {tags, ...posterData} = form.data;
            const newPoster = new Poster(posterData)
            await newPoster.save()

            // save the tags
            if (tags) {
                await newPoster.tags().attach(tags.split(','))
            }
            // sending back, so that React can take in the 'id' etc
            res.send(newPoster)
        }, 
        'error': (form) => {
            let errors = {}
            for (let key in forms.fields) {
                if(form.fields[key].error) {
                    errors[key] = form.fields[key].error
                }
            }
            // JSON.stringify converts JS object into strings
            res.send(JSON.stringify(errors))
        }
    })
})

module.exports = router;