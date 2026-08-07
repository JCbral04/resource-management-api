/**
 * Middleware de logging personalizado
 * Registra metodo, URL, timestamp y IP del cliente
 */
const loggingMiddleware = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const { method, originalUrl, ip } = req;
    
    console.log(`[${timestamp}] ${method} ${originalUrl} - IP: ${ip}`);
    
    // Calcular tiempo de respuesta
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${timestamp}] ${method} ${originalUrl} - Status: ${res.statusCode} - ${duration}ms`);
    });
    
    next();
  };
  
  module.exports = loggingMiddleware;