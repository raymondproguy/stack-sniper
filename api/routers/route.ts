import { Router } from 'express';
import { snipeController } from '../controller/snipe';
const router = Router();

router.get("/snipe", snipeController)

/*
router.get('/snipe', (req, res) => {
    const error = req.query.error;
    
    console.log('Received error:', error);
    
    res.json({
        error: error,
        message: 'StackSniper is working!',
        solutions: [
            'Test solution 1',
            'Test solution 2'
        ]
    });
});

*/
export default router;
