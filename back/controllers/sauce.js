const Sauce = require("../models/sauce");
const fs = require('fs');
const app = require('../app');


exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauces);
  delete req.body._id;
  const sauces = new Sauce({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      likes: 0,
      dislikes: 0,
      usersLiked: [],
      usersDisliked: []
  });
  sauces.save()
      .then(() => res.status(201).json({message: 'Sauce added'}))
      .catch(error => res.status(401).json({ error }))
};


exports.getAllSauces = (req, res, next) => {
  Sauce.find()
      .then(sauces => {
          // Suppression des anciennes images de sauces dont l'image a été mdifiée
          let arrImagesDB =  [];
          for (idx in sauces) {//Liste des images des sauces de la base de données
              const filename = sauces[idx].imageUrl.split('/images/')[1];
              arrImagesDB.push(filename)
          }
          fs.readdir('./images', (err, files) => {// Liste des images présentes dans le dossier images
              if (files.length > 0) {
                  files.forEach(file => {
                    if (!arrImagesDB.includes(file)) {
                      fs.unlink(`images/${file}`, () => console.log(`Previous image : ${file} has been deleted`) )
                    }
                  });
              }
          });
          res.status(200).json(sauces);
      })
      .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
      .then(sauce => res.status(200).json(sauce))
      .catch(error => res.status(400).json({ error }));
};



exports.updateSauce = (req, res, next) => {
  const sauceObject = req.file ?
  {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`} : { ...req.body }

  Sauce.updateOne({ _id : req.params.id}, {...sauceObject, _id: req.params.id})
  .then(res.status(200).json({ message : "Sauce modifiée"}))
  .catch(error => res.status(400).json({ error }))
}

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id : req.params.id })
  .then(sauce => {
    const filename = sauce.imageUrl.split("/images/")[1]
    fs.unlink(`images/${filename}`, () => {
      Sauce.deleteOne({_id : req.params.id})
  .then(res.status(200).json({ message: "Sauce supprimée" }))
  .catch(error => res.status(400).json({ error }))
  
    })
  })
  .catch(error => res.status(500).json({ error }))
}

exports.likeDislikeSauce = (req, res, next) => {
  let like = req.body.like
  let userId = req.body.userId
  let sauceId = req.params.id
  
  switch (like) {
    case 1 :
        Sauce.updateOne({ _id: sauceId }, { $push: { usersLiked: userId }, $inc: { likes: +1 }})
          .then(() => res.status(200).json({ message: `J'aime` }))
          .catch((error) => res.status(400).json({ error }))
            
      break;

    case 0 :
        Sauce.findOne({ _id: sauceId })
           .then((sauce) => {
            if (sauce.usersLiked.includes(userId)) { 
              Sauce.updateOne({ _id: sauceId }, { $pull: { usersLiked: userId }, $inc: { likes: -1 }})
                .then(() => res.status(200).json({ message: `Neutre` }))
                .catch((error) => res.status(400).json({ error }))
            }
            if (sauce.usersDisliked.includes(userId)) { 
              Sauce.updateOne({ _id: sauceId }, { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 }})
                .then(() => res.status(200).json({ message: `Neutre` }))
                .catch((error) => res.status(400).json({ error }))
            }
          })
          .catch((error) => res.status(404).json({ error }))
      break;

    case -1 :
        Sauce.updateOne({ _id: sauceId }, { $push: { usersDisliked: userId }, $inc: { dislikes: +1 }})
          .then(() => { res.status(200).json({ message: `Je n'aime pas` }) })
          .catch((error) => res.status(400).json({ error }))
      break;
      
      
      default:
        console.log(error);
  }
}