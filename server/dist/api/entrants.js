import express from 'express';
const router = express.Router();
router.post('/', async (req, res) => {
    try {
        res.status(200);
    }
    catch (error) {
        console.log(error);
    }
});
export default router;
