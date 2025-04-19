import express from 'express';
import jwt from 'jsonwebtoken';
const router = express.Router();

router.post('/', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 
  
  if (!token) {
    return res.status(401).json({ valid: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    return res.status(200).json({ 
      valid: true, 
      message: 'Token is valid', 
      decoded 
    });
  } catch (error) {
    return res.status(401).json({ 
      valid: false, 
      message: 'Invalid token', 
      error: error.message 
    });
  }
});

export default router;