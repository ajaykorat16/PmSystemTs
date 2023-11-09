import express, { Router } from 'express';
import { check } from 'express-validator';
import { auth } from '../middleware/auth';

import { createCredential, getCredential, getSingleCredential, updateCredential, deleteCredential } from '../controllers/credential';

const credentialRouter: Router = express.Router();

credentialRouter.get("/", auth, getCredential);

credentialRouter.get("/single-credential/:id", auth, getSingleCredential);

credentialRouter.post("/search-credential", auth, getCredential);

credentialRouter.post("/create",
    [
        check('title', 'Title is required.').notEmpty(),
        check('description', 'Description is required.').notEmpty(),
    ],
    auth,
    createCredential
);

credentialRouter.put("/update/:id", auth, updateCredential);

credentialRouter.delete("/delete/:id", auth, deleteCredential);

export { credentialRouter };
