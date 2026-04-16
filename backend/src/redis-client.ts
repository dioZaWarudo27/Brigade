import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();




const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
    socket:{
        connectTimeout: 5000,
        reconnectStrategy:(retries)=>{
            if(retries > 5){
                console.log("[REDIS] Max retries reached. Giving up.")
                return false
            }
            return 1000;
        }
    }
});

redisClient.on('error', (err) => {
    if(err.code === 'ECONNREFUSED'){

    }else{
        console.error('❌ Redis Client Error:', err);
    }
    
});

redisClient.on('connect', () => {
    console.log('🚀 Barbell\'s Brigade: Redis connection established');
});

// Auto-connect on module load (ESM top-level await would be cleaner, but this is more compatible)
(async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (err) {
        console.error('⚠️ Redis failed to connect. Caching will be disabled.', err);
    }
})();

export default redisClient;
