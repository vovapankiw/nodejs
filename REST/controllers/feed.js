const { validationResult } = require('express-validator');
const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: '1',
         title: 'First Post', 
         content: 'This is the first post!',
         imageUrl: 'images/dummy.jpg',
         creator: {
           name: 'Vova',
         },
         createdAt: new Date(),
      }
    ]
  });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).json({message: 'Validation failed', errors: errors.array()})
  }
  
  const title = req.body.title;
  const content = req.body.content;
  const post = new Post ({
    title: title,
    content: content,
    imageUrl: 'images/dummy.jpg',
    creator: {
      name: 'Vova'
    },
  });

  post.save()
  .then(result => {
    res.status(201).json({
      message: 'Post created successfully!',
      post: result,
    });
  })
  .catch(console.log)
};
