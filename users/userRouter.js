const express = require('express');

const router = express.Router();
const Users = require('./userDb');
const Posts = require('../posts/postDb')

router.post('/', validateUser, (req, res) => {
  const newUser = req.body;
  if (!newUser.name) {
    res.status(404).json({ message: `please specify a name for new user`});
  }
  Users.insert(newUser)
    .then(user => {
      res.status(201).json({ message: `${user.name} is added to DB with id ${user.id}` })
    })
    .catch(err => res.status(500).json({ error: err }));
});

router.post('/:id/posts', validateUserId, validatePost, (req, res) => {
  const newPost = {
    user_id: req.body.id,
    text: req.body.text
  }

  Posts.insert(newPost)
    .then(post => {
      res.status(201).json(post)
    })
    .catch(err => res.status(500).json(err));

});

router.get('/', (req, res) => {
  Users.get()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => res.status(500).json(err)) 
});

router.get('/:id', validateUserId, (req, res) => {
  if (req.user) {
    res.status(200).json(req.user);
  } else {
    res.status(500).json({ error: "error connecting to the server"});
  }
  // no need to the previos code, as middleware handles everything above

  // const { id } = req.params;
  // Users.getById(id)
  //   .then(user => {
  //     if (user) {
  //       res.status(200).json(user);
  //     } else {
  //       res.status(404).json({message: `user with id ${id} does not exist`});
  //     }
  //   })
  //   .catch(err => res.status(500).json(err));
});

router.get('/:id/posts', validateUserId, (req, res) => {
  const { id } = req.params;
  Users.getUserPosts(id)
    .then(posts => {
      if (posts.length > 0) {
        res.status(200).json(posts);
      } else {
        res.status(404).json({message: `there are not posts for with the user id ${id}`});
      }
    })
    .catch(err => res.status(500).json(err));
});

router.delete('/:id', validateUserId, (req, res) => {
  const { id } = req.params;
  Users.remove(id)
    .then(response => {
      if (response > 0) {
        res.status(201).json({message: "sad.... you deleted that user"});
      } else {
        res.status(404).json({ error: `user with id ${id} doesn't exist`})
      }
    })
    .catch(err => res.status(500).json(err));
});

router.put('/:id', validateUserId, (req, res) => {
  const editedUser = {
    name: req.body.name,
    id: req.params.id
  }
  Users.update(editedUser.id, editedUser)
    .then(response => {
      if (response > 0) {
        res.status(200).json({message: `name changed to ${editedUser.name}`});
      } else {
        res.status(404).json({ error: `user with id ${id} doesn't exist`})
      }
    })
    .catch(err => res.status(500).json({ error: err }));
});

//custom middleware

function validateUserId(req, res, next) {
  const { id } = req.params;

  Users.getById(id)
  .then(user => {
    if (user) {
      req.user = user;
      next();
    } else {
      res.status(400).json({ message: "invalid user id" });
    }
  });
};

function validateUser(req, res, next) {
  if (!req.body) {
    res.status(400).json({ message: "missing user data" })
  } else if (!req.body.name) {
    res.status(400).json({ message: "missing required name field" })
  }
  next();
};

function validatePost(req, res, next) {
  if (!req.body) {
    res.status(400).json({ message: 'missing post data' })
  } else if (!req.body.text) {
    res.status(400).json({ message: 'missing required text field' })
  } else if (!req.body.id) {
    res.status(400).json({ message: 'missing required id of the user' })
  } 
  next();
};

module.exports = router;
